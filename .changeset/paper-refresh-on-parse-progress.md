---
"@beaket/paper": patch
---

Tables, footnotes and renderer code blocks past the first ~3 KB of a large document now render once the parser reaches them, instead of staying raw until the next edit. Root cause: CodeMirror parses only the first slice synchronously and delivers the rest as a transaction with no document, selection or viewport change, but `tableField`, `footnoteModelField`, the footnote section, the code-block model and `guardedDecorations` recomputed only on those. They now also recompute when the syntax tree changed (deferred while composing).
