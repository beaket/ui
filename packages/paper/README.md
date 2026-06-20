# @beaket/paper

A markdown-first, CJK-first **Live Preview** editor for the web, built on CodeMirror 6.

Only the line you're editing shows raw markdown — everything else renders inline as you type. And
it's CJK-first: Korean, Japanese, and Chinese input never drops or duplicates characters
mid-composition, the bug most live-preview editors still trip on.

**[Full docs, API reference & live playground →](https://beaket.github.io/ui/paper/)**

## Install

```sh
npm install @beaket/paper
```

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

The editor ships its own theme — nothing to import — and is fully themeable through
`--beaket-paper-*` CSS variables, with dark mode built in (it follows the OS `prefers-color-scheme`).
The tokens, the `--color-*` design-token bridge, and the `.cm-*` escape hatches are in the
**[styling guide →](https://beaket.github.io/ui/paper/styling)**.
