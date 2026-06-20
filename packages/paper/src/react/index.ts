// `@beaket/paper/react` entry — thin wrapper only (ADR-0013 exports map). React = optional peerDep.
export { Paper } from "./paper";
export type { PaperHandle, PaperProps } from "./paper";
// Color scheme prop type ("light" | "dark" | "system") for the `colorScheme` prop.
export type { ColorScheme } from "../editor/theme";
// Re-export the highlight input type (core-owned, ADR-0014).
export type { Anchor, AnchorStatus } from "../editor/anchor";
export type { HighlightInput } from "../editor/extensions/highlight-layer";
export type { SelectionInfo } from "../editor/extensions/selection-notifier";
// The `onInsertImage` prop type, so consumers can annotate their own resolver.
export type { ImageResolver } from "../editor/extensions/image-drop";
// The slash-menu config type (the `slashItems` prop) and item shape.
export type { SlashItemSpec, SlashItemsConfig } from "../editor/create-editor";
