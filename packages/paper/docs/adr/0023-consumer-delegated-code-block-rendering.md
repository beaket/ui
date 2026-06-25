# 0023 — Consumer-delegated code-block rendering: extend mechanism/policy to the render layer

- **Status:** Accepted
- **Date:** 2026-06-25
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Consumer-delegated code-block rendering — the editor owns the render _seam_, the consumer owns the _renderer_

## Context

The recurring ask is "render `mermaid` (and friends) diagrams in the editor." The instinct is to bundle
a diagram renderer the way images render natively. But a diagram renderer is heavy — mermaid alone is
~3MB — and `@beaket/paper`'s stance (CONTEXT.md invariant #3, and the whole consumer-config family
ADR-0011/0012/0016/0017) is **minimal opinion, freeze the API at 1.0**. Bundling a specific renderer
would weld a 3MB dependency and one library's opinion into a package whose entire selling point is being
small and unopinionated.

This is the **inverse** of ADR-0011. There, images split cleanly: _render_ is trivial (the URL is
already in the source; an `<img>` is zero-dependency), so the editor renders natively, and only _ingest_
(which needs a storage policy) is delegated. A diagram fence has the URL-equivalent already in the source
too (the fence body **is** the diagram source) — but the **render itself needs a heavy library**. So the
thing ADR-0011 kept in-house (render) is exactly the thing that must be delegated here. The split isn't
render-vs-ingest this time; it's **render-seam (mechanism) vs renderer (policy)** — the same
mechanism-in-editor / policy-in-consumer principle pushed one layer deeper, into the render layer itself.

The bundle worry that started this resolves once you see that pure delegation and a lazy `import()` are a
wash on the _base_ bundle (both load the heavy lib only on demand). The real axis is **ownership and
coupling**, and there delegation wins decisively for a freeze-at-1.0 package: the consumer owns the lib,
its version, its lazy-load, and — crucially — the only layer that can catch a runtime "module not found"
and turn it into an install hint.

## Decision 1 — pure delegation: the editor ships zero renderer bytes

`@beaket/paper` exposes a generic code-block render **seam**; the consumer installs `mermaid` (or any
renderer) and injects it. The package carries no diagram code and no diagram opinion.

A future `@beaket/paper/mermaid` subpath helper (a few lines of `import("mermaid")` glue) is **deferred,
not rejected** — additive later if consumers keep rewriting the same glue or want a runtime
missing-dependency hint (e.g. "Install mermaid to render diagrams"). The lazy-`import` owner is the only
layer that can catch module-not-found at runtime, so that helper, if it ships, lives there.

## Decision 2 — an imperative renderer signature; throw/reject ⇒ error text

```ts
type CodeBlockRenderer = (
  code: string,
  el: HTMLElement,
  ctx: { colorScheme: "light" | "dark" },
) => void | Promise<void>;

interface EditorOptions {
  codeBlockRenderers?: Record<string, CodeBlockRenderer>; // key = fence info-string language
}
```

The renderer **replaces** `el`'s content (sync or async). A **throw or reject** makes paper render error
text in the widget — this one path covers both a syntax error and a missing-dependency hint (the consumer
writes the message, so it never presumes a package manager): the **text is policy** (the consumer decides
what to say), the **display is mechanism** (paper owns where it shows). An imperative `(code, el, ctx)` signature — rather than "return a string/VNode" — lets a
consumer drive any renderer's native output (mermaid hands back an SVG string; another lib might mutate a
canvas) without paper modelling a return shape it would have to freeze at 1.0.

## Decision 3 — Live Preview: cursor in ⇒ raw source, cursor out ⇒ diagram

