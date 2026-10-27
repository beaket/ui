---
"@beaket/ui": minor
---

Breaking change: `Input` now always renders `<div data-slot="input-wrapper">` around its `<input>`, including when it has no `prefix` or `suffix`. Before this change, an `Input` without an affix returned a bare `<input>` and one with an affix returned the wrapper, so React remounted the `<input>` whenever an affix appeared or disappeared, for example a clear button that shows on the first keystroke. The field lost focus, caret, selection and IME composition at that moment. The `<input>` now keeps one position in the tree and stays focused (#1105).

What changed in the DOM: the outermost element of every `Input` is now `div[data-slot="input-wrapper"]`. With no affix the wrapper is `display: contents`, so it draws no box and the input looks and lays out as before. `className`, `ref`, `data-slot="input"` and all other props still go to the `<input>`, so existing `className` overrides and refs need no change.

Migration: only selectors and DOM code that assumed a bare `<input>` is the component's outermost element need updating.

- Child and sibling selectors: a selector such as `form > input`, `.row > [data-slot=input]` or `[data-slot=input] + p` no longer matches. Use a descendant selector (`.row [data-slot=input]`) or target the wrapper (`.row > [data-slot=input-wrapper]`).
- Structural pseudo-classes: `:first-child` and `:last-child` now apply to the wrapper, not the `<input>`.
- `[data-slot=input-wrapper]` now matches every `Input`. If your CSS gives the wrapper a `display` value or other box styles, scope that rule to inputs with an affix, for example `[data-slot=input-wrapper]:has([data-slot=input-prefix],[data-slot=input-suffix])`.
- DOM code: `input.parentElement` is now the wrapper, and `nextElementSibling` or `previousElementSibling` on the `<input>` returns `null` when there is no affix.
