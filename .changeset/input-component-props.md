---
"@beaket/ui": patch
---

Align `Input` props type with the rest of the library: extends `React.ComponentProps<"input">` instead of `React.InputHTMLAttributes<HTMLInputElement>`, matching `Textarea`. Removes redundant `className` and `ref` declarations (already inherited). No runtime behavior change. Closes #333.
