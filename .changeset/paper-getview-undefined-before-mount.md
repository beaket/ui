---
"@beaket/paper": minor
---

fix(react): `PaperHandle.getView()` returns `undefined` before mount instead of throwing

Root cause: the `EditorView` is created in a passive `useEffect`, which runs after the commit
phase, while React `ref` callbacks (and `useImperativeHandle`) fire during commit. A consumer using
the documented `getView()` escape hatch from a ref callback therefore hit `viewRef.current === null`
and the handle threw `Paper: view is not mounted yet`, crashing the React tree on first render.

Fix: `getView()` now returns `EditorView | undefined`, yielding `undefined` until the view mounts.
The idiomatic `const v = h.getView(); if (!v) return;` now works, bringing the hatch in line with its
curated siblings — `getSelection()` returns `null`, `getValue()` returns `""` — instead of being the
one handle that throws.

This changes the return type from `EditorView` to `EditorView | undefined` (a semver-legal breaking
type change on `0.x`). See ADR-0013's 2026-07-11 amendment; the `onReady` callback and raw
`extensions[]` slot from the issue were deliberately not added (ADR-0015).
