---
"@beaket/ui": patch
---

`DataTable` now applies changes to the `pageSize` prop after mount. The prop was passed only through TanStack's `initialState`, which is read once, so a "rows per page" selector driving it had no effect. The prop is now synced into the table with `table.setPageSize`.
