# 0003 — Cell editing happens in a CodeMirror subview on the focused cell only

- **Status:** Accepted
- **Date:** 2026-06-13
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# The cell editor is a CodeMirror subview shown only on the focused cell

Within the table widget, we mount one small CodeMirror instance on the single cell currently being edited, and have it share transactions with the body document (a shared-document subview model, as in Zettlr 4; the approach demonstrated by the CM6 split view example). The alternative we considered — a contenteditable cell plus serialization (a contenteditable-cell-with-serialization model, as in Joplin) — is lighter, but it forces us to hand-implement the IME composing guard, cursor restoration, and undo integration ourselves, and those are precisely the most dangerous parts under our CJK-first principle. With a CM subview, IME handling is taken over wholesale by CM, undo is automatically unified across the whole document, and editing behavior inside a cell becomes 100% identical to editing in the body.

Mandatory implementation conditions: a sync annotation to prevent transaction re-emission; an implementation of `estimatedHeight` / `coordsAt` on the widget (to prevent scroll jumps); no rebuild of the widget DOM while `view.composing` is in progress; and immediate reflection of cell edits into the document (no deferred saving). Basis: a UX survey of comparable live-preview editors; see [ADR-0002](./0002-table-structure-syntax-permanently-hidden.md).
