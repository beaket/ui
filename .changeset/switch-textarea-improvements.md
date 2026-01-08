---
"@beaket/ui": minor
---

Improve Switch and Textarea components

Switch:

- Flatter, more horizontal proportions (reduced height by ~40%)
- Uniform 2px padding on all sides
- Corrected thumb translate values for symmetric left/right states

Textarea:

- Add `autoResize` prop (default: true) for automatic height adjustment based on content
- Unify focus styling with Input component (ring-2 instead of border-only)
