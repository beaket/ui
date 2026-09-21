---
"@beaket/paper": patch
---

Route the table's column/row structure menu through the shared `PopupMenu` engine.

The grip menu was a third hand-rolled popup alongside the slash menu and the trigger
menu — its own fixed-position placement, its own scroll/resize glue, its own
"close once the anchor leaves the scroller" rule (#541), its own outside-click
close (#471). `menu-engine.ts` exists so those parts are written once, and ADR-0016
already called for future menu surfaces to reuse it; the grip menu now does,
anchored to the grip element instead of a document position.

The engine gained exactly what a clicked menu needs and a typed one does not, each
defaulting to the previous behavior for the two existing menus: an element anchor,
separator rows, an opt-in outside-click close, an opt-out of highlighting the first
row (a pointer-driven menu has no keyboard selection to show), and an overridable
source for "is an IME composing". That last one is load-bearing rather than
cosmetic: the grip menu's typing happens in the table's **cell subview**, not the
main view, and the reposition handler must not take its close branch mid-compose
(#483). The table reports the subview; every other menu reports the main view.

Also folded three verbatim copies of `selectionTouchesLine` and two inline copies of
its range predicate into `selection-utils.ts`, which exists for exactly that, and
dropped a permanently-off `DEBUG` tracer (and the now-unused label argument it was
the only reader of) from the IME composition guard.
