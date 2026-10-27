# 0024 — The core returns a curated, IME-safe editor handle

- **Status:** Accepted
- **Date:** 2026-10-27
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# The core returns a curated, IME-safe editor handle

## Context

The 1.0 interface audit (#480) found that the two entry points made different promises.

The React wrapper (ADR-0013 decision 3) hands consumers a curated `PaperHandle`. Its `setValue` runs
through `createValueController`, and the `highlights` / `activeHighlightId` props run through
`createHighlightController`. Both hold a call made mid-composition and apply it once the composition
settles, which is the composing-guard invariant (ADR-0004) carried to the command level.

The vanilla core returned the raw CodeMirror `EditorView`. Its public helpers were
`setColorScheme(view, …)`, `setReadOnly(view, …)`, `createAnchor(state, …)`, and two `StateEffect`s,
`setHighlightsEffect` and `setActiveHighlightEffect`, that a consumer dispatched by hand. Neither
controller was exported. So:

- A vanilla consumer who replaced the document or the highlight list during a composition bypassed
  the guard and could break CJK input — the product's first-class promise (DECISIONS.md, core domain).
- Freezing that surface at 1.0 would have frozen `EditorView`, `EditorState`, and `StateEffect` into
  the public contract, so a CodeMirror major could force a paper major. ADR-0015 rejected a raw
  `extensions` slot for exactly this reason, but the return type had the same leak.

## Decision

`createEditor(parent, options)` returns a `PaperEditor` handle:

| Method                           | Behavior                                                                  |
| -------------------------------- | ------------------------------------------------------------------------- |
| `getValue()`                     | The full markdown document.                                               |
| `setValue(md)`                   | Whole-document replacement. No `onChange` echo. Deferred while composing. |
| `focus()`                        | Focus the editor.                                                         |
| `getSelection()`                 | `{ from, to, text }` in source coordinates, or `null` when empty.         |
| `setHighlights(list)`            | Replace the highlight list. Deferred while composing.                     |
| `setActiveHighlight(id \| null)` | Set the active highlight. Deferred while composing.                       |
| `setColorScheme(scheme)`         | Live flip via the existing compartment.                                   |
| `setReadOnly(readOnly)`          | Live flip via the existing compartment (ADR-0018).                        |
| `getView()`                      | The raw `EditorView`. Unsafe, no cross-version guarantee.                 |
| `destroy()`                      | Dispose both controllers and the view.                                    |

1. **IME-safe by default, not opt-in.** The handle routes through the same two controllers the React
   wrapper used, so a vanilla consumer gets the guard without knowing it exists.
2. **One implementation.** `<Paper>` now wraps the core handle instead of assembling the controllers
   itself. `PaperHandle` keeps its five methods; the other handle methods are what its live props call.
3. **CodeMirror stays behind one door.** The core no longer exports `setColorScheme`, `setReadOnly`,
   `createAnchor`, `setHighlightsEffect`, or `setActiveHighlightEffect`. `getView()` is the only
   public path to a CodeMirror type, and it is documented as unsafe.
4. **`createAnchor` leaves the public surface.** It takes an `EditorState`. Consumers already receive a
   snapped anchor as `onSelect`'s `sel.anchor`, which is the path ADR-0014 designed for. `resolveAnchor`
   stays public because it is a pure function over the markdown string.
5. **`TokenSpec` and `TokenView` join the core's type exports.** `EditorOptions.tokens` was public
   but its element type could only be imported from the React entry.

### Alternatives weighed

- **Keep `EditorView` and export the two controllers.** Non-breaking, but the guard stays opt-in, so
  the default vanilla path can still break CJK input, and CodeMirror types freeze into 1.0.
- **Freeze as is.** Leaves the vanilla surface without the guard the React surface has.

## Consequences

- **Breaking on `0.x`** (a `minor` with a `Breaking change:` changeset). The migration is mechanical:
  - `createEditor(...)` → keep the handle; use `editor.getView()` wherever an `EditorView` was used.
  - `setColorScheme(view, s)` → `editor.setColorScheme(s)`.
  - `setReadOnly(view, r)` → `editor.setReadOnly(r)`.
  - `view.dispatch({ effects: setHighlightsEffect.of(list) })` → `editor.setHighlights(list)`.
  - `view.dispatch({ effects: setActiveHighlightEffect.of(id) })` → `editor.setActiveHighlight(id)`.
  - `createAnchor(view.state, from, to)` → use `onSelect`'s `sel.anchor`.
  - `view.destroy()` → `editor.destroy()`, which also releases the controllers' listeners.
- The handle is part of the surface #480 freezes. Adding a method later is additive. Removing or
  reshaping one is a major.
- Locked by `create-editor.test.ts` (routing through the controllers, deferral, destroy).
