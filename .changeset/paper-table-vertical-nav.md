---
"@beaket/paper": patch
---

Fix vertical cursor navigation landing on blank separator lines below a table (#520).

The table widget's `<table>` had no margin reset, so a host/global `table { margin }` rule (common in markdown CSS — the docs site ships `table { margin: 1rem 0 }`) applied to it. The widget wrap is `position: relative` with `padding: 0`, so that margin collapses out above/below the block widget. CodeMirror measures only the wrap's box for its height map, so the escaped margin desynced the height map from the actual DOM for everything below the table. `posAtCoords` (which arrow-key vertical motion uses) then mapped a screen y to the line one below the visually-correct one, so ↑/↓ around the table skipped onto blank lines.

Resetting `.cm-table-widget table { margin: 0 }` keeps the widget's DOM footprint equal to what the height map measures (block rhythm already comes from the blank lines, per the existing `padding: 0` design). The selector outspecifies a bare `table` rule, so it holds without `!important`. Verified in-browser (geometry is jsdom-carved-out per ADR-0005): ↑/↓ across the table, the exact issue repro (cell → ↓↓ → paragraph), non-zero goal columns, and content above the table all land on the expected lines.
