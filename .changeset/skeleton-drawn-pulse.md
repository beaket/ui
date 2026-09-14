---
"@beaket/ui": patch
---

Skeleton breathes in ink instead of fading.

`animate-pulse` cycles `opacity` from 1 to 0.5, which is the one thing this system never does: opacity is not a styling device here, and a fading placeholder dims whatever sits behind it rather than re-inking the block itself. It was also the last component contradicting the Drawn-Not-Lit rule.

The block now moves one step along the neutral ramp and back — `bg-hover` ↔ `bg-active` — on a new `--animate-skeleton-pulse` token in the semantic layer. The cadence is unchanged at 2s, so only the channel moved; the placeholder reads the same, it just does it in ink. Both ends are semantic names, so the pulse follows a palette swap and reads correctly in dark mode.

Because the keyframes drive `background-color`, a `className` background is painted over while the animation runs. Recolor by editing the keyframes — the file is yours. `animate-none` will not stop it: tailwind-merge cannot dedupe a custom `animate-*` utility against it, the same gotcha that stops `shadow-none` opting a variant out of `shadow-offset-action`. `style={{ animation: "none" }}` works, and `prefers-reduced-motion: reduce` already collapses it globally.
