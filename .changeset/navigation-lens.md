---
"@beaket/ui": minor
---

feat(navigation): the lens — navigation joins the instrument family

Navigation was the last component on the legacy grey shadow ladder. It is now a fused hairline strip (cells share `border-border-muted` borders) carrying one static accent edge, and the current page is no longer stamped in ink — it sits under a glass lens plate: hairline top/left rim, ink bottom/right rim (ink gathers where every shadow in the system falls), filled with the faintest accent wash. The plate lies beneath the type, so the current label keeps full ink density. Pressing any other link travels its label 1px like an instrument key.

Token changes (68 semantic names, was 69):

- New: `--color-accent-bg-subtle` — accent-only faintest wash (8%), the lens fill
- Removed: `--shadow-offset-hover` and `--shadow-offset-active` — the grey ladder had no users left; surfaces keep `shadow-offset`/`-overlay`, pressables keep the action edge

Vertical layouts swap the fusion axis: `flex-col [&>li+li]:ml-0 [&>li+li]:-mt-px` on `Navigation.List`.