Same reveal-on-cursor contract as every other rendered construct. The cursor inside a registered fence
shows the raw source (zero render while editing); outside, the diagram. The block is hidden behind a
**block replace decoration**, which CM6 forbids from a `ViewPlugin` ("Block decorations may not be
specified via plugins") — so this is a **StateField**, like the footnote section (ADR-0021).

A `StateField` cannot use the composing guard (ADR-0004) the way a `ViewPlugin` does. IME safety instead
comes from the widget's `eq()` being `(lang, code, scheme)`: composing into prose leaves every _other_
block's key unchanged → `eq` true → CM6 keeps the DOM, no rebuild near the composition; and the block
being edited has the cursor in it → excluded → no widget at all. The one residual edge — composing a
character that straddles a fence boundary — is an accepted v1 limit (a StateField has no guard to defer
it).

The field is split, mirroring footnote `model`/`render` (ADR-0021): a cursor-**independent** model field
(the candidate fences) recomputes only on `docChanged`, so the whole-document syntax scan stays off the
cursor-move path; a decoration field filters that model by the selection and the scheme. This is the
correction to a tempting-but-wrong "recompute on docChanged only" (copied from footnote-section, which is
cursor-independent): a code-render widget is cursor-**dependent**, so it must also recompute on
`tr.selection` — otherwise clicking into a block never reveals its source.

## Decision 4 — theme sync: re-render on a scheme flip

A diagram renderer **bakes colors at render time** (mermaid picks node/edge colors from its theme when it
renders), unlike paper's CSS-token constructs which follow the scope class for free. So the scheme is part
of the widget's identity (`eq` includes it), and a flip re-runs the renderer with the new
`ctx.colorScheme`. The decoration field observes an explicit **`colorSchemeChangeEffect`** (a `StateField`
has no clean way to detect a compartment reconfigure), which `setColorScheme` now dispatches alongside the
compartment swap. An OS-level flip while following `"system"` is handled by a small `matchMedia` watcher
that re-dispatches the effect; a forced light/dark scheme ignores OS flips.

## Decision 5 — paper owns a `(code, scheme)` content cache + naive renderer

paper keeps a per-editor `(lang, scheme, code) → rendered HTML` cache and only calls the renderer on a
miss; a flip-back or scroll-back is a cache hit (instant, no re-render). The renderer stays naive — a
one-liner `mermaid.render` — and never has to think about memoization. Stale async completions need no
generation token: each `(code, scheme)` owns its own widget+container and CM6 swaps containers on an `eq`
mismatch, so a late write lands on a now-detached node (harmless), and a cached entry is never stale for
its own key.

## Decision 6 — scope (v1)

- **Registered languages only.** An unregistered ` ```mermaid ` (no renderer for it) falls through to a
  normal code block. An empty registry is a complete no-op (existing consumers unaffected).
- **Fenced code only** — no inline or indented code.
- **Loading placeholder:** paper pre-fills `el` with the **dimmed raw source** as a placeholder
  (mechanism — it is document text, not renderer output), and the consumer's render (which may lazy-import
  a heavy lib) replaces it; height settles via `view.requestMeasure()` (the image-widget / ADR-0003
  pattern). On reject, the placeholder is replaced with error text.
- **No widget buttons in v1** (no copy/export chrome on the diagram).
- **Nested fences** (in a blockquote or list) **render** — the lezer `CodeText` is already
  prefix-stripped, so the renderer gets clean source — with the v1 trade-off that the diagram is **not**
  visually wrapped in the quote/list chrome (the block-replace covers the whole line, prefix included).
  The source round-trips untouched on edit.
- Coexists with `code-block-copy` / `code-block-enter` / autoclose automatically: those act on a touched
  (cursor-in) block, where this renders nothing.

## Decision 7 — tests and docs

- New `editor/extensions/code-block-render.ts`. The pure seam `computeCodeBlocks(state, registeredLangs)`
  is the jsdom contract target (which fences become candidates, unregistered pass-through, lang/code/range
  extraction, nested fences) — a **fake sync renderer** exercises the cursor filter, the rendered DOM, the
  error path, the scheme handoff, and the cache through a mounted view (ADR-0005). Real SVG geometry is
  carved out for the browser (invariant #4), verified in `sites/paper`.
- This ADR (a _new_ decision, **not** an amendment of ADR-0011 — it cites and contrasts it) + a
  `@beaket/paper` **minor** changeset + the `codeBlockRenderers` entry in CONTEXT.md's EditorOptions
  surface + the `sites/paper` reference wiring (real mermaid) and a README copy-paste recipe.

## Consequences

- The package gains a render-extensibility seam without gaining a single renderer byte or opinion — the
  consumer-config family (ADR-0011/0012/0016/0017) now extends to the render layer.
- A consumer wanting mermaid writes ~8 lines of lazy-import glue (the README recipe). If that proves
  repetitive across consumers, the deferred `@beaket/paper/mermaid` helper (Decision 1) is the additive
  follow-up.
- A new public option (`codeBlockRenderers`) joins the surface that freezes at 1.0.
