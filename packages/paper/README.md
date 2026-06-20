# @beaket/paper

A markdown-first, CJK-first **Live Preview** editor for the web, built on CodeMirror 6.

The markdown text is the single source of truth — the rendered view is derived, and the React
wrapper is **uncontrolled** to enforce that at the API boundary. Only the text under the cursor shows
raw syntax; everything else renders (the Obsidian model). Tables are the one exception: their
structural syntax stays hidden and editing happens inside a shared CodeMirror subview, so undo and
IME composition stay a single system.

**[Full docs, API reference & live playground →](https://beaket.github.io/ui/paper/)**

## Install

```sh
npm install @beaket/paper
```

The React wrapper (`@beaket/paper/react`) also needs `react` and `react-dom` (`>=18`). They're
**optional** peer dependencies — install them only if you use the wrapper. The framework-agnostic
core has none.

## Quick start (React)

```tsx
import { Paper, type PaperHandle } from "@beaket/paper/react";
import { useRef } from "react";

function Editor() {
  const ref = useRef<PaperHandle>(null);
  return (
    <Paper
      ref={ref}
      defaultValue={"# Hello\n\nStart writing…"}
      onChange={(markdown) => console.log(markdown)}
    />
  );
}
```

The editor is **uncontrolled**: `defaultValue` seeds the initial document, and you replace it
programmatically with `ref.current.setValue(...)`. `onChange` fires with the full markdown on user
edits only — it's IME-guarded, and `setValue` doesn't echo back through it. For anything the handle
doesn't expose, `ref.current.getView()` returns the underlying CodeMirror `EditorView`.

If `Paper` collides with another import, alias it: `import { Paper as BeaketPaper } from "@beaket/paper/react"`.

See the [API reference](https://beaket.github.io/ui/paper/api) for the full prop and handle surface.

## Framework-agnostic core

No React? Mount the core onto any element — it returns the CodeMirror `EditorView`. The React wrapper
is thin wiring over this surface.

```ts
import { createEditor } from "@beaket/paper";

const editor = createEditor(document.querySelector("#editor")!, {
  doc: "# Hello",
  onChange: (markdown) => console.log(markdown),
});
```

## Styling

The editor ships its own theme scoped to `.cm-editor`, so it works standalone — no CSS file to
import. Override any token by setting `--beaket-paper-*` **anywhere above the editor** (`:root`, a
wrapper element, etc.) — no `!important`, no specificity fights:

```css
.my-editor-wrapper {
  --beaket-paper-accent: #0c6bae; /* links, focus, selection */
  --beaket-paper-ink: #232a35; /* body text + caret */
  --beaket-paper-font: Georgia, serif;
  --beaket-paper-font-size: 18px;
  --beaket-paper-measure: 42rem; /* max line width; default `none` = full width */
}
```

Dark mode is built in (follows the OS `prefers-color-scheme`, no config), and if your app already
exposes a `--color-*` design-token palette the editor bridges to it automatically. The full token
list, the design-token bridge, and the `.cm-*` escape hatches are in the
**[styling guide →](https://beaket.github.io/ui/paper/styling)**.

---

Architecture & design decisions: [`docs/DECISIONS.md`](https://github.com/beaket/ui/blob/main/packages/paper/docs/DECISIONS.md).
