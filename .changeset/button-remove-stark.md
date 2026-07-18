---
"@beaket/ui": minor
---

feat(button): remove the `stark` variant

`stark` (a strong-bordered button that inverted to solid ink on hover) had no
documented role in the Ink & Instrument vocabulary — it appeared nowhere in the
design docs, was used only as a demo trigger in stories, and overlapped with
`outline` (bordered neutral) and `primary` (solid ink). In a system where every
mark is meant to be deliberate, an unarticulated variant is a cut, not a keeper.

The `variant` union drops `"stark"`; the demo triggers that used it (dialog,
sheet, dropdown-menu stories) move to `outline`. Since components are copy-paste,
existing consumer copies are unaffected; new copies simply won't include it.
