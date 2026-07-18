---
"@beaket/ui": minor
---

feat(button): primary wears a light rim that sheds on engage

The primary button's rest edge no longer doubles. Its border was the full accent
(`border-accent-solid`) sitting directly over the full accent shadow — the same
blue on both, so the two 1px lines merged into one thick 2px band on the bottom
and right. The border now takes the lighter accent tone (`border-accent-border`),
so at rest the light rim and the full-accent shadow read as two tones — depth,
not a doubled line — with the strong voice living in the shadow where it grows
and drops.

On engage the rim sheds: `hover:border-transparent` (and `data-[state=open]`
mirrors it) drops the rim into the ink fill so the accent consolidates into the
one growing shadow rather than piling into a thick accent band. The border is
added to the shared transition (`transition-[box-shadow,translate,border-color]`)
so the rim fades with the shadow instead of snapping — which also smooths the
hover border-color change on the other bordered variants. No new tokens; other
variants and the rest/hover/press/held-open shadow grammar are unchanged.
