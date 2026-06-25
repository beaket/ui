---
"@beaket/paper": minor
---

Add `codeBlockRenderers` — consumer-delegated code-block rendering (ADR-0023). A registered fenced language (e.g. ` ```mermaid `) renders as a block widget off-cursor and reveals its raw source on-cursor (Live Preview); the editor ships **zero renderer bytes and zero renderer opinion** — the consumer installs the renderer (mermaid, etc.) and injects it.

```ts
import mermaid from "mermaid"; // or lazy-import it (see README recipe)

<Paper codeBlockRenderers={{
  mermaid: async (code, el, ctx) => {
    mermaid.initialize({ startOnLoad: false, theme: ctx.colorScheme === "dark" ? "dark" : "default" });
    const { svg } = await mermaid.render(`d-${Date.now()}`, code);
    el.innerHTML = svg;
  },
}} />
```

- **Mechanism in editor, policy in consumer**, extended to the render layer. This is the inverse of the image split (ADR-0011): there _render_ was trivial and only _ingest_ was delegated; here the render itself needs a heavy library (~3MB), so the render _seam_ is the mechanism and the _renderer_ is the policy. The key is the fence info-string language; an unregistered language stays a normal code block, and an empty/absent `codeBlockRenderers` is a complete no-op (existing consumers unaffected).
- **Signature:** `(code, el, ctx: { colorScheme: "light" | "dark" }) => void | Promise<void>`. The renderer replaces `el`'s content (sync or async). **Throw or reject ⇒ paper shows error text** in the widget — one path for both syntax errors and a missing-dependency hint (the text is the consumer's, so it never presumes a package manager; the display is paper's).
- Implemented as a **StateField** block decoration (CM6 forbids block decos from a ViewPlugin), split into a `docChanged`-only model and a decoration field that also recomputes on `tr.selection` (a code-render widget is cursor-_dependent_, unlike the footnote section). IME-safe via the widget's `(lang, code, scheme)` `eq()`.
- **Theme-synced:** a diagram bakes colors at render time, so the scheme is part of the widget identity and a `setColorScheme` flip (or an OS flip while following `"system"`) re-renders, via a new `colorSchemeChangeEffect`. A per-editor `(lang, scheme, code)` cache makes flip-back / scroll-back instant.

Exports: `CodeBlockRenderer`, `CodeBlockRenderers`, `CodeBlockRenderContext` (core + `/react`).
