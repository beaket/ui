---
"@beaket/ui": minor
---

Breaking change: return Solace's `info` signal to the blue band, held apart from the accent by step rather than by hue.

The regrade moved `--signal-info` to a plum at hue 315° and recorded the reason in `DESIGN.md`: "Plum is deliberately not a blue: the accent already owns the blue band, and an informational blue beside it would read as actionable." The diagnosis was right and the remedy was not.

**The old blue's problem was step, not hue.** Solace light's previous info `#53628f` measured L\* 0.503, C 0.074, h 269.5 against an accent at L\* 0.501, C 0.195, h 263.9 — the same lightness and effectively the same hue, separated by chroma alone. That is why it cleared the project's colour-vision floor by only 0.0485 against a 0.04 minimum, and why it read as a duller version of the thing you can click rather than a different kind of mark.

**Rotating 45° into plum bought margin by abandoning the convention.** It also made Solace the only palette whose info left the blue band: Porcelain, Eucalyptus and Tobacco all ship a blue info, and Porcelain does it beside a blue accent at 0.0407 — a thinner margin than the Solace blue that was replaced. The stated rule was never held system-wide.

`--signal-info` is now `#275085` light and `#5f8bc6` dark: the regrade's own lightness and chroma tiers for the role, unchanged (L\* 0.430 / 0.630, C 0.100), with only the hue moved from 315° to 256°. Separation from the accent is now carried by a full lightness step and roughly half the chroma, which is the relationship Eucalyptus already ships between its blue accent and blue info — and it measures 0.0900 light and 0.0743 dark, better than both the old blue and Porcelain's shipping pair. The role's display name follows the value from **Plum** to **Prussian Blue**.

**Migration.** Re-run `npx @beaket/ui theme solace` to pick up the palette block. Only Solace changes; the other four palettes are untouched. Any consumer that hard-coded `#643d75` or `#a076b3` rather than reading `--color-info-*` needs to re-read it.
