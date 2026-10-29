---
"@beaket/paper": minor
---

Breaking change: `createEditor()` now returns a `PaperEditor` handle instead of the CodeMirror `EditorView`. Every method on the handle is IME-safe. Before this change, a vanilla consumer that replaced the document or the highlights during a composition bypassed the composing guard and could break CJK input. The React wrapper always had that guard and now wraps the same handle. The core no longer exports CodeMirror-typed helpers, so `getView()` is the only path to CodeMirror (ADR-0024).

Migration:

- Keep the value `createEditor()` returns. Use `editor.getView()` wherever you used the `EditorView`.
- `setColorScheme(view, scheme)` → `editor.setColorScheme(scheme)`
- `setReadOnly(view, readOnly)` → `editor.setReadOnly(readOnly)`
- `view.dispatch({ effects: setHighlightsEffect.of(list) })` → `editor.setHighlights(list)`
- `view.dispatch({ effects: setActiveHighlightEffect.of(id) })` → `editor.setActiveHighlight(id)`
- `createAnchor(view.state, from, to)` → use the `anchor` that `onSelect` reports (`sel.anchor`)
- `view.destroy()` → `editor.destroy()`

`TokenSpec` and `TokenView` are now exported from the core entry as well as `@beaket/paper/react`.
