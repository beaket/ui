# @beaket/editor

A markdown-first, CJK-first **Live Preview** editor, built on CodeMirror 6.

The markdown text is the single source of truth — the rendered view is derived, and the React
wrapper is **uncontrolled** to enforce that at the API boundary. Only the text under the cursor
shows raw syntax; everything else renders (the Obsidian model). Tables are the one exception: their
structural syntax stays permanently hidden and editing happens inside a shared CodeMirror subview,
so undo and IME composition stay a single system.

> Unlike the components in `@beaket/ui`, this is a **standalone npm package**, not a copy-paste
> registry component.

## Install

```sh
npm install @beaket/editor
# React wrapper also needs react / react-dom (optional peer deps)
npm install react react-dom
```

## Usage

### React

```tsx
import { BeaketEditor, type BeaketEditorHandle } from "@beaket/editor/react";
import { useRef } from "react";

function Editor() {
  const ref = useRef<BeaketEditorHandle>(null);
  return (
    <BeaketEditor
      ref={ref}
      defaultValue="# Hello\n\nStart writing…"
      onChange={(markdown) => console.log(markdown)}
    />
  );
}
```

The editor is uncontrolled: pass `defaultValue` for the initial document and call
`ref.current.setValue(...)` to replace it programmatically. `onChange` fires with the full markdown
on user edits only (it is IME-guarded, and `setValue` does not echo back through it). For anything
the curated handle does not expose, `ref.current.getView()` returns the underlying CodeMirror
`EditorView`.

### Framework-agnostic core

```ts
import { createEditor } from "@beaket/editor";

const editor = createEditor({
  parent: document.querySelector("#editor")!,
  defaultValue: "# Hello",
  onChange: (markdown) => console.log(markdown),
});
```

## Design context

See [`docs/DECISIONS.md`](./docs/DECISIONS.md) for the load-bearing architecture decisions —
the composing guard contract, the table subview model, CJK typography (including the font-stack
trap), the consumer-config extensibility model, and the porcelain token reconciliation.

## Styling

The editor ships its own visual tokens via a CodeMirror theme, scoped to `.cm-editor`, so it works
standalone — no CSS file to import. There are three ways to customize it, from simplest to most
powerful.

### 1. Override CSS variables (the main surface)

Every token resolves through `var(--beaket-editor-X, …)`. Set any of these **anywhere above the
editor** (`:root`, a wrapper element, etc.) and the editor follows — no `!important`, no specificity
fights:

```css
.my-editor-wrapper {
  /* Brand & surface */
  --beaket-editor-accent: #0c6bae; /* links, focus, selection tint, active UI */
  --beaket-editor-ink: #232a35; /* body text + caret */
  --beaket-editor-paper: #ffffff; /* rendered surface */
  --beaket-editor-canvas: #fbfcfd; /* writing canvas (cool near-white) */

  /* Typography — commonly tuned for writing */
  --beaket-editor-font: Georgia, serif;
  --beaket-editor-font-size: 18px;
  --beaket-editor-line-height: 1.7;
  --beaket-editor-measure: 42rem; /* max line width; default `none` = full width */

  /* Code syntax colors */
  --beaket-editor-syntax-keyword: #cf222e;
  --beaket-editor-syntax-string: #0a3069;
  /* …-number, -function, -type, -comment, -tag */

  /* Neutral palette (borders, muted text): --beaket-editor-chrome / -silver / -platinum /
     -aluminum / -muted / -steel / -slate, plus -frost, -surface, -shadow */
}
```

> `letter-spacing` is intentionally **not** exposed — negative spacing breaks mixed-script CJK, so
> it is fixed at `0` (a CJK-first guard).

### 2. Use it inside `@beaket/ui` (zero config)

When rendered within `@beaket/ui`'s porcelain theme, the editor's tokens bridge to porcelain's
`--color-*` variables automatically (the second tier of `var(--beaket-editor-X, var(--color-Y,
default))`), so it matches the design system — including dark mode for the bridged tokens — with no
setup.

### 3. Escape hatches (power users)

Style the stable `.cm-*` class hooks directly (e.g. `.cm-table-widget`, `.cm-slash-menu`,
`.cm-md-copy`), or reach the underlying CodeMirror `EditorView` via `ref.current.getView()` to add
your own extensions/theme.
