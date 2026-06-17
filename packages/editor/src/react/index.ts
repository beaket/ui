// `@beaket/editor/react` entry — thin wrapper only (ADR-0013 exports map). React = optional peerDep.
export { BeaketEditor } from "./BeaketEditor";
export type { BeaketEditorHandle, BeaketEditorProps } from "./BeaketEditor";
// Re-export the highlight input type (core-owned, ADR-0014).
export type { Anchor, AnchorStatus } from "../editor/anchor";
export type { HighlightInput } from "../editor/extensions/highlightLayer";
export type { SelectionInfo } from "../editor/extensions/selectionNotifier";
