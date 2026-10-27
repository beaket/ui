---
"@beaket/ui": patch
---

NavigationProgress now holds a full, static bar under `prefers-reduced-motion: reduce`. Root cause: the global reduced-motion rule collapses the sweep to a single 0.01ms run with no fill mode, so the bar fell back to its resting `w-1/3` at the left of the track and read as "a third done" rather than indeterminate. The bar now adds `motion-reduce:w-full motion-reduce:animate-none`.
