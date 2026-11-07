---
"@beaket/ui": minor
---

Breaking change: `Card` now rests on the page's own stock with a faint 1px pen and a faint 1px shade, instead of raised paper with the 2px grey shade. The new default elevation is `hairline`, and a new `mat` elevation sets the one card that should stand out in a 4px mount. An interactive `hairline` or `mat` card turns its shade into the 2px accent edge on hover and drops onto it when pressed. The semantic layer gains `--color-border-faint`, `--color-border-mount` and `--shadow-offset-faint`, so it now holds 73 names.

To keep the previous look, pass `elevation="shade"`; `flat` and `overlay` are unchanged. Re-run `npx @beaket/ui add card` to pick up the component, and re-run `init` or copy the three new tokens from `semantic.css` into your theme block.
