---
"@beaket/paper": patch
---

Fix (#471): the table grip context menu (column/row: insert, move, delete) is no longer clipped near the editor's scroll viewport edge.

**Root cause.** `openMenu()` appended the menu to the table widget wrapper (`this.wrap`) — which lives inside `.cm-content` → `.cm-scroller` — and positioned it `absolute` relative to that wrapper. `.cm-scroller` is `overflow: auto`, so any descendant menu extending past the scroller box was clipped (worse when the editor was tall or scrolled).

**Fix.** Mirror the slash menu: the menu now attaches to `view.dom` (`.cm-editor`, `overflow: visible`) with `position: fixed`, positioned from the anchor grip's `getBoundingClientRect()` (viewport coords). This takes it out of the scroller's overflow context so it can never be clipped. The outside-click close and IME guard are unchanged. The clip geometry is browser-verified per invariant #4; a jsdom regression test locks the structural fact that the open menu attaches under `.cm-editor` and outside `.cm-scroller`.
