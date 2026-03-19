---
"@beaket/ui": patch
---

Fix accessibility and UX issues across 9 components

- DataTable: add `aria-sort` on sortable headers and `scope="col"` for screen reader table navigation
- ViewToggle: make `label` required for icon-only buttons (a11y)
- Skeleton: add `role="status"` and `aria-label` for screen readers
- Select: fix focus ring to use `focus-visible:` consistently
- Badge: add missing `data-slot="badge"`
- Avatar: add dev warning when `alt` prop is missing on Avatar.Image
- Radio: fix broken disabled indicator dot color using `group-disabled` pattern
- Navigation: add `transition-shadow`, `active:shadow-offset-active`, suppress shadow/hover when active
- Switch: fix disabled+checked state showing green, improve thumb contrast when disabled
