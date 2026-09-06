---
"@beaket/ui": patch
---

`alert`, `badge`, and `switch` no longer depend on `class-variance-authority`

Each used `cva` for a single flat variant map with no compound variants — a
lookup keyed by one prop. `alert.tsx` already spelled the same lookup twice as a
plain object (`variantIcons`, `variantTitles`) directly beneath the `cva` call.
The three now use a plain object too, so `ui add alert|badge|switch` installs one
package fewer. `button` and `card` keep `cva`, where two axes and compound
variants earn it.

Rendered class strings are unchanged. `AlertProps` and `SwitchProps` drop the
`VariantProps<…>` they extended, which restated literal unions the interfaces
already declare.
