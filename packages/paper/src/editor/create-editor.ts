import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import type { Extension } from "@codemirror/state";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder as placeholderExt } from "@codemirror/view";
import type { AnchorStatus } from "./anchor";
import { blockSyntaxHiding } from "./extensions/block-syntax-hiding";
import { blockquoteKeymap } from "./extensions/blockquote-keys";
import { changeNotifier } from "./extensions/change-notifier";
import { codeBlockCopy } from "./extensions/code-block-copy";
import { codeBlockEnter } from "./extensions/code-block-enter";
import { highlightLayer } from "./extensions/highlight-layer";
import type { ImageResolver } from "./extensions/image-drop";
import { imageDrop } from "./extensions/image-drop";
import { imageWidget } from "./extensions/image-widget";
import { inlineSyntaxHiding } from "./extensions/inline-syntax-hiding";
import { listRendering } from "./extensions/list-rendering";
import { markdownExtension } from "./extensions/markdown";
import { markdownCopy } from "./extensions/markdown-copy";
import { pasteTableConvert } from "./extensions/paste-table-convert";
import { readOnlyState } from "./extensions/read-only";
import type { SelectionInfo } from "./extensions/selection-notifier";
import { selectionNotifier } from "./extensions/selection-notifier";
import type { SlashItemsConfig } from "./extensions/slash-command";
import { slashCommand } from "./extensions/slash-command";
import { tableAutoConvert } from "./extensions/table-auto-convert";
import { tableWidget } from "./extensions/table-widget";
import type { TokenSpec } from "./extensions/token-render";
import { tokenRender } from "./extensions/token-render";
import type { TriggerSpec } from "./extensions/trigger-menu";
import { triggerMenu } from "./extensions/trigger-menu";
import { baseTheme, type ColorScheme, darkThemeStyle, sizeTheme } from "./theme";
export { defaultSlashItems } from "./extensions/slash-command";
export type { SlashItemsConfig, SlashItemSpec } from "./extensions/slash-command";
export type { TokenSpec, TokenView } from "./extensions/token-render";
export type { TriggerItem, TriggerSpec } from "./extensions/trigger-menu";

/** Options passed by the component consumer — the injection point for editor behavior policy */
export interface EditorOptions {
  /**
   * Initial document body (markdown). Empty document if unspecified. Not a live prop (ADR-0013 decision 4):
   * wholesale replacement is commanded via ref.setValue(). DEV sample documents and the like are passed by the consumer (App).
   */
  doc?: string;
  /**
   * Callback receiving the full markdown on every user edit (ADR-0013). Held during IME composition, fired once after it settles (ADR-0004).
   * Programmatic replacement such as setValue does not echo back. No internal debounce — debouncing is the consumer's responsibility.
   */
  onChange?: (value: string) => void;
  /**
   * Callback deciding where a dropped/pasted image file is placed and which URL references it.
   * Upload/storage is the consumer's responsibility (outside the editor's scope). Default if unspecified = blob: in-session URL.
   */
  onInsertImage?: ImageResolver;
  /**
   * Extends/replaces the slash menu items (consumer config, ADR-0012). Default items if unspecified.
   * - flat array → full replacement  - function `(defaults) => items` → derive from defaults (recommended)
   * The transformer may return a `Promise` to load the catalog **asynchronously** (resolved once on
   * first open, then filtered locally; a "Loading…" row shows meanwhile), and each item may carry an
   * optional `group` to render section headers (ADR-0012 amendment).
   */
  slashItems?: SlashItemsConfig;
  /**
   * Declarative autocomplete triggers beyond the slash menu — `@` mentions, `[[` wikilinks (ADR-0016).
   * Each spec is `{ trigger, minQueryLength?, onQuery, onSelect? }`; `onQuery` may be async (stale
   * responses discarded, never acted on mid-IME). Consumer config (ADR-0012 family) — insertion stays
   * a declarative markdown string; no `EditorView` is exposed. Reserve `/` for the slash menu.
   */
  triggers?: readonly TriggerSpec[];
  /**
   * Render markdown substrings matching a `pattern` as **atomic tokens** — e.g. an inserted mention
   * `[@Grace Hopper](user:u_003)` shown as a chip the caret steps over and one Backspace deletes whole
   * (ADR-0017). Declarative (`render(match) => { label, className? }`); the markdown stays the source of
   * truth (round-trips on copy). Pairs with `triggers` (#498/#499): triggers insert, tokens render.
   */
  tokens?: readonly TokenSpec[];
  /**
   * Callback for the highlight re-resolution status map (ADR-0014 surface step). Mainly changes on load/delete.
   * The highlight *list* is replaced imperatively (core: setHighlightsEffect / React: highlights prop).
   */
  onHighlightStatusChange?: (statuses: Map<string, AnchorStatus>) => void;
  /** Reports a highlight click (ADR-0014 decision 6). The consumer opens a comment panel etc. */
  onHighlightClick?: (id: string) => void;
  /**
   * Reports a selection (ADR-0014 decisions 5/6). sel = { text, anchor(snapped), rect(screen coords) }, null for an empty selection.
   * The consumer draws the floating action button from rect. Held during IME composition, fired after it settles.
   */
  onSelect?: (sel: SelectionInfo | null) => void;
  /**
   * Light/dark scheme. "system" (default) follows the OS `prefers-color-scheme`; "light"/"dark" force
   * the scheme regardless of OS. Live-flippable via `setColorScheme(view, …)` without recreating the editor.
   */
  colorScheme?: ColorScheme;
  /**
   * Hint shown on an empty document (ADR-0018). Plain text; rendered by CodeMirror's `placeholder`
   * extension and hidden as soon as the document is non-empty.
   */
  placeholder?: string;
  /**
   * Read-only mode (ADR-0018). Sets `EditorState.readOnly` + turns off `EditorView.editable`, so
   * typing/IME/drag-edit and the doc-mutating entry points (image drop/paste, table cell editing,
   * paste-to-table) are all inert; native selection and the copy buttons keep working. Live-flippable
   * via `setReadOnly(view, …)` (React: the `readOnly` prop) without recreating the editor.
   */
  readOnly?: boolean;
  /**
   * Fixed editor height (any CSS length, e.g. `"25rem"`) — the editor scrolls internally when content
   * exceeds it (ADR-0018). Unset = grow-with-content. Fixed at creation (not a live prop).
   */
  height?: string;
  /**
   * Minimum editable height (any CSS length) — the editor grows with content but never shorter than
   * this, and the *editable surface itself* fills the reserved height, so clicking anywhere in it
   * places a cursor (the dead-zone fix, #501). Fixed at creation (not a live prop).
   */
  minHeight?: string;
}

