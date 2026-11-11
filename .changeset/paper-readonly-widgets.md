---
"@beaket/paper": patch
---

Stop `readOnly` from being bypassed by widget buttons. The task checkbox, the table's add-column and add-row buttons, and the column/row grip menu dispatched document changes directly and never consulted `view.state.readOnly`, so a read-only editor still toggled checkboxes, grew tables and fired `onChange`. The checkbox handler, `openMenu`, `addRow`, `addRowAndFocus`, `addColumn`, `replaceTable` and `deleteTable` now return early when the editor is read-only (#1239).
