import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import type { Extension } from "@codemirror/state";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { AnchorStatus } from "./anchor";
import { blockquoteKeymap } from "./extensions/blockquoteKeys";
import { blockSyntaxHiding } from "./extensions/blockSyntaxHiding";
import { changeNotifier } from "./extensions/changeNotifier";
import { codeBlockCopy } from "./extensions/codeBlockCopy";
import { codeBlockEnter } from "./extensions/codeBlockEnter";
import { highlightLayer } from "./extensions/highlightLayer";
import type { ImageResolver } from "./extensions/imageDrop";
import { imageDrop } from "./extensions/imageDrop";
import { imageWidget } from "./extensions/imageWidget";
import { inlineSyntaxHiding } from "./extensions/inlineSyntaxHiding";
import { listRendering } from "./extensions/listRendering";
import { markdownExtension } from "./extensions/markdown";
import { markdownCopy } from "./extensions/markdownCopy";
import { pasteTableConvert } from "./extensions/pasteTableConvert";
import type { SelectionInfo } from "./extensions/selectionNotifier";
import { selectionNotifier } from "./extensions/selectionNotifier";
import type { SlashItemsConfig } from "./extensions/slashCommand";
import { slashCommand } from "./extensions/slashCommand";
import { tableAutoConvert } from "./extensions/tableAutoConvert";
import { tableWidget } from "./extensions/tableWidget";
import { baseTheme } from "./theme";
export { defaultSlashItems } from "./extensions/slashCommand";
export type { SlashItemsConfig, SlashItemSpec } from "./extensions/slashCommand";

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
   */
  slashItems?: SlashItemsConfig;
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
}

/** The full extension set of the production editor — tests use this as-is too */
export function editorExtensions(opts: EditorOptions = {}): Extension[] {
  return [
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorView.lineWrapping,
    baseTheme,
    markdownExtension(),
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
