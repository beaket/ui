---
"@beaket/ui": patch
---

fix(button): ghost and link no longer leak the accent edge

Ghost and link were meant to have no accent edge, but the base applied
`shadow-offset-action` to every variant and their `shadow-none` override never
won — twMerge can't dedupe a custom shadow utility against `shadow-none`, so both
classes survived and the custom edge won the cascade. Ghost showed a blue 1px
edge at rest (and grew it on hover); link wore a button edge instead of reading
as a link.

The accent edge now lives on the variants that carry it (via a shared `edge`
string appended to primary/destructive/outline/secondary/success/stark/warning)
rather than on the base, so ghost and link simply omit it — kept out, not
overridden. Ghost is now fully quiet (ink text, grey hover fill, no edge); link
reads as a link (accent text, hover underline, no edge). Edged variants are
unchanged. No token or palette change.
