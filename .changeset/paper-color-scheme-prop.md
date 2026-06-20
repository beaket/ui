---
"@beaket/paper": minor
---

Add a `colorScheme` prop (`"light" | "dark" | "system"`). Previously the editor only followed the OS `prefers-color-scheme`; now a consumer with its own theme toggle can force light or dark. It's a live prop — flipped via a CodeMirror compartment, so switching never recreates the editor or drops the document. The vanilla core exposes the same `colorScheme` option plus a `setColorScheme(view, scheme)` helper. `"system"` remains the default, so existing usage is unchanged.
