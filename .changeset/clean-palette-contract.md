---
"@beaket/ui": minor
---

Remove the non-functional `--surface-brand` and `--shadow-size-active` values from every built-in palette, reducing the authored theme contract from 32 to 30 values.

- `--surface-brand` is removed because no semantic token or shipped component referenced it. No replacement is needed; use a semantic background role such as `--color-bg-emphasis` when styling a brand-emphasis surface.
- `--shadow-size-active` is removed because active pressables intentionally drop their shadow and translate by 1px; all semantic shadow roles derive from `--shadow-size`.

The dependency audit also identifies `--tone-8` through `--tone-10` as reserved rather than functional. They remain for compatibility with the public 12-step neutral ramp and future deep-ink roles; the other 27 palette values are all reachable from the semantic layer.

Existing CSS produced by an older `init` remains valid because consumers own that CSS, but these two custom properties continue to have no effect. Run `npx @beaket/ui theme` to refresh the configured theme, or `npx @beaket/ui theme --theme <preset>` to switch presets and replace the managed block with the 30-value contract. Customized palettes can instead delete the two declarations manually.
