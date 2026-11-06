---
"@beaket/ui": patch
---

Fix `Field` crashing any descendant that takes a render-prop child. `prepareFieldParts` walked the whole child tree with `Children.map` and re-cloned every element that had `children`, but `Children.map` turns a function child into an empty array, so the component then threw `children is not a function`. The walk now leaves an element alone when its `children` is a function.
