---
"@beaket/paper": patch
---

Make a table deletable from its grip menu.

The row/column grip menus offered only "Delete row" / "Delete column", and both silently no-op'd
on the last remaining row or column (`rows.length <= 1` / `cols <= 1`) — so a small table could not
be removed from the menu at all (reported as "can't delete the table"). Keyboard deletion already
worked (block-select via Escape or a second Backspace, then Backspace), but the menu — the
discoverable path — had no way out.

Add a "Delete table" item to both grip menus, and make "Delete row" / "Delete column" on the last
row/column delete the whole table rather than no-op. Deletion removes the table's own lines and
leaves the surrounding blank lines, matching the block-select Backspace path. Covered by
`table-delete.test.ts`.
