---
"@beaket/ui": minor
---

feat(tabs): the lens — tabs join the navigation layer's glass

The tray retires. Tabs.List is now a fused hairline strip under one static accent edge (`shadow-offset-action`), and the selected tab sits under a glass lens plate instead of an ink stamp — hairline top/left rim, ink bottom/right rim, the faintest accent wash, plate beneath the type so the label keeps full ink density. Hover is a quiet surface tint; the switch itself is snappy (Radix activates a tab on press, so selecting it is instant by design). The unused `shadow` prop on Tabs.List is removed.
