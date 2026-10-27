---
"@beaket/paper": patch
---

Keep the slash menu and `@`/`[[` trigger menus closed when an IME composition starts right after the trigger character. Before this fix, a menu could open in the middle of a composition, and the trigger's `onQuery` could receive a partial syllable such as `ㄱ`.

Root cause: `update()` skips composing updates, but the evaluation it schedules with `setTimeout` did not check `view.composing` again when it ran. When a composition started between the trigger keystroke and that timeout, for example during fast typing or on a busy main thread, `evaluate()` read the document mid-composition. The slash menu then rendered its popup during the composition, against invariant #1, and the trigger menu called `onQuery` with the uncommitted text. `evaluate()` now returns early while composing, and `composingWake` runs it again after `compositionend`.
