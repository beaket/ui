---
"@beaket/ui": minor
---

Accent becomes the interaction voice.

The `accent` signal — the one vivid ink each theme reserves for "what you can act on" — now actually carries interaction across the system, resolving the long-standing "two blues" (accent vs. `signal-info`) in Solace:

- **Primary button**: the ink fill gains a 1px `accent-solid` edge, with `accent`-warmed hover/active surfaces (previously a plain `border-strong` with no hover shift).
- **Secondary button**: now an `accent` tint (`accent-bg` + `accent-fg` + `accent-border`) that deepens its border on hover, instead of a neutral grey surface.
- **Links & focus rings** (`--color-fg-link`, `--color-border-focus`): repointed from `signal-info` to `signal-accent`, so `signal-info` returns to meaning only "info". Solace's primary focus is now a single blue (edge + ring) rather than two.

Two new semantic tokens back the primary hover/active states — `--color-bg-emphasis-hover` and `--color-bg-emphasis-active` (`accent`-warmed mixes of `bg-emphasis`) — bringing the semantic layer to 66 names.

Accessibility: because `accent` is now link/focus text (which needs 4.5:1 against the page), three palette accents were re-cut to clear that floor — Marigold (light), Porcelain (dark), and Tobacco (dark). The other themes already passed.
