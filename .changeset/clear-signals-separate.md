---
"@beaket/ui": patch
---

Re-cut the Solace semantic signals so small text, icons, borders, tints, and solid states remain
distinguishable under simulated protanopia, deuteranopia, and tritanopia.

- danger: `#af5340` → `#a44735`
- warning: `#ce8042` → `#d18b3f`
- success: `#00896c` → `#3f8a55`
- info: `#4c6bb6` → `#53628f`
- info-alt: `#008597` → `#005f72`, with the knockout switched to the paper endpoint
- accent remains `#2b5bff`

The browser-backed audit evaluates all 15 role pairs across six semantic forms and four vision
modes using the Machado 2009 full-severity transforms and OKLab distance floors. Storybook now
includes a dedicated small-mark comparison and reinforces semantic status examples with readable
labels and distinct icon shapes.
