import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

// Shared popup-menu engine. It owns the parts every popup menu in the package needs — the menu DOM,
// the selected-index state, keyboard navigation, the porcelain overlay, the placement, and the
// scroll/resize rules that keep a fixed menu glued to its anchor (#541, #471) — so no menu
// reimplements them. What differs (trigger matching, item resolution, and the apply/dispatch) stays
// in the driving controller; the engine only calls back `onApply(row)` when a row is chosen. This
// generalization is the subject of ADR-0016.
//
// Three controllers drive it: the slash menu `/` (ADR-0012) and the declarative consumer triggers
// `@` / `[[` (ADR-0016), both typed and anchored to a document position; and the table's column/row
// grip menu, clicked and anchored to the grip element. `MenuOptions` carries exactly what differs
// between a typed menu and a clicked one.

/** Minimal shape the engine needs to render one menu row. Controllers extend it with their own fields. */
export interface MenuRow {
  label: string;
  /**
   * A non-interactive row — a group section header or a "Loading…" placeholder (ADR-0012 amendment).
   * Rendered as plain text, never a button: not clickable, and keyboard navigation skips it.
   */
  header?: boolean;
  /** A non-interactive separator rule between groups of actions. Skipped by selection, like `header`. */
  divider?: boolean;
}

/** Per-menu class names — kept distinct so the stable `.cm-slash-menu` consumer hook is preserved. */
export interface MenuClasses {
  /** Class on the menu container (e.g. `cm-slash-menu`). */
  menu: string;
  /** Class on the selected row button (e.g. `cm-slash-selected`). */
  selected: string;
  /** Class on a non-interactive header/loading row (e.g. `cm-slash-header`). */
  header: string;
  /** Class on a separator row. Only needed by menus that emit `divider` rows. */
  divider?: string;
}

/** What differs between a typed-trigger menu and a clicked-grip menu. */
export interface MenuOptions {
  /**
   * Highlight the first selectable row on open. True for the keyboard-driven trigger menus, where
   * Enter applies the selection; false for a pointer-driven menu, which has no keyboard selection.
   */
  selectFirst?: boolean;
  /** Close on a mousedown outside the menu. For a menu with no trigger text to close it (#471). */
  closeOnOutsideClick?: boolean;
  /**
   * Whether IME composition is in flight, so a re-place never takes the close branch mid-compose
   * (CJK first-class, #483). Defaults to the main view; a menu whose typing happens in a nested
   * subview (the table's cell editor) must report that subview instead.
   */
  composing?: () => boolean;
}

/** Where the menu hangs: a document position, or an element (a grip button) it is pinned under. */
export type MenuAnchor = number | HTMLElement;

/**
 * The popup menu: DOM + selected-index + keyboard nav, driven by a controller. Placement is
 * coordinate-dependent, so a position-anchored menu does not mount under jsdom (invariant #4) and is
 * verified in the browser; the controllers' pure matching/resolution is the jsdom contract-test
 * target (ADR-0005). An element-anchored menu does mount under jsdom (a detached-element rect is
 * zeroed, not absent), which is what the table's grip-menu tests rely on.
 */
export class PopupMenu<T extends MenuRow> {
  private el: HTMLElement | null = null;
  /** The selectable (non-header) rows, in display order — `selected` indexes into this, never headers. */
  private items: T[] = [];
  private selected = 0;
  /** What the menu is anchored to, so it can be re-placed from live coords on scroll/resize. */
  private anchor: MenuAnchor = 0;
  /** Bound scroll/resize handler that keeps the menu glued to its anchor (#541). */
  private readonly reposition = (): void => this.place();
  /** Bound outside-mousedown handler, present only while an opt-in menu is open. */
  private outsideClick: ((event: MouseEvent) => void) | null = null;

  constructor(
    private readonly view: EditorView,
    private readonly classes: MenuClasses,
    private readonly onApply: (row: T) => void,
    private readonly options: MenuOptions = {},
  ) {}

