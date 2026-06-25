---
"@beaket/paper": patch
---

Inline tokens (`@mention`, `[[reference]]`) now render as accent-colored underlined text instead of a bordered, filled chip — matching the treatment of links and bare URLs so every inline "go elsewhere" marker shares one visual language (#556).

Root cause: ADR-0009's 2026-06-22 amendment unified links, bare URLs, and the `@`-mention token under one "accent text + accent underline" treatment, but only the markdown highlight style (`tags.link`/`tags.url`) was updated — the `.cm-token` theme in `token-render.ts` still painted a `--accent-sel` background + `1px solid --accent` border. The chip was a stale divergence from the documented decision; a boxed pill sitting next to an underlined link on the same line read as a second, competing affordance.

The token rendering mechanism (atomic decoration, ADR-0017) is unchanged — only the default CSS. Consumers who want a chip can still fully restyle via the token's `className`.
