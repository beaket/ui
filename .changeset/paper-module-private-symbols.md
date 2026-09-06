---
"@beaket/paper": patch
---

Stop exporting three symbols that never left their module

`cellSync` and `clearActiveCell` (`table-widget.ts`) and `sourceHighlighting`
(`markdown.ts`) carried an `export` keyword while being used only inside their own
file. None was re-exported from `index.ts`, so no consumer could reach them
through the package's `exports` map. No public API changes.
