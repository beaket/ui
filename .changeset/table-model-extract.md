---
"@beaket/paper": patch
---

refactor(table): extract the pure parse/serialize model into `table-model.ts`

Root cause: `extensions/table-widget.ts` had grown to ~1,600 lines covering four distinct concerns
(pure model, widget DOM/grid rendering, cell subview sync, keymap handlers) in one file, so a change
to any one concern required reading the whole file for context and risked touching the others.

This is the first, lowest-risk split: the pure model layer — `parseAligns`, `parseRowCells`,
`parseTable`, `serializeRow`, `serializeDelimiter`, and the `TableAlign` / `CellRange` / `TableData`
types — moves to a new `extensions/table-model.ts` (no view/DOM dependency; state-only). It already
had its own `table-model.test.ts`, now pointed at the new module. `table-widget.ts` imports what it
needs from there. Behavior is unchanged (move only); the full suite stays green.

Also documents the previously-undocumented table keymap invariants (in-cell Tab/Enter/Shift-Enter/
arrow-escape, the two-step Backspace select-then-delete, and the boundary-newline guard) in
`packages/paper/docs/DECISIONS.md`.
