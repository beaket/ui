---
---

Stories-only refactor (batch 2 — the functional components): fold the
per-permutation stories into the Button-style shape and collapse each
component's several per-behavior `*Test` stories into one consolidated
`InteractionTest`. Exports drop 52 → 31 across dropdown-menu (15 → 8),
data-table (15 → 10), dialog (11 → 7), and sheet (11 → 6).

Kept — genuinely-distinct feature/behavior compositions:

- dropdown-menu: `WithSubmenus`, `WithCheckboxItems`, `WithRadioItems`,
  `InsetItems`, and the `TriggerOpenState` held-open edge demo.
- data-table: `WithSearch`, `WithPagination`, `WithSelection`, `Compact`,
  `EmptyState`, `WithWideContent`, and **both** `FullFeatured` (the span-3
  showcase preview card) and `AllFeatures` (the docs-body breakdown) — they map
  to two distinct registry surfaces, so both stay.
- dialog / sheet: `PreventClose`, `Controlled`, dialog's `WithForm`, and sheet's
  `FullScreen`.

Folded — pure prop-permutations that the `All*` composition already covers:
`DestructiveItem` + `WithDisabledItems` (dropdown), `WithRowClick` (data-table),
`Destructive` (dialog), and `LeftSide` / `TopSide` / `BottomSide` (sheet). Their
`*Test` stories were merged into the single `InteractionTest` each file now
carries. The registry-referenced `Default`, `AllStates`, `FullFeatured`, and
`AllFeatures` stories are preserved.

No component `.tsx` changed and stories ship in no tarball, so this is an empty
(no-bump) changeset, present only to satisfy the `src/**` changeset-check —
matching the precedent set by #642 and batch 1 (#652).
