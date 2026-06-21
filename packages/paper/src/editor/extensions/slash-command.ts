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
}

/**
 * How a consumer treats the default items (ADR-0012):
 * - flat array → complete replacement (only their own items)
 * - function → derive from defaults (recommended). Returned array order = display order.
 */
export type SlashItemsConfig = SlashItemSpec[] | ((defaults: SlashItemSpec[]) => SlashItemSpec[]);

/** Internal item — includes the privileged action (after). Not exposed. */
interface SlashItem {
  label: string;
  keywords: string;
  insert: string;
  cursorOffset?: number;
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
    // The privileged action is reattached internally via the built-in ID, not via the public spec (ADR-0012 decision 3)
    after: spec.id ? BUILTIN_BEHAVIORS[spec.id] : undefined,
  };
}

/**
 * consumer config → internal item list. A pure function (coordinate-independent), so it is a
 * unit-test target (ADR-0005).
 * - unspecified → default items
 * - flat array → complete replacement
 * - function → derive by passing a copy of defaults (prevents mutating the original)
 */
export function resolveSlashItems(config?: SlashItemsConfig): SlashItem[] {
  const specs =
    typeof config === "function"
      ? config(defaultSlashItems.map((s) => ({ ...s })))
      : (config ?? defaultSlashItems);
  return specs.map(specToItem);
}

/** **Internal** facet that carries the resolved items to the plugin (not public). */
const slashItemsFacet = Facet.define<SlashItem[], SlashItem[]>({
  combine: (values) => values[0] ?? resolveSlashItems(),
});

const TRIGGER_RE = /(?:^|\s)([/、；／])(\S*)$/;

/**
 * The slash menu controller. Trigger matching + internal filtering + the privileged apply (line
 * split, `after`) are slash-specific and stay here; the menu DOM / nav / keymap / overlay are the
 * shared engine (`PopupMenu`, ADR-0016). Note the slash menu filters a static list internally —
 * unlike the consumer trigger menu, whose source (`onQuery`) does its own filtering.
 */
class SlashMenu implements MenuController {
  private readonly popup: PopupMenu<SlashItem>;
  private triggerPos = -1;

  constructor(private readonly view: EditorView) {
    this.popup = new PopupMenu(
      view,
      { menu: "cm-slash-menu", selected: "cm-slash-selected" },
      (item) => this.apply(item),
    );
  }

  get isOpen(): boolean {
    return this.popup.isOpen;
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
    const q = query.toLowerCase();
    const items = state.facet(slashItemsFacet);
    const filtered = items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q),
    );
    if (filtered.length === 0) return this.close();
    this.popup.open(this.triggerPos, filtered);
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
  return [
    composingWake,
    slashItemsFacet.of(resolveSlashItems(config)),
    slashPlugin,
    slashKeymap,
    menuTheme,
  ];
}
