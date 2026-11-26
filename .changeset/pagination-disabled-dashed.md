---
"@beaket/ui": patch
---

Pagination: a disabled Previous or Next now carries all four disabled marks (dashed border, `border-muted` stroke, `bg-disabled` fill, `fg-disabled` text). Root cause: `buttonDisabledClass` set only the stroke and text, so the disabled step drew a solid box, unlike every other disabled control.
