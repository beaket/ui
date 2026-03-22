---
"@beaket/ui": minor
---

Add button mode to Pagination component and refactor DataTable to use it

Pagination now supports `mode="button"` with an `onPageChange` callback for client-side pagination, in addition to the existing `mode="link"` (default) with `buildPageUrl` for SSR-friendly navigation.

DataTable's inline pagination has been replaced with the shared Pagination component, gaining ellipsis support for large page counts and ensuring visual consistency.
