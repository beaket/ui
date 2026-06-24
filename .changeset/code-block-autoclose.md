---
"@beaket/paper": minor
---

Auto-close fenced code blocks: pressing Enter at the end of an opening fence line (` ``` `, ` ```js `, `~~~`, …) inserts the matching closing fence and parks the cursor on a blank middle line, so you get a ready-to-fill block instead of an unterminated fence.

Implemented as `codeBlockAutoClose`, a `Prec.high` Enter keymap alongside `codeBlockEnter` (disjoint cases: this owns the opening delimiter line, `codeBlockEnter` the content lines). It only fires when the cursor is at the end of an unterminated opening fence — a closed block (two `CodeMark` children in the `FencedCode` node) is left untouched, so no double-close. Honors the IME composing guard and read-only state. Leading indentation is preserved on the inserted lines.