/** The full extension set of the production editor — tests use this as-is too */
export function editorExtensions(opts: EditorOptions = {}): Extension[] {
  return [
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorView.lineWrapping,
    baseTheme,
    darkThemeStyle(opts.colorScheme),
    sizeTheme(opts.height, opts.minHeight),
    // Read-only intent + contenteditable off, in a compartment so setReadOnly flips it live (ADR-0018).
    readOnlyState(opts.readOnly),
    opts.placeholder ? placeholderExt(opts.placeholder) : [],
    markdownExtension(),
    // Atomic token rendering (ADR-0017). Placed before inlineSyntaxHiding so a token's full-range
    // replace widget takes precedence over the link's inner syntax-hide on matched ranges.
    tokenRender(opts.tokens),
    inlineSyntaxHiding(),
    blockSyntaxHiding(),
    imageWidget(),
    imageDrop(opts.onInsertImage),
    codeBlockCopy(),
    listRendering(),
    codeBlockEnter,
    tableWidget(),
    // blockquoteKeymap (Enter/Tab/Shift-Tab) is Prec.highest, so it beats markdownKeymap (Prec.high).
    // Placed after the slash menu (slashCommand, which also uses Enter/Tab at the same highest prec) so it yields to it.
    slashCommand(opts.slashItems),
    // Declarative consumer triggers (@ / [[), ADR-0016. Coexists with the slash menu; its keymap is
    // also Prec.highest but only one menu is ever open (distinct triggers), so they don't fight.
    triggerMenu(opts.triggers),
    blockquoteKeymap,
    tableAutoConvert(),
    pasteTableConvert(),
    markdownCopy(),
    changeNotifier(opts.onChange),
    highlightLayer({
      onHighlightStatusChange: opts.onHighlightStatusChange,
      onHighlightClick: opts.onHighlightClick,
    }),
    selectionNotifier(opts.onSelect),
  ];
}

export function createEditor(parent: HTMLElement, opts: EditorOptions = {}): EditorView {
  const state = EditorState.create({ doc: opts.doc ?? "", extensions: editorExtensions(opts) });
  return new EditorView({ state, parent });
}
