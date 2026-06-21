---
"@beaket/paper": minor
---

Add three table-stakes embedding options to `EditorOptions` (and the `<Paper>` props) — child ⑤ of the embedding/extensibility epic (#501, ADR-0018). They replace the CSS hacks and the unsafe `getView()` reconfigure consumers reached for before.

- `placeholder?: string` — a hint shown on an empty document (CodeMirror's `placeholder`), hidden once there is text. Fixed at creation.
- `readOnly?: boolean` — a view mode that flips **live** via `setReadOnly(view, …)` (React: the `readOnly` prop), no recreation. It sets **both** `EditorState.readOnly` and `EditorView.editable`, with an explicit, coherent behavior matrix: typing/IME, image drop & paste ingest, paste-to-table, table auto-convert, and **table cell editing** are all inert, while native selection and the markdown/code copy buttons keep working. Because `EditorState.readOnly` does not block a raw `view.dispatch` (CM6 design), each doc-mutating entry point guards on `view.state.readOnly` itself — most importantly the table cell subview, which is a separate `EditorView` the parent's `editable` does not reach (guarded at the mousedown entry and in `mount()`).
- `height?: string` / `minHeight?: string` — explicit sizing instead of CSS-by-accident. `height` is a fixed height that scrolls internally past it; `minHeight` is a grow-with-content floor sized on the **editable surface** (`.cm-content`) so clicking anywhere in the reserved height places a cursor — fixing the dead-zone repro where a short/empty document left a non-focusable gap below the content (#501). The `minHeight` rule is scoped to the top-level editable (a direct child combinator) so the nested table-cell subview is never ballooned. Both fixed at creation.

`sizeRules` and the readOnly/placeholder wiring are jsdom contract tests (the editable/readOnly facets, the live `setReadOnly` flip, placeholder rendering, and the table cell-edit guard); the rendered grow-vs-scroll geometry and click-anywhere-focuses are browser-verified in the `sites/paper` playground (invariant #4), which now uses the `minHeight` option in place of its former hand-rolled `.cm-content` CSS.
