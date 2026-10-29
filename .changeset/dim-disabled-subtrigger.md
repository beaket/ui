---
"@beaket/ui": patch
---

DropdownMenu: a disabled `SubTrigger` now renders in `fg-disabled` ink and drops pointer affordance, like the disabled `Item`, `CheckboxItem` and `RadioItem` rows beside it.

Root cause: Radix marks a disabled sub-trigger with `data-disabled`, but `SubTrigger`'s class list was the only menu row without the `data-[disabled]:text-fg-disabled data-[disabled]:pointer-events-none` pair, so a disabled submenu parent rendered in full ink and looked identical to an enabled one. No story rendered `<DropdownMenu.SubTrigger disabled>`, so neither the visual baselines nor the play tests could catch it.
