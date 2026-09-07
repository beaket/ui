---
"@beaket/ui": patch
---

Make Radix-hidden backgrounds inert while Select and modal DropdownMenu overlays are open. This absorbs the aria-hidden-focus audit defect still present in @radix-ui/react-select 2.3.7 and @radix-ui/react-dropdown-menu 2.1.24. Native inert is required; existing inert regions are preserved. Background focusability is restored when Radix releases the last overlay's hiding marker. No axe rule suppression is needed for these overlays.
