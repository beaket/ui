# `@beaket/editor` — architecture decisions

A markdown-first, CJK-first Live Preview editor. This is the distilled, load-bearing design
context for the package. It was seeded from the `sandbox-beaket-editor` prototype's 14 ADRs during
migration (2026-06-17); only the decisions that constrain future work are kept here.

## Core domain

- **Source of truth = the markdown text.** The rendered view is derived; there is no second model.
  The React wrapper is **uncontrolled** to enforce this at the API boundary.
- **CJK first-class** means three concrete things (not i18n):
  1. IME composition is never broken by Live-Preview syntax hide/show.
  2. CJK typography is correct — per-character line breaking, a font stack where Japanese precedes
     Korean (see "CJK font interception" below), and body-readable line height.
  3. Editor commands (slash menu, etc.) never misfire mid-composition.
- **Lightness** is the test for adding a feature: input responsiveness, feature restraint ("there
  must be a reason to add it"), visual minimalism.
- **Live Preview**: only the text under the cursor shows raw syntax; the rest renders (the Obsidian
  model). The **table widget** is the one exception — entering it never unfolds to source;
  structural syntax (`|`, the delimiter row) is permanently hidden from the user.
- **Consumer config ≠ plugin API.** The editor exposes injection points (`onInsertImage`,
  `slashItems`, the annotation props) as _build-time consumer config_, not a runtime/third-party
  plugin system. A runtime plugin system is out of scope.

## Load-bearing decisions

- **Table model.** Table structural syntax is permanently hidden; the focused cell is a CodeMirror
  **subview** that shares the document, which keeps undo and IME a single system. Cell line breaks
  are hidden `<br>` elements.
- **Composing guard contract (the most expensive invariant).** During `view.composing`: no
  decoration recompute, no widget DOM rebuild, no menu action; map existing decorations to the new
  coordinates; re-evaluate on `compositionend`. **Every new extension or feature must honor this.**
  Locked by `imeComposition.test` / `composingGuard.test`. Decoration-producing extensions go
  through the `guardedDecorations` helper rather than using `ViewPlugin` directly.
- **Quality strategy.** jsdom **contract tests** + **regression tests**; every bug is fixed
  red → green. Coordinate and visual concerns are deliberately carved out for browser verification
  (jsdom returns zero-size rects via the polyfills in `src/test/setup.ts`).
- **Visual language.** "Porcelain, softened"; CSS-variable tokens; evidence-based CJK typography.
  **Trap — CJK font interception:** Japanese fonts must come _before_ Korean in the font stack, or
  shared Han glyphs render in the Korean font (measured). See `theme.ts`.
- **Extensibility = mechanism-in-editor / policy-in-consumer.** Images render in the source model;
  _ingestion_ is delegated to the consumer (`onInsertImage`). Slash items are a declarative consumer
  contract with a transformer override; privileged built-ins are kept separate.
- **Package shape.** Two layers: a framework-agnostic **core** (`createEditor`, zero React) plus a
  thin **React wrapper** (`<BeaketEditor>`). Uncontrolled (`defaultValue` + `ref.setValue()`);
  `onChange` emits full markdown on user edits only (IME-guarded; `setValue` does not echo). A
  curated `ref` handle with a `getView()` escape hatch. Shipped as a **standalone npm package**, not
  a copy-paste registry component — so it is exempt from the monorepo's component checklist (no
  Storybook story, no `registry.json`, no `cn` util, no Tailwind).
- **Selection annotation = mechanism only, policy to consumer.** The anchor is a `quote` (a source
  substring) plus an `offset`; resolution is 3-state (`exact` / `approximate` / `orphaned`),
  anchored to the **markdown source**, not rendered HTML. Surface: `highlights`,
  `activeHighlightId`, `onHighlightStatusChange`, `onHighlightClick`, `onSelect`.

## Versioning

The package starts at `0.x`. Breaking changes ride `0.x` minors (semver-legal pre-1.0). A real major
policy is revisited when the API stabilizes at `1.0`.

## Theming & token reconciliation

Styling is 100% CodeMirror `EditorView.theme` (StyleModule) — no shipped `.css` file, self-contained.
The design separates **tokens** (a customization contract, exposed as CSS variables) from
**structure** (widget layout, decoration rules — implementation detail, kept in JS).

`theme.ts` is the single source of token truth. Every token resolves through a fallback chain whose
public, documented surface is the `--beaket-editor-*` name — extensions never read it; they use the
short internal name (`var(--ink)` etc.) and the mapping lives in one place.

- **Porcelain-bridged tokens** → 3-tier: `var(--beaket-editor-X, var(--color-Y, default))`.
  1. explicit consumer override (editor-owned public name — no need to know porcelain's names),
  2. porcelain bridge (matches `@beaket/ui` for free, inherits its dark-mode block),
  3. built-in default (self-sufficient standalone).
- **Editor-owned tokens** → 2-tier: `var(--beaket-editor-X, default)` (typography, `--canvas`,
  `--surface`, `--syn-*`). No porcelain equivalent; each needs a dark value when dark mode lands.

Three customization tiers for consumers: (1) override `--beaket-editor-*` variables, (2) render
inside porcelain for a zero-config match, (3) escape hatches — the stable `.cm-*` class hooks and
`getView()`. Typography (`--beaket-editor-font` / `-font-size` / `-line-height` / `-measure`) is
variabilized because writers tune it; `letter-spacing` is deliberately **not** exposed (negative
spacing breaks mixed-script CJK).

Deliberate, documented local divergences (each needs a dark-aware value when dark mode lands):

- `--color-ink` is overridden locally to `#232a35` (porcelain's `#0a0d14` is too harsh on the
  near-white canvas); it is the default tier of `--ink`'s chain.
- `--canvas` is `#fbfcfd`, a cool near-white writing surface — not porcelain's `--color-paper`
  (`#ffffff`).

Not yet exposed (deliberate scope cut, revisit on demand): a `theme?: Extension` option to append a
consumer CodeMirror theme, and a managed dark-mode token set for the editor-owned tokens.

## Deferred (not bugs)

- Physical-key Korean IME spot-check for the guarded paths (`setValue`, highlight deferral, coalesced
  `onSelect` flush) — verified with synthetic composition events only.
- Orphan-status re-emit during a delete; prefix/suffix context anchors (the `Anchor` type reserves
  both fields) — defer until real orphan rates are observed.
- `.cm-selectionBackground` is dormant (no `drawSelection()`); selection uses the browser-native
  highlight. Add `drawSelection()` if a porcelain selection tint is wanted.
- Dark mode (the `@media (prefers-color-scheme: dark)` block). Porcelain-mapped tokens inherit
  porcelain's dark block for free; editor-owned tokens (`--syn-*`, `--canvas`, the `--color-ink`
  override) each need a dark value.
