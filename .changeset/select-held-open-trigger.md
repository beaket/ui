---
"@beaket/ui": minor
---

feat(select): held-open trigger + accent marks the highlighted row

The Select trigger is the first form control that is also an overlay trigger — press it and a menu opens, exactly like a Dropdown. It now takes the same held-open pressable grammar as a Button rather than a writing field's cap-off: a thin accent edge (`shadow-offset-action`) at rest, grown on hover (`shadow-offset-action-hover`), held grown while the menu is open (`data-[state=open]:` — which Radix sets natively on `SelectPrimitive.Trigger`), dropped onto the edge on press (`active:` translate), and gone when disabled (`disabled:shadow-none`). Keyboard focus keeps the ring; invalid recolors the border and ring to danger while the pressable edge stays accent — role-agnostic, exactly as on a destructive Button. No new tokens.

Select's own menu joins the system too: highlighted rows drop the ink stamp (`bg-emphasis` slab) for the accent mark introduced on DropdownMenu in #645 — an `accent-bg` wash + a 2px accent left-rule (`data-[highlighted]:shadow-[inset_2px_0_0_0_var(--color-accent-solid)]`), ink text left at full density. The list panel now floats on `shadow-offset-overlay` (the darker overlay shade) instead of the surface `shadow-offset`.
