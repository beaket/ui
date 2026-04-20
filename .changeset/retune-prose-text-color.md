---
"@beaket/ui": minor
---

Re-tune prose body text color across all four themes to eliminate long-reading eye fatigue while preserving brutalist identity.

**Problem.** `graphite` on `frost`/`paper` was running at ~18–20.4:1 contrast — above the research-backed 10–15:1 sweet spot (Bauer & Cavonius, Lin & Huang) and higher than every major design system (Apple 16.7:1, GitHub 15.5:1, Linear 16.2:1, Notion 10.6:1, Medium 14:1). Excess contrast induces halation and is especially punishing on dense Japanese kanji strokes. `graphite` and `ink` were also nearly identical (ΔE<1) so the two tokens had collapsed semantically.

**Changes per theme (light / dark):**

- **Porcelain**: graphite `#030508 → #1e2229` / `#e6eaee → #c4cad4`; ink `#080b10 → #0a0d14` / `#dce0e6 → #e6eaee`; iron `#282b2f → #15191f` / `#b4bcc6 → #aab2bd`; dark paper `#06080c → #0d1117` (reduces dark-mode halation + re-adaptation fatigue).
- **Eucalyptus**: graphite `#0a1025 → #1e2638` / `#e8ecf4 → #c6cdde`; ink `#162036 → #0e1628` / `#dce2ec → #e8ecf4`; iron `#243250 → #151d30` / `#b0bace → #a6aec4`; dark paper `#060a14 → #0e1320`.
- **Marigold**: graphite `#0a0a0a → #1f1f1f` / `#f5f5f5 → #d8d8d8`; ink `#121212 → #0a0a0a` / `#ececec → #f5f5f5`; iron `#262626 → #141414` / `#d0d0d0 → #c0c0c0`; dark paper `#0a0a0a → #101010` (conservative — preserves neon identity). Shadow references rebound (`--shadow-offset` now uses `iron`; `-dark` variant uses `ink`) to keep the "ink-black heavy shadow" semantic intact after the ink/graphite value swap.
- **Tobacco**: graphite `#111110 → #26231e` / `#eceae0 → #cfcabc`; ink `#1a1a18 → #14130f` / `#e2e0d6 → #eceae0`; iron `#312f2c → #1c1a16` / `#c0bcb2 → #b4b0a6`; dark paper `#0c0b0a → #14130f`.

**Token semantics clarified (via values, not rename):**

- `graphite` = prose body (tuned for sustained reading, 13–14:1 light, ~12:1 dark).
- `ink` = UI primary / strong interactive (kept punchy — buttons, `bg-ink` tooltips, strong borders).
- `iron` = structural dark accent / shadow (moved below graphite on the dark axis to preserve scale distance now that graphite has softened).

**Other:**

- `--color-border-strong` rebound from `graphite` to `ink` so softening prose text does not weaken the brutalist border language.
- New `@media (prefers-contrast: more)` block in `styles.css` restores the original near-black `graphite` for users who request maximum contrast at the OS level (accessibility escape hatch).
