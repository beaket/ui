# Automated accessibility check contract

This repository reports that its defined automated checks passed. It does not
claim WCAG certification or complete WCAG conformance.

## Rule set and failure policy

- Component and future integration scans use `axe-core` 4.13.0, resolved by
  `@storybook/addon-a11y` 10.5.10 in `pnpm-lock.yaml`.
- The shared Storybook configuration scans only the `wcag2a`, `wcag2aa`,
  `wcag21a`, `wcag21aa`, and `wcag22aa` tags supported by that axe version.
  axe-core 4.13.0 has no `wcag22a` tag, so no 2.2 A-only tag is claimed.
- A covered scan fails on every new violation. There is no accepted violation
  baseline. `incomplete` results are retained as evidence and reviewed; they
  do not by themselves pass or fail a scan.
- CI links to this contract in [ci.yml](../.github/workflows/ci.yml). #819
  changes the currently advisory component scan into a required CI gate;
  #821 adds integration scans.

## Coverage matrix

| WCAG surface                              | Automated signal                     | Covered surface                                    | Manual-only or not applicable                                                                      |
| ----------------------------------------- | ------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Rules in the five axe tags above          | Storybook addon using the tags above | Component stories once #819 enables the CI project | Rule applicability depends on the rendered story state; axe-core 4.13.0 has no `wcag22a` tag.      |
| Rendered component semantics and contrast | Storybook axe browser scan           | Public component-story DOM                         | Alternative-text quality, reading order, and assistive-technology usability require manual review. |
| Keyboard focus and dismissal              | Story `play` tests                   | Composite widget states added in #820              | axe cannot prove focus movement or screen-reader announcements.                                    |
| Composed documentation flows              | Playwright plus axe                  | Production docs flows added in #821                | The suite is targeted, not a crawl of every URL or state.                                          |
| Semantic token contrast                   | `pnpm test:contrast`                 | Shipped light and dark theme token pairings        | This is not a rendered-DOM scan and does not cover arbitrary consumer CSS.                         |
| Visual regressions                        | Chromatic                            | Stable accessible states added in #822             | Pixel diffs are not proof of WCAG contrast compliance.                                             |

## Exceptions

Exceptions are temporary, rule-specific, and recorded in this table before
they are merged. Every entry must name the exact rule and affected story or
flow, an owner, an expiry date, and an issue that removes it. Broad DOM
exclusions, tag-wide suppressions, and an open-ended baseline are prohibited.

| Rule and scope                                                                                                           | Reason                                                                                                    | Owner     | Expires    | Removal issue |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------- | ---------- | ------------- |
| `aria-hidden-focus` in `Select/InteractionTest`                                                                          | The current portal interaction test temporarily disables this rule while its focus contract is specified. | `@jihnma` | 2026-10-02 | #820          |
| `aria-hidden-focus` in `Select/StatePrecedenceTest`, `DropdownMenu/TriggerOpenState`, and `DropdownMenu/InteractionTest` | Radix portals hide Storybook's focused canvas root while their focus contract is specified.               | `@jihnma` | 2026-10-02 | #820          |

When an exception expires, the scan fails until the rule is fixed or a new,
reviewed exception replaces it. New exceptions must not weaken unrelated
stories or flows.
