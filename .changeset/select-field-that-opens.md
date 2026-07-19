---
"@beaket/ui": minor
---

Select trigger becomes a field that opens.

The select trigger is surfaced like a form field (input's paper, input's border) but #646 gave it the full Button edge grammar — a standing accent edge, a hover that grows — so in a real form it was the one control that behaved like a button. But the dropdown "trigger" is loud at rest only because it's literally a `<Button>`; that rest-edge is Button-incidental, not trigger-essential.

Select now stays **quiet at rest** among its field neighbors (no standing edge, no hover growth) and lifts the grown edge **only while its menu is open** — keeping the trigger-essence (`data-[state=open]:shadow-offset-action-hover`) and the keyboard focus ring. It's the one pressable that carries a ring but no rest edge. Invalid and disabled are unchanged; the resting form now reads as one quiet material.
