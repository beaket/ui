---
"@beaket/paper": patch
---

Fix (#474): clicking in the empty space below a table that is the **literal last block** no longer parks the caret before the table.

**Root cause.** The user-visible symptom in the docs demo was a dead zone (the demo card was taller than the editor), already fixed docs-side in #475 by letting the editor content fill its card. The hypothesized editor-internal `posAtCoords` bug does not exist — for a table followed by a trailing blank line (the state `tableBoundaryGuard` always enforces during editing) a below-content click resolves to that trailing line and renders correctly after the table.

The one remaining case is an **initial `doc` passed straight in that ends with a table and no trailing line**: the table's block-widget replace range ends exactly at doc end, and CM6 renders a caret at that end-boundary _before_ the widget (there is no following text line for it to attach to). State position is correct (doc end), only the rendered caret is wrong.

**Fix.** The body `mousedown` handler now detects this case (`docEndsWithBareTable`) and, when the click lands below the last block, heals the doc with a trailing line and places the caret there — mirroring `escapeTable("below")`'s keyboard behavior. Read-only never mutates. The geometry gate ("below the last block") is browser-verified per invariant #4; `docEndsWithBareTable` and the doc-mutation path are covered by jsdom regression tests.
