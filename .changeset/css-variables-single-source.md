---
"@beaket/ui": patch
---

Refactor CSS variables to use single source of truth

- Extract core CSS variables to `src/css-variables.css`
- CLI now imports from generated file instead of hardcoding
- Add `pnpm sync:css` script to sync variables to CLI
