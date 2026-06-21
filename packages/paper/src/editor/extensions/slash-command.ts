import type { Extension } from "@codemirror/state";
import { Facet } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { composingRefresh, composingWake } from "./composing-guard";
import { type MenuController, menuKeymap, menuTheme, PopupMenu } from "./menu-engine";
import { activateCell } from "./table-widget";

// Slash Command (CONTEXT.md): the insert menu opened from an empty position with `/`
// (+ CJK alternate triggers `、` `；` `／`). While composing (IME), open/close/filtering is
// deferred (composing guard). CJK triggers are everyday punctuation, so the menu only opens
// once the query is at least 1 char long (minQueryLength prevents false triggers).
//
// Items can be extended/replaced by the embedding consumer via `EditorOptions.slashItems` (ADR-0012).
// The public contract (SlashItemSpec) is declarative (does not expose EditorView); privileged
// actions like `activateCell` are not exposed and are reattached internally via the built-in ID.

/**
 * The **public** declarative spec for a slash menu item (ADR-0012).
 * Does not expose EditorView — insert is a pure markdown string (single source of truth = markdown).
 */
export interface SlashItemSpec {
  /** Stable ID held only by built-ins. Consumer items omit it (no privileged action, stable across label changes). */
  id?: string;
  label: string;
  /** For filter matching — aliases beyond label (English, etc.). Defaults to '' if absent. */
  keywords?: string;
  /** The markdown string to insert */
  insert: string;
  /** Cursor position after insertion (offset from insertion start). Defaults to end of insertion. */
  cursorOffset?: number;
  /**
   * Optional section header this item sits under (ADR-0012 amendment). A header is rendered whenever
   * `group` changes from the previous item's, so the consumer clusters items by ordering them — the
   * same "array order = display order" rule as the rest of the spec. Items without a `group` render
   * with no header.
   */
  group?: string;
}

/**
 * How a consumer treats the default items (ADR-0012):
 * - flat array → complete replacement (only their own items)
 * - function → derive from defaults (recommended). Returned array order = display order. May return a
 *   `Promise` to load the catalog **asynchronously** (ADR-0012 amendment): the catalog is resolved
 *   once on first open and cached, then filtered synchronously per keystroke. Per-query async sources
 *   are deliberately not offered here — that is what the `triggers` API (ADR-0016) is for.
 */
export type SlashItemsConfig =
  | SlashItemSpec[]
  | ((defaults: SlashItemSpec[]) => SlashItemSpec[] | Promise<SlashItemSpec[]>);

/** Internal item — includes the privileged action (after). Not exposed. */
interface SlashItem {
  label: string;
  keywords: string;
  insert: string;
  cursorOffset?: number;
  group?: string;
  /** Post-processing after insertion (activating a table cell, etc.). from = insertion start position */
  after?: (view: EditorView, from: number) => void;
}

const TABLE_2X2 = "| Column 1 | Column 2 |\n| --- | --- |\n|  |  |";

/**
 * Privileged action registry — keys by ID the things that cannot be expressed by a declarative
 * insert alone (EditorView-dependent). Outside the public contract. If a built-in spec's id is
 * here, after is reattached during resolution.
 */
const BUILTIN_BEHAVIORS: Record<string, (view: EditorView, from: number) => void> = {
  table: (view, from) => {
    // Immediately enter editing of the first cell (table entry point: insert a small table directly without asking for size)
    activateCell(view, view.state.doc.lineAt(from).from, 0, 0);
  },
};

/** Default slash items (public — exported so a transformer can cherry-pick). */
export const defaultSlashItems: SlashItemSpec[] = [
  { id: "table", label: "Table", keywords: "table 2x2", insert: TABLE_2X2 },
  { id: "h1", label: "Heading 1", keywords: "h1 heading1", insert: "# " },
  { id: "h2", label: "Heading 2", keywords: "h2 heading2", insert: "## " },
  { id: "h3", label: "Heading 3", keywords: "h3 heading3", insert: "### " },
  { id: "bullet", label: "Bullet list", keywords: "bullet list", insert: "- " },
  { id: "checkbox", label: "Checkbox", keywords: "checkbox todo task", insert: "- [ ] " },
  { id: "quote", label: "Quote", keywords: "quote blockquote", insert: "> " },
  {
    id: "codeblock",
    label: "Code block",
    keywords: "code codeblock",
    insert: "```\n\n```",
    cursorOffset: 4,
  },
];

