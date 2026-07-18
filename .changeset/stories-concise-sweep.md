---
---

Stories-only refactor: fold the per-permutation stories into the Button-style
shape — one `Default` playground (variants/states reachable via Controls), the
`All*` compositions the docs site renders, and a single consolidated
`InteractionTest` — across input, badge, checkbox, radio, switch, alert,
pagination, and avatar. Genuinely-distinct feature compositions (e.g. button
mode, avatar sizes/groups) are kept; only prop-permutations and redundant
per-behavior tests were folded. Also makes avatar's hydration-guard test
deterministic (inline `data:` image instead of a network URL).

No component `.tsx` changed and stories ship in no tarball, so this is an empty
(no-bump) changeset, present only to satisfy the `src/**` changeset-check —
matching the precedent set by #642.
