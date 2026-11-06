<!-- beaket-record: 62ec23c5-cee5-483a-8493-f24921aa30f1 -->

# Seven needs:maintainer decisions on the beaket/ui queue, 2026-11-06

- Label: Queue decisions 2026-11-06
- Date: 2026-11-06
- Decided by: jihnma (maintainer)
- Status: decided

## Decision

1. #1234 — Accept Chromium 158 (Playwright 1.65.0) rendering as the new visual baseline; re-capture the 37 screenshots on #1232.
2. #1222 — When Sheet content overflows, the close affordance stays pinned in the top-right corner and the children scroll in an inner wrapper (option 2).
3. #1188 — `RadioGroup orientation="vertical"` lays its items out in a column.
4. #1226 — The Select placeholder is `fg-subtle`, as in Input; the rule is added to DESIGN.md § Menus (#1237).
5. #1195 — A disabled Pagination.Previous/Next carries all four dashed-disabled marks; no exception for fused strips.
6. #1194 — An indeterminate Progress under reduced motion holds a full static bar (`motion-reduce:w-full`).
7. #1204 — PRODUCT.md drops the live package version numbers and points at `npm view` (#1237).

## Why

The maintainer chose the recommended option on each of the seven without stating a reason.

## Talked with

- Claude Code, this session (AskUserQuestion): put the options of each Bunsen issue to the maintainer with a recommendation, after comparing the #1234 diff artifacts, which showed only a narrower monospace fallback font in code blocks and no layout change.

## Rejected

- #1234 hold Playwright at 1.64.x and close #1232 — the diff is rendering drift only, and the same failure would return on the next bump. [#1234]
- #1222 close button scrolls with the content (option 1) — the close affordance leaves the viewport once the user scrolls. [#1222]
- #1222 single scroll container with a `sticky` close button (option 3) — its positioning would differ from Dialog's. [#1222]
- #1188 leave the layout to `className="flex-col"` — the prop's name and its behavior stay inconsistent. [#1188]
- #1226 leave as is — an unset Select cannot be told from one set to its first option. [#1226]
- #1226 use `fg-muted` — DESIGN.md reserves `fg-subtle` for placeholders. [#1226]
- #1195 fill only, keeping the solid seam — departs from the rule's "dashed" mark and needs a recorded exception. [#1195]
- #1195 leave as is with an open-defects entry. [#1195]
- #1194 leave as is — a misleading position cue for reduced-motion users. [#1194]
- #1204 update the numbers to 4.2.1 / 0.10.0 — goes stale again on the next release. [#1204]

## Constraints

- Moving a visual-regression baseline, and any new DESIGN.md rule or exception, is maintainer work; Bunsen's queue desk may not grant it. [docs/MAINTENANCE.md § Definition of Ready outside @beaket/paper, § Delegated queue decisions]
- A `desk:design` issue qualifies for `agent:ready` only when its fix applies a DESIGN.md rule as written, so #1226 waits for #1237. [docs/MAINTENANCE.md § Delegated queue decisions]
- The Sheet fix adds one DOM element inside `sheet-content`; it is accepted as a `fix` changeset, not a `Breaking change:`. [#1222]

## Premises

- The 37 screenshot failures on #1232 differ from the baselines only in code-block text rendering; no component or page layout changed.
- DESIGN.md § Overlays places the close affordance in the top-right corner, and that holds while the panel's content scrolls.
- DESIGN.md's Dashed-Disabled Rule has no exception for fused strips.
- DESIGN.md § Menus states the Select placeholder color once #1237 merges.
- `@beaket/ui` ships the registry as well as the CLI, so PRODUCT.md no longer calls it "the CLI".

## Still open

- A Dialog sibling of the Sheet overflow fix: Dialog has the same shape (no `max-h`/`overflow`) and was not decided here. [#1222]

## Sources

- https://github.com/beaket/ui/issues/1234 · https://github.com/beaket/ui/pull/1232 · run https://github.com/beaket/ui/actions/runs/42168225294
- https://github.com/beaket/ui/issues/1222
- https://github.com/beaket/ui/issues/1188
- https://github.com/beaket/ui/issues/1226
- https://github.com/beaket/ui/issues/1195
- https://github.com/beaket/ui/issues/1194
- https://github.com/beaket/ui/issues/1204
- https://github.com/beaket/ui/pull/1237
- docs/MAINTENANCE.md
