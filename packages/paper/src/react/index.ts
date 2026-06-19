// `@beaket/paper/react` entry — thin wrapper only (ADR-0013 exports map). React = optional peerDep.
export { Paper } from "./Paper";
export type { PaperHandle, PaperProps } from "./Paper";
// Re-export the highlight input type (core-owned, ADR-0014).
export type { Anchor, AnchorStatus } from "../editor/anchor";
export type { HighlightInput } from "../editor/extensions/highlightLayer";
export type { SelectionInfo } from "../editor/extensions/selectionNotifier";
// The `onInsertImage` prop type, so consumers can annotate their own resolver.
export type { ImageResolver } from "../editor/extensions/imageDrop";
// The slash-menu config type (the `slashItems` prop) and item shape.
export type { SlashItemSpec, SlashItemsConfig } from "../editor/createEditor";
