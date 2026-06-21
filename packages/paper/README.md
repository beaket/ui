# @beaket/paper

A markdown-first, CJK-first **Live Preview** editor for the web, built on CodeMirror 6.

Only the line you're editing shows raw markdown — everything else renders inline as you type. That
live rewriting is exactly what breaks Japanese and Korean IME composition in most editors — dropping
or duplicating characters mid-composition. Paper is built so it never does.

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
doesn't expose, `ref.current.getView()` returns the underlying CodeMirror `EditorView` — the
deliberate raw escape hatch, with no cross-version guarantee (there is no blessed `extensions` slot;
that would lock CM6 into the public surface).

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
[styling guide](https://beaket.github.io/ui/paper/styling).
