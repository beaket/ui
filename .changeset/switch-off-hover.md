---
"@beaket/ui": patch
---

Switch off-state now responds to hover.

The switch was the one instrument with no hover feedback when off — its checked track warms on hover and its siblings Checkbox and Radio tint their surface, but the off-channel sat inert. It now darkens one token step on hover (`border-muted` → `border`), completing the instrument grammar: hover tints the surface, press travels the key (the switch already travels its thumb, so no active tint is added).
