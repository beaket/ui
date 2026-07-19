---
"@beaket/ui": patch
---

Switch now renders an invalid state.

Switch was the only form control with no `aria-invalid` styling — a required switch marked invalid (e.g. an unaccepted terms toggle) showed no visual change, while its instrument siblings Checkbox and Radio both recolor. It now follows the same instrument grammar: `aria-invalid` recolors the border and focus ring to danger while the accent edge stays (role-agnostic, exactly as on Checkbox/Radio and the Select trigger).
