---
"@beaket/ui": patch
---

Fix accessibility and consistency issues across 14 components

- DataTable: add keyboard support (Enter/Space) on clickable rows, optimize selection useEffect
- Button: add data-slot and default type="button"
- Alert: remove line-clamp-1 from title
- NavigationProgress: add aria-valuetext
- Sheet: add hideCloseButton prop for Dialog API parity
- Input, Textarea, Select: normalize focus indicators to focus-visible:outline
- Radio: align border weight with Checkbox (border-graphite)
- Tooltip: remove shadow-offset from dark surface
- Blockquote: use border-l-2 to match border-width-medium token
- Checkbox, Radio, Switch, Dialog/Sheet close: expand touch targets to 44px
- Select: add disabled:border-chrome to match other form controls
