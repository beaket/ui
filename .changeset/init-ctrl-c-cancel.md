---
"@beaket/ui": patch
---

Pressing Ctrl+C during `init` or an overwrite confirmation now cancels the command instead of continuing. `prompts` resolves with the partial answers after Ctrl+C unless `onCancel` stops the process, so `init` wrote `beaket.ui.json` without a CSS path and printed "Done!", and the confirm prompts treated a cancel as "no" and carried on.
