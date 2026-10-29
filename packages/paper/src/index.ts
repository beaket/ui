// `@beaket/paper` core entry (vanilla) — zero React imports (ADR-0013 exports map, decision 1).
// The framework-agnostic core is the main body. The React wrapper is a separate subpath `./react` (src/react/index.ts).
export { createEditor, defaultSlashItems } from "./editor/create-editor";
// createEditor returns a PaperEditor handle (ADR-0024): IME-safe setValue/setHighlights, live
// setColorScheme/setReadOnly, and the unsafe getView() hatch. No other export names a CM6 type.
export type {
  CodeBlockRenderContext,
  CodeBlockRenderer,
  CodeBlockRenderers,
  EditorOptions,
  PaperEditor,
  SlashItemSpec,
  SlashItemsConfig,
  TokenSpec,
  TokenView,
  TriggerItem,
  TriggerSpec,
} from "./editor/create-editor";
export type { ColorScheme } from "./editor/theme";
// The `onInsertImage` option/prop type, so consumers can annotate their own resolver.
export type { ImageResolver } from "./editor/extensions/image-drop";
// Anchor re-resolution (ADR-0014): a pure function over the markdown string. Anchors themselves come
// from onSelect's `sel.anchor`, so capturing one needs no editor internals.
export { resolveAnchor } from "./editor/anchor";
export type { Anchor, AnchorStatus, ResolvedAnchor } from "./editor/anchor";
// Highlight surface (ADR-0014). The vanilla core replaces the list via editor.setHighlights().
export type { HighlightInput } from "./editor/extensions/highlight-layer";
export type { SelectionInfo } from "./editor/extensions/selection-notifier";
