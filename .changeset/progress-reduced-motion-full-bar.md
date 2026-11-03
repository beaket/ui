---
"@beaket/ui": patch
---

Fix `Progress` reading as about 33% done under `prefers-reduced-motion: reduce` when indeterminate. The indicator kept its `w-1/3` width while `motion-reduce:animate-none` stopped the sweep, so it rested at the left third of the track like a partial determinate fill. It now holds a full, static line, as `DESIGN.md` § Motion requires.
