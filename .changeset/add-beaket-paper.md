---
"@beaket/paper": minor
---

Add `@beaket/paper`: a markdown-first, CJK-first Live Preview editor, published as a standalone npm package (not a copy-paste registry component).

- Framework-agnostic core (`@beaket/paper`, `createEditor`) with zero React, plus a thin React wrapper (`@beaket/paper/react`, `<BeaketPaper>`).
- Uncontrolled by design (`defaultValue` + `ref.setValue()`); `onChange` emits full markdown on user edits only, guarded against IME composition.
- CodeMirror 6 engine with a permanently-hidden table widget, IME composing guard, Live Preview syntax hide/show, slash menu, image ingestion hooks, and source-anchored selection annotations.
- Porcelain design tokens reconciled against `@beaket/ui`'s `porcelain.css`: inherits `--color-*` when present, self-sufficient via fallbacks standalone.
