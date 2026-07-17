---
"@beaket/ui": minor
---

feat(theme): action shadow — a thin accent edge under what you can press

The offset shadow splits into two voices. Surfaces (cards, overlays) keep the
grey shade; pressables now carry the one vivid voice as a thin sharp edge.

- New semantic tokens `--shadow-offset-action` / `--shadow-offset-action-hover`
  (68 shared names now: 62 color + 6 shadow) — drawn with `--signal-accent`
- Button: rest = 1px accent edge → hover grows to 2px → active drops the button
  onto the edge (`translate(1px,1px)`, shadow collapses); ghost/link/disabled
  stay flat, disabled keeps its dashed border
- Solace palette thins `--shadow-size` 2px → 1px — softness of the paper,
  sharpness of the edge
