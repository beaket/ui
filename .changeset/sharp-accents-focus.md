---
"@beaket/ui": minor
---

Define and apply a system-wide accent hierarchy so keyboard focus, open ownership, hover intent,
selection, persistent affordance, and content navigation no longer compete at equal weight.

- Buttons and interactive cards are neutral at rest, reveal a thin accent edge on hover, and hold a
  grown edge only while they own an open overlay. Primary emphasis now comes entirely from its ink
  surface; the secondary button returns to neutral material.
- Checkbox, Radio, Switch, Navigation, Tabs, and Pagination drop their standing accent edges.
  Choice controls reveal action on hover, while navigation and tabs reserve accent for the selected
  lens.
- Writing fields retain their cap-off focus edge, Select retains its open-owner edge, and menu rows
  retain their inset active rule under an explicit channel-precedence policy.
- Add dense Storybook coverage plus native and Radix-backed interaction checks for simultaneous
  focus, open, active-row, and selection states.
