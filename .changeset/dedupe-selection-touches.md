---
"@beaket/paper": patch
---

refactor(paper): extract the duplicated `selectionTouches` helper into `editor/extensions/selection-utils.ts`

Root cause: the Live-Preview reveal-on-cursor predicate `selectionTouches(state, from, to)` was
copy-pasted verbatim into three extensions (`code-block-render.ts`, `footnote-render.ts`,
`inline-syntax-hiding.ts`). A future correction to its boundary handling — e.g. a collapsed caret
sitting exactly at `from`/`to` — would have to land in all three, with the risk that only one copy
gets updated.

Fix: a single exported `selectionTouches` now lives in `editor/extensions/selection-utils.ts`; the
three extensions import it. The logic is byte-identical (inclusive on both ends), so behavior is
unchanged. A `selection-utils.test.ts` pins the contract with the four boundary cases (collapsed
caret at `from`, at `to`, strictly inside, strictly outside) plus a non-collapsed overlap.
