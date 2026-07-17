---
"@beaket/ui": minor
---

feat(input, textarea): cap-off focus — retire the ring, the field engages the action edge

Writing fields are quiet at rest; focusing one is "cap-off": the glowing focus ring is retired and a static accent edge (`shadow-offset-action`) appears under the field while engaged — no hover growth, no active drop, no transition. Invalid fields swap the edge to the new `--shadow-offset-action-danger` token (semantic tokens 68 → 69). The caret becomes the pen (`caret-accent-solid`) and selection uses the accent tint (`selection:bg-accent-bg`). Read-only fields gain dignity: the frame retreats to `border-border-muted` while the value stays full-ink, and focusing one shows the grey surface `shadow-offset` instead of the action edge — readable, not writable. Keyboard-nav rings on pressables (buttons, checkboxes, …) are unchanged.