function specToItem(spec: SlashItemSpec): SlashItem {
  return {
    label: spec.label,
    keywords: spec.keywords ?? "",
    insert: spec.insert,
    cursorOffset: spec.cursorOffset,
    group: spec.group,
    // The privileged action is reattached internally via the built-in ID, not via the public spec (ADR-0012 decision 3)
    after: spec.id ? BUILTIN_BEHAVIORS[spec.id] : undefined,
  };
}

/** The pure, synchronous spec→item mapper. Async resolution rides this once the specs have settled. */
function specsToItems(specs: SlashItemSpec[]): SlashItem[] {
  return specs.map(specToItem);
}

/**
 * consumer config → specs. May be async (the transformer returned a `Promise`, ADR-0012 amendment),
 * so it returns `specs | Promise<specs>`; the sync path is untouched and immediate.
 * - unspecified → default items  - flat array → complete replacement  - function → derive from a copy
 */
function resolveSlashConfig(config?: SlashItemsConfig): SlashItemSpec[] | Promise<SlashItemSpec[]> {
  if (typeof config === "function") return config(defaultSlashItems.map((s) => ({ ...s })));
  return config ?? defaultSlashItems;
}

/**
 * consumer config → internal item list, **synchronously** (ADR-0005 unit-test target). Unchanged for
 * sync configs; an async transformer is resolved through the plugin's cached catalog, not here, so a
 * Promise result yields an empty list rather than slipping into the sync map.
 */
export function resolveSlashItems(config?: SlashItemsConfig): SlashItem[] {
  const specs = resolveSlashConfig(config);
  return specs instanceof Promise ? [] : specsToItems(specs);
}

/** A rendered slash row: a selectable item, or a non-interactive group header / "Loading…" row. */
export type SlashMenuRow = (SlashItem & { header?: false }) | { header: true; label: string };

/**
 * Filter the catalog by `query` and weave in group section headers (ADR-0012 amendment). Pure and
 * coordinate-independent → the jsdom contract-test seam (ADR-0005). A header is emitted whenever a
 * surviving item's `group` differs from the previous survivor's, so: a group whose items all filter
 * out shows **no** header; non-contiguous same-group runs repeat the header (the consumer owns
 * clustering); ungrouped items render with no header.
 */
export function buildMenuRows(items: SlashItem[], query: string): SlashMenuRow[] {
  const q = query.toLowerCase();
  const rows: SlashMenuRow[] = [];
  let lastGroup: string | undefined;
  for (const item of items) {
    if (!item.label.toLowerCase().includes(q) && !item.keywords.toLowerCase().includes(q)) continue;
    if (item.group !== undefined && item.group !== lastGroup) {
      rows.push({ header: true, label: item.group });
    }
    rows.push(item);
    lastGroup = item.group;
  }
  return rows;
}

/** The non-interactive row shown while an async catalog is still resolving (ADR-0012 amendment). */
const LOADING_ROW: SlashMenuRow = { header: true, label: "Loading…" };

/** **Internal** facet that carries the raw consumer config to the plugin (resolved there; not public). */
const slashConfigFacet = Facet.define<SlashItemsConfig | undefined, SlashItemsConfig | undefined>({
  combine: (values) => values[0],
});

const TRIGGER_RE = /(?:^|\s)([/、；／])(\S*)$/;

/**
 * The slash menu controller. Trigger matching + internal filtering + the privileged apply (line
 * split, `after`) are slash-specific and stay here; the menu DOM / nav / keymap / overlay are the
 * shared engine (`PopupMenu`, ADR-0016). Note the slash menu filters a static list internally —
 * unlike the consumer trigger menu, whose source (`onQuery`) does its own filtering.
 */
class SlashMenu implements MenuController {
  private readonly popup: PopupMenu<SlashMenuRow>;
  private triggerPos = -1;
  /** The resolved catalog, filtered synchronously per keystroke. `null` until first resolved. */
  private catalog: SlashItem[] | null = null;
  private loading = false;

  constructor(private readonly view: EditorView) {
    this.popup = new PopupMenu(
      view,
      { menu: "cm-slash-menu", selected: "cm-slash-selected", header: "cm-slash-header" },
      (row) => {
        if (!row.header) this.apply(row);
      },
    );
  }

