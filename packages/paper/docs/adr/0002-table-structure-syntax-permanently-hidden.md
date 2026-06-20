# 0002 — Table structure syntax is permanently hidden; a table is always a cell-editing widget

- **Status:** Accepted
- **Date:** 2026-06-13
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Table structure syntax is permanently hidden; a table is always a cell-editing widget

In Live Preview, a table is always rendered as a grid widget whose cells are edited directly (the grid-with-direct-cell-editing model), and there is no path that exposes the structural syntax — the pipes and the delimiter row — to the user (the always-rendered-table model). Per-table source access is a known power-user pain point in live-preview editors, but that complaint comes from a power-user positioning. Our primary persona is "someone who does not know markdown," so we judge the trade-off differently — the `|` syntax is precisely the central difficulty this project sets out to hide.

We reviewed the scenarios where source access is genuinely needed and concluded the following. A broken table is not recognized as a table by the parser, so it naturally unfolds back into plain text; this gives us a recovery path for free. The document's substance is still markdown, so copy and export are unaffected. A per-table source toggle for power users is a low-cost add-on — it amounts to "just don't draw the widget" — so we will adopt it later if the need is demonstrated. Inline syntax inside a cell (`**bold**`, etc.) shows its raw form only in the cell currently being edited, which is consistent with the editor-wide Live Preview behavior.

Technical premises (verified by research): a block widget with a nested in-cell editor is the only sound approach in CM6, and it is essential that (1) the widget DOM is never reconstructed during IME composition (`view.composing`), and (2) cell edits sync to the document immediately (no deferred saving). Source: per a UX survey of table editing.
