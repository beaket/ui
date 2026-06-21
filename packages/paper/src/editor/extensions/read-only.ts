import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

// Read-only mode (ADR-0018). Two CM6 facets move together:
// - `EditorState.readOnly` — the *intent* flag built-in commands consult to opt out (typing,
//   delete, the markdown/blockquote keymaps, etc.). It does NOT block a raw `view.dispatch`
//   (CM6 design), so doc-mutating DOM handlers (imageDrop, paste-table-convert) and the table
//   cell-edit entry guard on `view.state.readOnly` themselves — see ADR-0018's behavior matrix.
// - `EditorView.editable` — flips the content DOM's `contenteditable` off, so the browser itself
//   blocks typing/IME/drag-edit and the editor stops being a text-input target. Native selection
//   (and therefore the copy buttons, which dispatch nothing to the doc) keeps working.
//
// Both live in one compartment so `setReadOnly` can flip the mode live without recreating the editor
// (which would wipe the document) — the same live-flip pattern as `setColorScheme` (theme.ts).
const readOnlyCompartment = new Compartment();

function readOnlyFacets(readOnly: boolean): Extension {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)];
}

/** Initial read-only wiring, in a compartment so `setReadOnly` can reconfigure it live. */
export function readOnlyState(readOnly = false): Extension {
  return readOnlyCompartment.of(readOnlyFacets(readOnly));
}

/** Live-flips read-only mode without recreating the editor (so the document is preserved). */
export function setReadOnly(view: EditorView, readOnly: boolean): void {
  view.dispatch({ effects: readOnlyCompartment.reconfigure(readOnlyFacets(readOnly)) });
}
