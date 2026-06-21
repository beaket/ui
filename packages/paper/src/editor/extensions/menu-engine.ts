import { Prec } from "@codemirror/state";
import type { KeyBinding } from "@codemirror/view";
import { EditorView, keymap } from "@codemirror/view";

// Shared popup-menu engine for trigger-activated menus (the slash menu `/`, ADR-0012; and the
// declarative consumer triggers `@` / `[[`, ADR-0016). It owns the parts that are identical across
// both — the menu DOM, the selected-index state, keyboard navigation, the porcelain overlay, and the
// coordinate placement — so neither menu reimplements them. What differs (trigger matching, item
// resolution, and the apply/dispatch) stays in the driving controller; the engine only calls back
// `onApply(row)` when a row is chosen. This generalization is the subject of ADR-0016.

/** Minimal shape the engine needs to render one menu row. Controllers extend it with their own fields. */
export interface MenuRow {
  label: string;
  /**
   * A non-interactive row — a group section header or a "Loading…" placeholder (ADR-0012 amendment).
   * Rendered as plain text, never a button: not clickable, and keyboard navigation skips it.
   */
  header?: boolean;
}

/** Per-menu class names — kept distinct so the stable `.cm-slash-menu` consumer hook is preserved. */
export interface MenuClasses {
  /** Class on the menu container (e.g. `cm-slash-menu`). */
  menu: string;
  /** Class on the selected row button (e.g. `cm-slash-selected`). */
  selected: string;
  /** Class on a non-interactive header/loading row (e.g. `cm-slash-header`). */
  header: string;
}

/**
 * The popup menu: DOM + selected-index + keyboard nav, driven by a controller. Coordinate-dependent
 * (`coordsAtPos`) so it does not render under jsdom (invariant #4) — its logic is verified in the
 * browser; the controllers' pure matching/resolution is the jsdom contract-test target (ADR-0005).
 */
export class PopupMenu<T extends MenuRow> {
  private el: HTMLElement | null = null;
  /** The selectable (non-header) rows, in display order — `selected` indexes into this, never headers. */
  private items: T[] = [];
  private selected = 0;

  constructor(
    private readonly view: EditorView,
    private readonly classes: MenuClasses,
    private readonly onApply: (row: T) => void,
  ) {}

  get isOpen(): boolean {
    return this.el !== null;
  }

  /**
   * (Re)open at the given source position. `rows` may interleave non-interactive header rows
   * (`row.header`) with selectable items; headers render as plain text and are skipped by selection.
   * The selected index is preserved across re-filtering (clamped to the selectable rows).
   */
  open(anchorPos: number, rows: T[]): void {
    const coords = this.view.coordsAtPos(anchorPos);
    this.closeDOM();
    if (!coords) return;

    const items = rows.filter((row) => !row.header);
    this.items = items;
    this.selected =
      items.length === 0 ? -1 : Math.max(0, Math.min(this.selected, items.length - 1));

    const menu = document.createElement("div");
    menu.className = this.classes.menu;
    let itemIndex = 0;
    for (const row of rows) {
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
 * The keyboard bindings shared by every menu (Arrow/Enter/Tab/Escape). Each binding is a no-op
 * (returns `false`, so the keypress falls through) unless this controller's menu is open — which is
 * how the slash menu and the trigger menu coexist at the same `Prec.highest` without fighting.
 */
export function menuKeyBindings(
  getController: (view: EditorView) => MenuController | null | undefined,
): KeyBinding[] {
  const whenOpen =
    (run: (c: MenuController) => void) =>
    (view: EditorView): boolean => {
      const c = getController(view);
      if (!c?.isOpen) return false;
      run(c);
      return true;
    };
  return [
    { key: "ArrowDown", run: whenOpen((c) => c.moveSelection(1)) },
    { key: "ArrowUp", run: whenOpen((c) => c.moveSelection(-1)) },
    { key: "Enter", run: whenOpen((c) => c.applySelected()) },
    { key: "Tab", run: whenOpen((c) => c.applySelected()) },
    { key: "Escape", run: whenOpen((c) => c.close()) },
  ];
}

/** Wrap menu bindings at the precedence the menus need (above markdownKeymap; see `create-editor.ts`). */
export function menuKeymap(getController: (view: EditorView) => MenuController | null | undefined) {
  return Prec.highest(keymap.of(menuKeyBindings(getController)));
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
