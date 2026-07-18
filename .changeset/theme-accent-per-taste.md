---
"@beaket/ui": minor
---

Each theme's accent gets its own taste — no longer five shades of the same purple.

The `accent` is a theme's one vivid voice: it carries the secondary tint, links, focus ring, pressable edge, nav lens, and menu rule. Yet four of five palettes shipped the same default purple `--signal-accent`, so every theme but Solace read identically in its most characteristic moment. Each theme now answers in a hue drawn from its own world — light and dark both re-cut:

- **Porcelain** → cobalt, the blue-and-white of 청화백자: `#1e40af` / `#7fa0f0`.
- **Tobacco** → a warm taupe from its cigar-box world, in place of purple: `#6c5240` / `#bda488`.
- **Eucalyptus** → a teal-blue — the trust of blue, kept a leaf's-width green so it stays clear of the pure-blue themes and its own cyan `info-alt`: `#175a84` / `#4fb0d6`.
- **Solace** (electric blue) and **Marigold** (violet) are unchanged — Marigold is now the family's _one_ violet, not one of four.

Accessibility: because `accent` is link/focus text (`--color-fg-link`), which needs 4.5:1 against the page, every new value was gated against its theme's `tone-0` in both light and dark before selection. A pale celadon and Marigold's namesake gold were both rejected for failing that floor on light paper. Regenerated `docs/src/data/theme-tokens.json` and `docs/public/theme-init.js`.
