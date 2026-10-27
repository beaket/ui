---
"@beaket/ui": minor
---

Breaking change: `Input` now always renders `<div data-slot="input-wrapper">` around its `<input>`, including when it has no `prefix` or `suffix`. Before this change, an `Input` without an affix returned a bare `<input>` and one with an affix returned the wrapper, so React remounted the `<input>` whenever an affix appeared or disappeared, for example a clear button that shows on the first keystroke. The field lost focus, caret, selection and IME composition at that moment. The `<input>` now keeps one position in the tree and stays focused (#1105).

What changed: the outermost element of every `Input` is now `div[data-slot="input-wrapper"]` with `flex w-full items-center`. It is `relative` only when an affix is present. `className`, `ref`, `data-slot="input"` and all other props still go to the `<input>`, so class overrides that style the field itself (padding, height, border, colors) and refs need no change. In a block or column layout the field looks and lays out the same as before.

Migration:

- Layout classes that place the field within its parent no longer reach the outermost element, because `className` lands on the `<input>` inside the wrapper. These include `flex-1`, `grow`, `shrink-0`, `basis-*`, `col-span-*`, `row-span-*`, `self-*`, `order-*`, outer margins (`mt-*`, `ml-auto`), `w-*`/`max-w-*` meant to size the field in a row, and `absolute`/`relative` placement. Move those classes to an element you wrap around the `Input`, for example `<div className="flex-1"><Input /></div>`. The `<input>` fills that element because the wrapper is `w-full`.
- Child and sibling selectors: `form > input`, `.row > [data-slot=input]` or `[data-slot=input] + p` no longer match. Use a descendant selector (`.row [data-slot=input]`) or target the wrapper (`.row > [data-slot=input-wrapper]`).
- Structural pseudo-classes such as `:first-child` and `:last-child` now apply to the wrapper, not the `<input>`.
- `[data-slot=input-wrapper]` now matches every `Input`. Scope rules meant for inputs with an affix with `:has([data-slot=input-prefix],[data-slot=input-suffix])`.
- In a flex row, an `Input` with an affix now fills the row like an `Input` without one, because its wrapper is `w-full`. Give it a wrapping element with an explicit width if you relied on the narrower size.
- DOM code: `input.parentElement` is now the wrapper, and `nextElementSibling` or `previousElementSibling` on the `<input>` returns `null` when there is no affix.
