---
"@beaket/ui": minor
---

Breaking change: rebuild all five palettes in OKLCH, as ten separately designed schemes.

Light and dark are no longer one palette inverted. Every ramp is built on an even OKLab lightness step — only Solace was ever checked for progressivity, and the other four were violating it badly, with jumps of 0.17–0.20 at `tone-3→4` against a 0.12 ceiling, which is why their mid-greys collapsed into each other. Nothing in the set reaches `#ffffff` or `#000000` at either end.

**Each palette carries its own page, and they are spread on purpose.** Porcelain `#fdfdfe` is the starkest ground; Solace `#fdfcfa` the near-white; Marigold `#faf9fc` a bright panel with a trace of its own violet; Eucalyptus `#f4f7f9` a soft canvas that was never pure white; Tobacco `#f6f3f0` an aged stock. Dark grounds are five different rooms rather than one: a slate night `#0f171e`, a neutral black `#151617`, a warm `#1b150e`, a violet-black `#18141f`, and a grey `#222527` that deliberately sits well above black.

**A ramp may travel in hue as well as lightness.** Solace runs warm paper under cool ink. That cast is interpolated through OKLab a/b rather than by rotating hue, because rotating drags the mid-tones around the colour wheel and straight through green.

**Signal hue follows convention; its treatment follows the palette.** Green has to read as green, so the hue is not the palette's to choose — but its chroma, lightness tier and temperature are. Tobacco is the quietest set and Marigold the loudest, measured rather than asserted.

**Role lightness is tiered on purpose.** Hue cannot carry status separation alone: tritanopia collapses blue against green, and protanopia and deuteranopia collapse red against green — and against brown, which is why a warm accent could not coexist with a red danger. Each role sits on its own lightness step, and every palette clears the project's colour-vision floors.

**Accent is never quieter than danger.** The interaction colour marks what you can do; the destructive one marks a rare path. Tobacco's accent takes the red its reference actually carries, with danger stepping down to a deeper oxblood.

**Migration.** Re-run `npx @beaket/ui theme <name>` to pick up the palette block. Any consumer that hard-coded a palette value rather than reading a semantic token needs to re-read it; the 69 semantic names are unchanged.