  get isOpen(): boolean {
    return this.popup.isOpen;
  }

  /**
   * Resolve the catalog **lazily on first open** and cache it (ADR-0012 amendment): a consumer who
   * never opens the menu pays no fetch. Sync configs resolve immediately; an async transformer flips
   * `loading` (so the next render shows a Loading row) and, once settled, re-evaluates through the
   * IME-guarded path — never rebuilding DOM mid-composition (invariant #1).
   */
  private ensureCatalog(): void {
    if (this.catalog !== null || this.loading) return;
    const resolved = resolveSlashConfig(this.view.state.facet(slashConfigFacet));
    if (resolved instanceof Promise) {
      this.loading = true;
      // Re-evaluate only if the menu is still open (and not composing): if the user pressed Escape, or
      // the editor was destroyed, while the catalog was loading, the resolved fetch must not reopen the
      // dismissed menu (close() leaves the trigger text in place, so evaluate would re-match) nor act on
      // a dead view. The `.catch` re-evaluates too, so a rejected fetch clears the Loading row at once.
      const settle = () => {
        this.loading = false;
        if (!this.view.composing && this.popup.isOpen) setTimeout(() => this.evaluate());
      };
      resolved
        .then((specs) => {
          this.catalog = specsToItems(specs);
          settle();
        })
        .catch(() => {
          this.catalog = [];
          settle();
        });
    } else {
      this.catalog = specsToItems(resolved);
    }
  }

  update(update: ViewUpdate): void {
    // While composing, defer all open/close/filtering decisions (CJK first-class)
    if (update.view.composing) return;
    const woken = update.transactions.some((tr) => tr.annotation(composingRefresh));
    if (!update.docChanged && !update.selectionSet && !woken) return;
    // Do DOM/dispatch work outside the CM update cycle
    setTimeout(() => this.evaluate());
  }

  private evaluate(): void {
    const { state } = this.view;
    const sel = state.selection.main;
    if (!sel.empty || !this.view.hasFocus) return this.close();

    const line = state.doc.lineAt(sel.head);
    const before = line.text.slice(0, sel.head - line.from);
    const match = TRIGGER_RE.exec(before);
    if (!match) return this.close();

    const [, trigger, query] = match;
    // CJK alternate triggers are everyday punctuation — don't open before a query has begun
    if (trigger !== "/" && query.length < 1) return this.close();

    this.triggerPos = sel.head - query.length - 1;
    this.ensureCatalog();
    // Async catalog still loading → a single non-interactive Loading row (ADR-0012 amendment).
    if (this.loading) {
      this.popup.open(this.triggerPos, [LOADING_ROW]);
      return;
    }
    const rows = buildMenuRows(this.catalog ?? [], query);
    // No selectable item survived the filter (or the catalog resolved empty) → close, as before.
    if (!rows.some((row) => !row.header)) return this.close();
    this.popup.open(this.triggerPos, rows);
  }

  moveSelection(delta: -1 | 1): void {
    this.popup.moveSelection(delta);
  }

  applySelected(): void {
    this.popup.applySelected();
  }

  private apply(item: SlashItem): void {
    const head = this.view.state.selection.main.head;
    const line = this.view.state.doc.lineAt(this.triggerPos);
    // If a block element is triggered mid-line, split the line
    const needsNewline = this.triggerPos > line.from && item.insert.includes("|");
    const insert = (needsNewline ? "\n" : "") + item.insert;
    const from = this.triggerPos;
    const cursor =
      item.cursorOffset !== undefined
        ? from + (needsNewline ? 1 : 0) + item.cursorOffset
        : from + insert.length;
    this.view.dispatch({
      changes: { from, to: head, insert },
      selection: { anchor: Math.min(cursor, from + insert.length) },
      userEvent: "input",
    });
    const insertedFrom = from + (needsNewline ? 1 : 0);
    this.close();
    item.after?.(this.view, insertedFrom);
  }

  close(): void {
    this.popup.close();
    this.triggerPos = -1;
  }

  destroy(): void {
    this.close();
  }
}

const slashPlugin = ViewPlugin.fromClass(SlashMenu);

const slashKeymap = menuKeymap((view) => view.plugin(slashPlugin));

export function slashCommand(config?: SlashItemsConfig): Extension {
  return [composingWake, slashConfigFacet.of(config), slashPlugin, slashKeymap, menuTheme];
}
