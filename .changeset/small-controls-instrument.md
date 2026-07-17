---
"@beaket/ui": minor
---

feat(checkbox, switch, radio): instrument grammar — static accent edge on small controls

Small controls adopt the action shadow as instruments: the chassis floats on a
static 1px accent edge (`shadow-offset-action`, no hover growth, no drop), and
press physics belong to the inner key instead — the checkbox indicator and the
switch thumb travel 1px under the press. Hover feedback is a surface tint
(`bg-bg-hover` unchecked, `bg-bg-emphasis-hover` checked); a checked radio gets
no press affordance since it cannot be unchecked. Disabled removes the edge.

Switch checked also moves from `bg-success-solid` to ink (`bg-bg-emphasis`),
matching checkbox/radio — state is carried by thumb position + ink, and the
success role returns to meaning outcomes, not "on".
