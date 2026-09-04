---
"@beaket/ui": minor
---

`data-slot` on every element DataTable renders

`data-table.tsx` was the only component in the registry with **zero** `data-slot` attributes, so its entire DOM was unaddressable from outside — part of why it compensates with `getRowClassName` and a 20-prop interface.

Hyrum's Law says something becomes the contract whether we choose it or not. `data-slot` is the blessed observable: stable, named, free at runtime, and explicitly not the class names, which are ours to rewrite on every redesign.

24 of the 28 rendered elements now carry a `data-table-*` slot — `data-table`, `-toolbar`, `-search`, `-search-icon`, `-container`, `-table`, `-header`, `-header-row`, `-select-head`, `-head`, `-head-content`, `-sort-indicator`, `-sort-icon`, `-body`, `-row`, `-select-cell`, `-cell`, `-empty-row`, `-empty-cell`, `-empty`, `-footer`, `-summary`.

The other four are composed controls — `Input`, two `Checkbox`es and `Pagination` — which keep their own slots rather than being overwritten; they are addressable through the named container around each.

Attributes only. No API change.
