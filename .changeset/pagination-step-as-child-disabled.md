---
"@beaket/ui": patch
---

Fix `Pagination.Previous` and `Pagination.Next` with `asChild` ignoring the disabled state on the first and last page. The `asChild` branch of `PaginationStep` applied the disabled classes to the consumer's element but never marked it disabled, so a router link was announced as enabled and still navigated, unlike the button and link paths, which set `disabled` and `aria-disabled`. The branch now sets `aria-disabled="true"` and `tabIndex={-1}` on the disabled edge and cancels its click (#1187).
