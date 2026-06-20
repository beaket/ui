# 0004 — Decoration handling during composition is a contract of "defer recompute + map coordinates + re-evaluate after end"

- **Status:** Accepted
- **Date:** 2026-06-13
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Decoration handling during composition is a contract of "defer recompute + map coordinates + re-evaluate after end"

Every extension that produces a decoration passes through the shared guard (`guardedDecorations`). At first we defined this guard's responsibility as nothing more than "do not recompute while an IME is composing (`view.composing`)" — but that was an incomplete contract. Because the act of composition itself mutates the document, leaving the existing decorations untouched lets their coordinates drift out of alignment. This is especially dangerous for a replace decoration that covers a whole line — such as hiding a code-block fence — where the drifted coordinates encroach on a line break and surface as `RangeError: Decorations that replace line breaks may not be specified via plugins`, which aborts the CM update. The view is then left broken, and every subsequent command (including Cmd+A) dies (confirmed as a real-world bug on 2026-06-13).

The contract therefore has three parts: ① while composing, never call `compute` (no decoration recompute, no widget rebuild — this is the CJK first-class rule); ② nevertheless, if the document changed during composition (`docChanged`), carry the existing decorations forward to their new coordinates with `decorations.map(update.changes)` — "deferring" is not "abandoning"; ③ after `compositionend`, re-evaluate exactly once via a wake transaction. This contract is pinned by `composing-guard.test.ts` (the contract test) and `ime-composition.test.ts` (the regression test); when modifying the guard, any change that breaks these tests is forbidden from merging.

A corollary lesson: when validating a synthetic IME, checking only the logs ("defer"/"recompute") is insufficient. To catch this class of bug you must also assert decoration-coordinate validity and the behavior of follow-on commands.
