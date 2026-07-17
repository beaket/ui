---
"@beaket/ui": minor
---

feat(dropdown-menu): accent marks the highlighted row

The highlighted/active menu row is no longer an ink stamp (full `bg-emphasis`
slab). Instead the system's one vivid voice — the accent — marks the row you'd
activate: a faint `accent-bg` wash plus a 2px accent left-rule (the engaged-edge
weight, matching a hovered button's grown edge), with the ink text left at full
density and the shortcut in `accent-fg`. Checkbox, radio, and sub-trigger rows
adopt the same mark; the sub-trigger holds it while its submenu is open.
Destructive rows swap accent → danger (`danger-bg` wash + danger rule).

The menu panel and sub-menu panel now float on `shadow-offset-overlay` (the
darker overlay shade) instead of the surface `shadow-offset` — a menu sits above
cards, not among them.
