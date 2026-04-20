---
"@beaket/ui": patch
---

Fix CSS token duplication between `src/css-variables.css` and `src/themes/porcelain.css`. The two files had drifted out of sync (different hex values for `graphite`, `ink`, `signal-blue`, `signal-green`, surface layers) and `css-variables.css` lacked the dark-mode block. Removed `src/css-variables.css` and made `src/themes/porcelain.css` the single source of truth — `src/styles.css` now imports it directly.
