---
"@beaket/ui": minor
---

feat(button): held-open triggers sustain the grown edge

A Button acting as an overlay trigger (dropdown menu, popover) now holds its
hover state while the overlay is open — the accent edge stays grown instead of
springing back to rest. The trigger reads as the active owner of the menu it
opened while remaining pressable: a lifted state, not a drop.

The rule is variant-aware: `data-[state=open]:` mirrors each variant's `hover:`,
so edge-bearing variants grow and hold their edge, and `ghost`/`link` keep their
surface tint / underline with no edge and no press-travel. Radix sets
`data-[state=open]` only on `asChild` triggers, so the styles are inert on
ordinary buttons; modal (dialog/sheet) triggers sit behind the scrim, so the
held edge is effectively visible only for non-modal triggers like DropdownMenu.
