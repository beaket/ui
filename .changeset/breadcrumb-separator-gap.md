---
"@beaket/ui": patch
---

Breadcrumb: widen the gap around the separator from 4px to 8px.

At `gap-1` the separator sat 4px from the labels on both sides, which reads as
one crowded string rather than a trail. DESIGN.md spends 4px on icon gaps and
8px on control gaps; a separator standing between two labels belongs to the
latter. `Breadcrumb.List` and `Breadcrumb.Item` both move to `gap-2`, so the
spacing is symmetric whether the separator is composed inside the item (as the
shipped examples do) or as a sibling in the list.
