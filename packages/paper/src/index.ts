// `@beaket/paper` core entry (vanilla) — zero React imports (ADR-0013 exports map, decision 1).
// The framework-agnostic core is the main body. The React wrapper is a separate subpath `./react` (src/react/index.ts).
export { createEditor, defaultSlashItems } from "./editor/create-editor";
export type {
  CodeBlockRenderContext,
  CodeBlockRenderer,
  CodeBlockRenderers,
  EditorOptions,
  SlashItemSpec,
  SlashItemsConfig,
  TriggerItem,
  TriggerSpec,
} from "./editor/create-editor";
// Color scheme: the `colorScheme` option plus a live-flip helper (no recreation) for vanilla consumers.
export { setColorScheme } from "./editor/theme";
export type { ColorScheme } from "./editor/theme";
// Read-only: the `readOnly` option plus a live-flip helper (no recreation) for vanilla consumers (ADR-0018).
export { setReadOnly } from "./editor/extensions/read-only";
// The `onInsertImage` option/prop type, so consumers can annotate their own resolver.
export type { ImageResolver } from "./editor/extensions/image-drop";
// Anchor pure functions (ADR-0014 step A). Vanilla core consumers use these for selection→anchor→re-resolution directly.
// React consumers receive them via the props surface (highlights/onSelect, next step), so direct calls are rare.
export { createAnchor, resolveAnchor } from "./editor/anchor";
export type { Anchor, AnchorStatus, ResolvedAnchor } from "./editor/anchor";
// Highlight surface (ADR-0014). The vanilla core replaces the list via setHighlightsEffect.
export { setActiveHighlightEffect, setHighlightsEffect } from "./editor/extensions/highlight-layer";
export type { HighlightInput } from "./editor/extensions/highlight-layer";
export type { SelectionInfo } from "./editor/extensions/selection-notifier";
