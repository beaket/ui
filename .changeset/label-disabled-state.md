---
"@beaket/ui": patch
---

Label and Field.Label: render the label of a disabled control in `fg-disabled`.

DESIGN.md's Dashed-Disabled Rule gives a disabled control `fg-disabled` text, and
Quiet Ink names "disabled labels" as one of that token's jobs, but `Label` and
`Field.Label` set only `text-fg` and had no disabled variant. A disabled
Checkbox, Radio or Switch therefore sat next to a label in full ink that still
read as live. `Label` now dims when it follows a disabled `peer` control
(Checkbox, Radio and Switch all carry `peer`) or wraps a disabled control.
`Field.Label` dims when its Field's control is `:disabled` or carries
`data-disabled` (Radix roots such as RadioGroup). No props change.
