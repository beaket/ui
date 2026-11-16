---
"@beaket/ui": patch
---

`add` no longer leaves `package.json` and the lockfile modified when a component fetch fails. Root cause: dependencies were installed before the per-component `fetchComponent` calls in the write loop, so a 404 or dropped network after the registry loaded threw with the install already done. All component files and merge baselines are now fetched first, then dependencies install, then files are written.