  /** The anchor's live viewport rect, or null once it is gone (scrolled out of the doc, detached). */
  private anchorRect(): { left: number; top: number; right: number; bottom: number } | null {
    if (typeof this.anchor === "number") return this.view.coordsAtPos(this.anchor);
    return this.anchor.isConnected ? this.anchor.getBoundingClientRect() : null;
  }

  get isOpen(): boolean {
    return this.el !== null;
  }

  /**
   * (Re)open at the given source position. `rows` may interleave non-interactive header rows
   * (`row.header`) with selectable items; headers render as plain text and are skipped by selection.
   * The selected index is preserved across re-filtering (clamped to the selectable rows).
   */
  open(anchor: MenuAnchor, rows: T[]): void {
    this.closeDOM();
    this.anchor = anchor;
    const coords = this.anchorRect();
    if (!coords) return;

    const items = rows.filter((row) => !row.header && !row.divider);
    this.items = items;
    this.selected =
      items.length === 0 || this.options.selectFirst === false
        ? -1
        : Math.max(0, Math.min(this.selected, items.length - 1));

    const menu = document.createElement("div");
    menu.className = this.classes.menu;
    let itemIndex = 0;
    for (const row of rows) {
      if (row.divider) {
        const rule = document.createElement("div");
        if (this.classes.divider) rule.className = this.classes.divider;
        menu.appendChild(rule);
        continue;
      }
      if (row.header) {
        const head = document.createElement("div");
        head.className = this.classes.header;
        head.textContent = row.label;
        menu.appendChild(head);
        continue;
      }
      const i = itemIndex++;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = row.label;
      if (i === this.selected) btn.classList.add(this.classes.selected);
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", () => this.onApply(row));
      menu.appendChild(btn);
    }
    menu.style.left = `${coords.left}px`;
    menu.style.top = `${coords.bottom + 4}px`;
    // Attach to view.dom so the EditorView.theme scope (under .cm-editor) applies.
    this.view.dom.appendChild(menu);
    this.el = menu;
    // Keep the fixed-position menu glued to its anchor on scroll/resize, and close it when the anchor
    // scrolls out of the editor viewport (#541). capture:true catches the inner .cm-scroller's scroll,
    // which does not bubble; passive since we never preventDefault.
    window.addEventListener("scroll", this.reposition, { capture: true, passive: true });
    window.addEventListener("resize", this.reposition);
    if (this.options.closeOnOutsideClick) {
      this.outsideClick = (event) => {
        if (!menu.contains(event.target as Node)) this.close();
      };
      document.addEventListener("mousedown", this.outsideClick, true);
    }
  }

  /**
   * Re-place the menu from the anchor's live coords, or close it if the anchor has scrolled out of the
   * editor's scroll viewport. Skipped during IME composition: a re-place is harmless but the close
   * branch must never fire mid-compose (CJK first-class, #483) — the menu self-corrects on the next event.
   */
  private place(): void {
    if (!this.el || (this.options.composing?.() ?? this.view.composing)) return;
    const coords = this.anchorRect();
    const scroller = this.view.scrollDOM.getBoundingClientRect();
    // Close once the anchor scrolls out of the scroller viewport — vertically or horizontally
    // (.cm-scroller scrolls sideways for wide tables), else the fixed menu floats over empty chrome.
    if (
      !coords ||
      coords.bottom < scroller.top ||
      coords.top > scroller.bottom ||
      coords.right < scroller.left ||
      coords.left > scroller.right
    ) {
      this.close();
      return;
    }
    this.el.style.left = `${coords.left}px`;
    this.el.style.top = `${coords.bottom + 4}px`;
  }

