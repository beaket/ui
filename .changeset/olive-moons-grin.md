---
"@beaket/ui": patch
---

Dialog, Sheet, DropdownMenu, Table and Avatar attach their parts with one `Object.assign`

These five files attached parts by post-hoc mutation (`Dialog.Title = DialogTitle`) while the other six compound components used a single `Object.assign`. One expression is the complete public surface, instead of a surface scattered down the file and dependent on statement order — and TypeScript's expando-function support means a typo in `Dialog.Titel = …` quietly adds a property rather than failing.

Identical public shape. Nothing to change when re-copying.
