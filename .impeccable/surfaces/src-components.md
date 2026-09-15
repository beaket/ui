---
version: 1
slug: "src-components"
primary_target: "src/components"
related_targets: []
---

Scope: the 29 copy-paste registry components in `src/components` and the token
layers they read (`src/themes/foundation.css`, `src/themes/semantic.css`).
Visitor mode: **Operate** — a developer evaluating the set, and the product team
that forks it as their design-system base.

Constraints carried in from the maintainer, 2026-09-15: keep Button's held-open
edge, Badge, Tabs, the Select dropdown panel, and the Checkbox/Radio/Switch
style; drop those three to a 16px chassis; redesign the Select trigger and the
~22 remaining components; treat CJK typography as a first-class constraint.

## Direction contract

THESIS: A drawn edge means you can act on it. Beaket today breaks that promise
390 strokes at a time — 21.7% of rendered elements carry a border, while ink
fill covers 0.46% of the page, so the weight was never the black, it was the
lines. This refuses the category habit the incumbent shares with every ruled
system: the reflex that a region must be boxed to exist.

OWN-WORLD: Ink & Instrument survives, re-rationed by scale. Instruments —
button, input, select trigger, checkbox, radio, switch, badge — keep the 1px
pen, the accent edge on engage, and the held-open grown edge. Surfaces — card,
alert, table, field group — drop the resting stroke entirely and are read by
fill step (paper → raised → overlay) plus the zero-blur offset shade. Overlays
keep a frame because they float over arbitrary content. Where two strokes must
meet they share one seam rather than stacking, which is the Fused Strip Rule
generalised off Tabs. Square corners, flat fills, no gradient, no blur, no
opacity: unchanged.

STORY: A developer opens the set and reads structure before decoration. Density
stops shouting, so the one accent edge under the control they are about to press
is the loudest thing on screen — which is what it always claimed to be.

FIRST VIEWPORT: The Storybook Overview. A borderless raised card holds a table
whose header carries the single near-black rule in the region; rows are divided
by faint hairlines that touch the card's padding edge rather than a second
frame. An alert to its left is a leading role rule over paper, no box. Controls
sit in a fused toolbar strip. 16px instruments sit under the cap-height of 14px
Korean labels instead of over them.

FORM: Ground, raised by Fusion's seam discipline. Ranked first of three
candidate vocabularies rendered for the maintainer at
claude.ai/code/artifact/9fc9a17b-bf7e-4ccf-b95a-f193a361777b; chosen by the
maintainer over Fusion (too conservative) and Rule (unbounded regions are a
decision a forking team cannot undo). No seed key: the visual world was pinned
by the brief, so no direction roll was run.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance

## Unresolved

- Type scale moves 11→12px and 13→14px; control height ladder (32/36/40) is held
  so the change reads as calmer type, not a bigger UI. Revisit if 14px in a 32px
  small button feels cramped.
- `--font-sans` gains Korean and Japanese families. PRODUCT.md's "No CJK/Korean-first
  commitment exists for @beaket/ui" is now false and must be rewritten at finish.
- The 44px hit-expander rule is documented as universal but implemented on
  breadcrumb only; 87 controls measure under 44×44. Fixing it is in scope.