  moveSelection(delta: -1 | 1): void {
    if (!this.el || this.items.length === 0) return;
    this.selected = (this.selected + delta + this.items.length) % this.items.length;
    // Only selectable rows are <button>s, so the button list aligns 1:1 with `this.items`.
    this.el.querySelectorAll("button").forEach((btn, i) => {
      const on = i === this.selected;
      btn.classList.toggle(this.classes.selected, on);
      if (on) btn.scrollIntoView({ block: "nearest" });
    });
  }

  applySelected(): void {
    const row = this.items[this.selected];
    if (row) this.onApply(row);
  }

  close(): void {
    this.closeDOM();
    this.selected = 0;
    this.items = [];
  }

  private closeDOM(): void {
    if (this.el) {
      window.removeEventListener("scroll", this.reposition, { capture: true });
      window.removeEventListener("resize", this.reposition);
    }
    if (this.outsideClick) {
      document.removeEventListener("mousedown", this.outsideClick, true);
      this.outsideClick = null;
    }
    this.el?.remove();
    this.el = null;
  }
}

/** A controller that drives a `PopupMenu` — the keymap routes navigation to whichever menu is open. */
export interface MenuController {
  readonly isOpen: boolean;
  moveSelection(delta: -1 | 1): void;
  applySelected(): void;
  close(): void;
}

/**
 * The keyboard bindings shared by every menu (Arrow/Enter/Tab/Escape), at the precedence the menus
 * need (above markdownKeymap; see `create-editor.ts`). Each binding is a no-op (returns `false`, so
 * the keypress falls through) unless this controller's menu is open — which is how the slash menu and
 * the trigger menu coexist at the same `Prec.highest` without fighting.
 */
export function menuKeymap(getController: (view: EditorView) => MenuController | null | undefined) {
  const whenOpen =
    (run: (c: MenuController) => void) =>
    (view: EditorView): boolean => {
      const c = getController(view);
      if (!c?.isOpen) return false;
      run(c);
      return true;
    };
  return Prec.highest(
    keymap.of([
      { key: "ArrowDown", run: whenOpen((c) => c.moveSelection(1)) },
      { key: "ArrowUp", run: whenOpen((c) => c.moveSelection(-1)) },
      { key: "Enter", run: whenOpen((c) => c.applySelected()) },
      { key: "Tab", run: whenOpen((c) => c.applySelected()) },
      { key: "Escape", run: whenOpen((c) => c.close()) },
    ]),
  );
}

/**
 * The porcelain overlay shared by both menus (ADR-0009: hard offset shadow, radius 0). A single
 * exported constant so both `slashCommand()` and `triggerMenu()` reference the same `Extension`
 * instance — CM6 dedups it by identity, so including it from both adds no second StyleModule.
 */
export const menuTheme = EditorView.theme({
  ".cm-slash-menu, .cm-trigger-menu": {
    position: "fixed",
    zIndex: "20",
    backgroundColor: "var(--paper)",
    border: "1px solid var(--silver)",
    boxShadow: "var(--shadow-overlay)",
    padding: "4px",
    display: "flex",
    flexDirection: "column",
    minWidth: "160px",
    // Keep many items from overflowing the viewport (stay lightweight — normally not visible, ADR-0012 decision 5)
    maxHeight: "40vh",
    overflowY: "auto",
  },
  ".cm-slash-menu button, .cm-trigger-menu button": {
    border: "none",
    background: "none",
    textAlign: "left",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "var(--ink)",
  },
  ".cm-slash-menu button:hover, .cm-trigger-menu button:hover": {
    backgroundColor: "var(--frost)",
  },
  ".cm-slash-menu button.cm-slash-selected, .cm-trigger-menu button.cm-trigger-selected": {
    backgroundColor: "var(--accent-sel)",
    color: "var(--accent)",
  },
  // Non-interactive header / "Loading…" row (ADR-0012 amendment): a muted, uppercased label, set
  // apart from the items. No hover/selection — it is never a button.
  ".cm-slash-header, .cm-trigger-header": {
    padding: "6px 10px 2px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--steel)",
    userSelect: "none",
  },
});
