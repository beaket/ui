---
"@beaket/ui": patch
---

fix(button): outline hovers on the accent edge, not a grey fill

The outline button was airy at rest but filled with a grey wash on hover
(`hover:bg-bg-hover`) on top of its accent edge growing — two signals at once,
and the fill read as muddy against the paper. Outline now drops the grey fill on
hover and held-open and leans on the accent edge it already grows (from the base
grammar); the press keeps a faint grey settle (`active:bg-bg-active`) to confirm
the drop. Ghost is unchanged: with no edge, its grey fill is its only hover
signal. No token or palette change — `bg-hover` is a shared, already-light token;
this was a grammar fix, not a color one.
