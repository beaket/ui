---
"@beaket/ui": minor
---

New two-layer color token system + Solace theme.

- **Semantic layer** (`themes/semantic.css`, new): the 64 names components use — `--color-bg/-raised/-overlay/-input/-hover/-active/-disabled/-emphasis`, `--color-fg/-muted/-subtle/-disabled/-on-emphasis/-link`, `--color-border/-muted/-strong/-focus`, six roles (`danger`, `success`, `warning`, `info`, `info-alt`, `accent`) × seven slots (`-solid`, `-fg-on-solid`, `-solid-hover`, `-solid-active`, `-fg`, `-bg`, `-border`), and `--shadow-offset/-hover/-active/-overlay`. Authored once, shared verbatim by every theme.
- **Palette layer**: each theme now authors only 32 values — `--surface-0..2`, `--surface-brand`, `--tone-0..11`, six `--signal-*` inks, six `--signal-*-on` knockouts, and shadow size/color. Porcelain, Tobacco, Marigold, and Eucalyptus are re-cut to the new contract (signal hue/chroma kept; lightness moved only as far as the 4.5:1 knockout and 3:1 page floors require).
- **New theme: Solace** (light-only, now the default) — warm paper, cool ink, equal-weight signals, one vivid blue reserved for action.
- All components migrated to the semantic names; the old material names (`paper`, `ink`, `chrome`, `steel`, `frost`, `branch`, `signal-*`, `surface-N`, `shadow-offset-dark`) are removed. The new `--color-{role}-fg-on-solid` knockouts close the amber-on-button legibility gap.
- `init`/`theme` now inject `semantic.css` + the chosen palette together; `--theme solace` supported and default.
- The `prefers-contrast: more` override was removed: `--color-fg` is now the ramp's deepest ink, so maximum-contrast text is the default.

Migration for consumers who customized tokens: re-run `npx @beaket/ui theme` to re-inject, then re-apply customizations against the 32 palette values (the semantic layer follows automatically). Class mapping highlights: `bg-paper`→`bg-bg`/`bg-bg-raised`/`bg-bg-overlay`/`bg-bg-input` by surface role, `text-ink`→`text-fg`, `text-steel`→`text-fg-muted`, `border-chrome`→`border-border`, `bg-branch`/`bg-ink`→`bg-bg-emphasis` (+`text-fg-on-emphasis`), `outline-signal-blue`→`outline-border-focus`, `bg-signal-red`→`bg-danger-solid` (+`text-danger-fg-on-solid`), `shadow-offset-dark`→`shadow-offset-overlay`.
