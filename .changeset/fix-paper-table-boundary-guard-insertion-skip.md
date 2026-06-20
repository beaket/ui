---
"@beaket/paper": patch
---

`tableBoundaryGuard` walked the full syntax tree on every `docChanged` transaction, including pure insertions (normal typing, `fromA === toA`), which can never delete a boundary newline and can never be blocked. Root cause: the guard's `syntaxTree().iterate()` ran unconditionally before the check that actually uses it. Fix: scan `tr.changes` once up-front; if no change has `toA > fromA` (no deletion or replacement), return the transaction immediately without walking the tree — eliminating the tree walk on the common keystroke path.
