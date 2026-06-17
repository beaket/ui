// `@beaket/editor` core entry (vanilla) — zero React imports (ADR-0013 exports map, decision 1).
// The framework-agnostic core is the main body. The React wrapper is a separate subpath `./react` (src/react/index.ts).
export { createEditor, defaultSlashItems } from "./editor/createEditor";
export type { EditorOptions, SlashItemSpec, SlashItemsConfig } from "./editor/createEditor";
// Anchor pure functions (ADR-0014 step A). Vanilla core consumers use these for selection→anchor→re-resolution directly.
// React consumers receive them via the props surface (highlights/onSelect, next step), so direct calls are rare.
export { createAnchor, resolveAnchor } from "./editor/anchor";
export type { Anchor, AnchorStatus, ResolvedAnchor } from "./editor/anchor";
// Highlight surface (ADR-0014). The vanilla core replaces the list via setHighlightsEffect.
export { setActiveHighlightEffect, setHighlightsEffect } from "./editor/extensions/highlightLayer";
export type { HighlightInput } from "./editor/extensions/highlightLayer";
export type { SelectionInfo } from "./editor/extensions/selectionNotifier";
