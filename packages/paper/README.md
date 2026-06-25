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

Common embedding options: `placeholder` (hint on an empty document), `readOnly` (a live-flippable
view mode — typing/ingest off, selection and copy still work), and explicit sizing — `height` for a
fixed height that scrolls, or `minHeight` to grow with content while keeping the whole editable
surface clickable (no dead zone below short content).

See the [API reference](https://beaket.github.io/ui/paper/api) for the full prop and handle surface.

## Rendering code blocks (e.g. mermaid)

Paper renders a fenced code block as a diagram off-cursor (raw source on-cursor) when you give it a
renderer for that language — but it ships **no renderer and no dependency** of its own. You install the
renderer (here `mermaid`, ~3MB) and inject it, so it stays out of Paper's bundle and `import()`s lazily:

````tsx
import { Paper, type CodeBlockRenderers } from "@beaket/paper/react";

let load: Promise<typeof import("mermaid").default> | null = null;
let n = 0;
const codeBlockRenderers: CodeBlockRenderers = {
  // key = the fence info string, e.g. ```mermaid
  mermaid: async (code, el, ctx) => {
    const mermaid = await (load ??= import("mermaid").then((m) => m.default));
    // Re-initialize per render so a light/dark flip re-themes (mermaid bakes colors at render time).
    mermaid.initialize({
      startOnLoad: false,
      theme: ctx.colorScheme === "dark" ? "dark" : "default",
    });
    const { svg } = await mermaid.render(`mermaid-${++n}`, code); // throws on a syntax error → Paper shows it
    el.innerHTML = svg;
  },
};

<Paper
  defaultValue={"```mermaid\nflowchart LR\n  A --> B\n```"}
  codeBlockRenderers={codeBlockRenderers}
/>;
````

The renderer is `(code, el, ctx: { colorScheme }) => void | Promise<void>` and **replaces `el`'s
content**. If it **throws or rejects**, Paper renders the error text in place — use that for both syntax
errors and a `try { await import("mermaid") } catch { throw new Error("Run: npm install mermaid") }`
install hint. Unregistered languages stay normal code blocks. Paper caches per `(language, scheme, code)`,
so a theme flip-back or scroll-back is instant.

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
