---
"@beaket/ui": patch
---

`RadioGroup` with `orientation="vertical"` now lays its items out in a column. The root class was the constant `flex gap-2`, so the prop changed only arrow-key behavior and `data-orientation`; the root now adds `data-[orientation=vertical]:flex-col`. Groups that already pass `className="flex-col"` are unaffected.
