# `@beaket/paper` — architecture decisions

A markdown-first, CJK-first Live Preview editor. This is the distilled, load-bearing design
context for the package — a **curated index** of the decisions that constrain future work. The full
records live in [`adr/`](./adr/) (`ADR-0001`–`ADR-0014`, imported & translated from the
`sandbox-beaket-editor` prototype on 2026-06-21); see [`adr/README.md`](./adr/README.md) for when a
change needs an ADR vs. a changeset. Each bullet below links to its ADR.

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
  model), on a CodeMirror 6 engine. The **table widget** is the one exception — entering it never
  unfolds to source; structural syntax (`|`, the delimiter row) is permanently hidden from the user.
  ([ADR-0001](./adr/0001-live-preview-on-codemirror6.md))
- **Consumer config ≠ plugin API.** The editor exposes injection points (`onInsertImage`,
  `slashItems`, the annotation props) as _build-time consumer config_, not a runtime/third-party
  plugin system. A runtime plugin system is out of scope. This extends to **build-time raw
  injection**: there is no blessed `extensions?: Extension[]` (or `keymap`) slot on `EditorOptions` —
  it would leak CM6 into the 1.0-frozen surface and let a consumer break the core invariants. Raw
  access stays on the explicitly-_unsafe_ `getView()` escape hatch; concrete needs route to the
  declarative APIs.
  ([ADR-0015](./adr/0015-no-raw-codemirror-extension-injection-slot.md))

## Load-bearing decisions

- **Table model.** Table structural syntax is permanently hidden; the focused cell is a CodeMirror
  **subview** that shares the document, which keeps undo and IME a single system. Cell line breaks
  are hidden `<br>` elements.
  ([ADR-0002](./adr/0002-table-structure-syntax-permanently-hidden.md),
  [ADR-0003](./adr/0003-cell-editor-as-codemirror-subview.md),
  [ADR-0008](./adr/0008-table-cell-line-break-hidden-br.md))
- **Table keymap invariants.** The grid is a single atomic range (`EditorView.atomicRanges`), so
  the caret never lands _inside_ the table's source text — every table key is an explicit override
  of that default. The rules future work must preserve (no ADR — these document existing behavior;
  they live in `extensions/table-widget.ts`, split model in `extensions/table-model.ts`):
  - **In the cell subview** — `Enter` moves down one row (creating a row past the last one);
    `Shift-Enter` inserts a hidden `<br>` line break (ADR-0008); `Tab` / `Shift-Tab` step to the
    next / previous cell in sequence (wrapping across rows, growing the grid at the end); `↑` / `↓`
    _at the cell's visual top/bottom edge_ move to the adjacent row or **escape** the table (raw
    `↑`/`↓` inside the cell fall through to default intra-cell movement); `←` / `→` _at the text
    start/end_ step to the previous / next cell or escape; `Escape` ends editing and leaves the
    table **block-selected** (outline ring). **Every one of these is suppressed during IME
    composition** (`view.composing`) — commit only, never navigate — per the composing-guard
    contract (invariant #1, CJK first-class).
  - **Around the table (main view)** — `Backspace` immediately after a table first **selects** the
    whole table, and a second `Backspace` **deletes** it (an Obsidian-style two-step, overriding the
    atomic range's one-press delete); `↑` / `↓` on the line adjacent to a table **enters** it
    (symmetric to the edge-arrow escape).
  - **Boundary guard** — a transaction filter blocks deleting the blank-line separator newline(s)
    after a table, which would otherwise let GFM absorb the following paragraph into a table row;
    a change that removes the whole table is allowed through.
- **Composing guard contract (the most expensive invariant).** During `view.composing`: no
  decoration recompute, no widget DOM rebuild, no menu action; map existing decorations to the new
  coordinates; re-evaluate on `compositionend`. **Every new extension or feature must honor this.**
  Locked by `ime-composition.test` / `composing-guard.test`. Decoration-producing extensions go
  through the `guardedDecorations` helper rather than using `ViewPlugin` directly.
  ([ADR-0004](./adr/0004-composing-guard-defer-plus-map.md))
- **Quality strategy.** jsdom **contract tests** + **regression tests**; every bug is fixed
  red → green. Coordinate and visual concerns are deliberately carved out for browser verification
  (jsdom returns zero-size rects via the polyfills in `src/test/setup.ts`).
  ([ADR-0005](./adr/0005-quality-via-jsdom-contract-and-regression-tests.md))
- **Visual language.** "Porcelain, softened"; CSS-variable tokens; evidence-based CJK typography.
  **Trap — CJK font interception:** Japanese fonts must come _before_ Korean in the font stack, or
  shared Han glyphs render in the Korean font (measured). See `theme.ts`.
  ([ADR-0009](./adr/0009-visual-language-porcelain-tokens-cjk-typography.md))
- **Extensibility = mechanism-in-editor / policy-in-consumer.** Images render in the source model;
  _ingestion_ is delegated to the consumer (`onInsertImage`). Slash items are a declarative consumer
  contract with a transformer override; privileged built-ins are kept separate. The `slashItems`
  transformer may resolve **asynchronously** (once-cached on first open, then filtered locally — a
  Loading row meanwhile) and items carry an optional `group` rendered as section headers; per-query
  async is left to `triggers`, not the slash menu ([ADR-0012 amendment](./adr/0012-slash-items-consumer-config.md)).
  **Custom autocomplete triggers** (`@` mentions, `[[` wikilinks) ride the same family:
  `triggers?: TriggerSpec[]`, an
  async `onQuery` source whose items insert a **markdown string** (no `EditorView` exposed), with an
  `onSelect`/`data` passthrough to recover the picked entity. One shared menu engine
  (`menu-engine.ts`) backs both the slash menu and the trigger menu; only one is ever open. **Inserted
  mentions/references render as atomic tokens** via `tokens?: TokenSpec[]` — a declarative `pattern →
{ label, className? }` rendered as a permanently-atomic replace widget (caret steps over, one
  Backspace deletes whole). Identity rides the markdown (recovered from capture groups, no `data`); it
  round-trips to plain markdown (no second model). Built on the `guardedDecorations` `{atomic}` path.
  The same family carries the **embedding options** — `placeholder` (CM6's hint), `readOnly`, and
  explicit sizing (`height` fixed-scroll / `minHeight` grow-floor). `readOnly` sets **both**
  `EditorState.readOnly` **and** `EditorView.editable` (live via `setReadOnly`), with an explicit
  behavior matrix: because `EditorState.readOnly` does not block a raw `view.dispatch`, the
  doc-mutating entry points (image ingest, paste-to-table, and the **table cell subview**, which is a
  separate `EditorView` the parent's `editable` does not reach) each guard on `view.state.readOnly`,
  while the copy buttons keep working. Sizing puts the reserved height on the **editable surface**
  (`.cm-content`), so clicking anywhere in it places a cursor (no dead zone). The family extends to the
  **render layer**: `codeBlockRenderers?: Record<lang, (code, el, ctx) => void | Promise<void>>` lets a
  consumer render a registered fence (e.g. ` ```mermaid `) as a diagram. This is the _inverse_ of the
  image split — there _render_ was trivial and only _ingest_ was delegated; here the render itself needs a
  heavy lib (~3MB), so the **render seam is mechanism, the renderer is policy**. paper ships zero renderer
  bytes; the consumer lazy-`import`s the lib. Live-Preview (raw on-cursor, diagram off-cursor) via a
  **StateField** block decoration (CM6 forbids block decos from a ViewPlugin), split model/render like the
  footnotes — but recomputing on `tr.selection` too, since a code-render widget is cursor-_dependent_.
  Scheme is part of widget identity (a diagram bakes colors at render time, unlike CSS-token constructs),
  so a flip re-renders via an explicit `colorSchemeChangeEffect`; paper owns a `(code, scheme)` cache so a
  flip-back is instant. Throw/reject ⇒ error text (covers syntax errors + install hints).
  ([ADR-0011](./adr/0011-images-render-vs-ingest-consumer-delegation.md),
  [ADR-0012](./adr/0012-slash-items-consumer-config.md),
  [ADR-0016](./adr/0016-declarative-trigger-api.md),
  [ADR-0017](./adr/0017-atomic-token-rendering.md),
  [ADR-0018](./adr/0018-embedding-options-placeholder-readonly-sizing.md),
  [ADR-0023](./adr/0023-consumer-delegated-code-block-rendering.md))
- **Package shape.** Two layers: a framework-agnostic **core** (`createEditor`, zero React) plus a
  thin **React wrapper** (`<Paper>`). Uncontrolled (`defaultValue` + `ref.setValue()`);
  `onChange` emits full markdown on user edits only (IME-guarded; `setValue` does not echo). A
  curated `ref` handle with a `getView()` escape hatch. Shipped as a **standalone npm package**, not
  a copy-paste registry component — so it is exempt from the monorepo's component checklist (no
  Storybook story, no `registry.json`, no `cn` util, no Tailwind). **Controlled-value** consumers are
  served by a documented **controlled-bridge recipe** (a thin `setValue` + `onChange` + `value !==
getValue()` echo-guard wrapper), _not_ a `value` prop — the core stays uncontrolled; a first-class
  `value` prop is deferred as an additive future minor.
  ([ADR-0013](./adr/0013-react-shell-and-distribution.md),
  [ADR-0019](./adr/0019-controlled-value-bridge-recipe.md))
- **Selection annotation = mechanism only, policy to consumer.** The anchor is a `quote` (a source
  substring) plus an `offset`; resolution is 3-state (`exact` / `approximate` / `orphaned`),
  anchored to the **markdown source**, not rendered HTML. Surface: `highlights`,
  `activeHighlightId`, `onHighlightStatusChange`, `onHighlightClick`, `onSelect`.
  ([ADR-0014](./adr/0014-selection-annotation-mechanism.md))

## Versioning

The package starts at `0.x`. Breaking changes ride `0.x` minors (semver-legal pre-1.0). A real major
policy is revisited when the API stabilizes at `1.0`.

## Theming & token reconciliation

Styling is 100% CodeMirror `EditorView.theme` (StyleModule) — no shipped `.css` file, self-contained.
The design separates **tokens** (a customization contract, exposed as CSS variables) from
**structure** (widget layout, decoration rules — implementation detail, kept in JS).

`theme.ts` is the single source of token truth. Every token resolves through a fallback chain whose
public, documented surface is the `--beaket-paper-*` name — extensions never read it; they use the
short internal name (`var(--ink)` etc.) and the mapping lives in one place.

- **Porcelain-bridged tokens** → 3-tier: `var(--beaket-paper-X, var(--color-Y, default))`.
  1. explicit consumer override (editor-owned public name — no need to know porcelain's names),
  2. porcelain bridge (matches `@beaket/ui` for free, inherits its dark-mode block),
  3. built-in default (self-sufficient standalone).
- **Editor-owned tokens** → 2-tier: `var(--beaket-paper-X, default)` (typography, `--canvas`,
  `--surface`, `--syn-*`). No porcelain equivalent; each carries a dark-aware default (dark mode
  shipped in v0.2.0 — see [ADR-0009](./adr/0009-visual-language-porcelain-tokens-cjk-typography.md)'s amendment).

Three customization tiers for consumers: (1) override `--beaket-paper-*` variables, (2) render
inside porcelain for a zero-config match, (3) escape hatches — the stable `.cm-*` class hooks and
`getView()`. Typography (`--beaket-paper-font` / `-font-size` / `-line-height` / `-measure`) is
variabilized because writers tune it; `letter-spacing` is deliberately **not** exposed (negative
spacing breaks mixed-script CJK).

Deliberate, documented local divergences (each now carries a dark-aware value; dark mode shipped in v0.2.0):

- `--color-ink` is overridden locally to `#232a35` (porcelain's `#0a0d14` is too harsh on the
  near-white canvas); it is the default tier of `--ink`'s chain.
- `--canvas` is `#fbfcfd`, a cool near-white writing surface — not porcelain's `--color-paper`
  (`#ffffff`).

**A forced `colorScheme` is authoritative over the bridge** ([ADR-0020](./adr/0020-forced-colorscheme-authoritative-over-bridge.md)).
`"light"`/`"dark"` pin the bridged surface `--color-*` per scheme on `.cm-editor` (the same mechanism
`--color-ink` uses), so a forced scheme beats a consumer `--color-*` bridge that tracks the OS — otherwise
overlays leaked the OS scheme (#472). `"system"` stays unpinned, keeping the porcelain match-for-free;
tier-1 `--beaket-paper-*` is the escape hatch within a forced scheme. The pins are derived off the var()
chains (single source of truth), forced-block-only — never merged into the token maps.

Not yet exposed (deliberate scope cut, revisit on demand): a `theme?: Extension` option to append a
consumer CodeMirror theme.

## Deferred (not bugs) — adjudicated for 1.0 ([#481](https://github.com/beaket/ui/issues/481))

These were reviewed against the 1.0 exit criterion — _"no open P1/P2 bugs, and every Deferred item
resolved or consciously accepted with written rationale"_ ([#481](https://github.com/beaket/ui/issues/481)).
None is a code defect; each is recorded below with its disposition, verified still-current against the
code at adjudication time. The three keep three **distinct** shapes on purpose — a verification carve-out,
a live design deferral, and dormant-code housekeeping — don't flatten them into one "accepted" bullet.

- **Physical-key Korean IME spot-check — _redirected_, not a code deferral.** The guarded paths
  (`setValue`, highlight deferral via `createHighlightController`'s composition hold, and the coalesced
  `onSelect` / `activeHighlightId` flush) are verified with **synthetic** composition events only.
  Real hardware-IME verification is the deliberate boundary of the jsdom strategy
  ([ADR-0005](./adr/0005-quality-via-jsdom-contract-and-regression-tests.md) — jsdom cannot reproduce a
  genuine IME pipeline), and it is owned by the **CJK/IME real-device verification** exit criterion
  ([#483](https://github.com/beaket/ui/issues/483), blocked by the verification-method precursor
  [#479](https://github.com/beaket/ui/issues/479)), not by #481. That exact list of guarded paths is the
  concrete test matrix #483 inherits. Until #483 passes, IME is **delegated and still owed — not verified.**

- **Orphan-status re-emit on in-session delete; prefix/suffix context anchors — _accepted for 1.0_.**
  Reaffirms [ADR-0014](./adr/0014-selection-annotation-mechanism.md) decisions 2 / 7. Bounded
  consequence: when an in-session edit deletes anchored text, `highlightField` only maps positions on
  `docChanged` (no re-resolution), so the collapsed range is dropped on map (empty mark decorations are
  removed) **but the status map still reports the stale `exact` / `approximate`** — self-healing on the
  next `setHighlights`
  or reload (the main re-resolution path). prefix/suffix stay reserved additive-optional `Anchor` slots
  (decision 7 — evolution is additive-optional only), and `onHighlightStatusChange` already emits a full
  map, so both a later orphan re-emit and the B→C context-anchor extension change only _when / what fills
  the map_, never the signature — **the 1.0 interface freeze is not blocked either way.** Resumption
  trigger retained: revisit if observed orphan rates justify prefix/suffix or eager re-emit.

- **`.cm-selectionBackground` dormant — _accepted for 1.0_ (browser-native selection).** The rule in
  `theme.ts` styles `.cm-selectionBackground` with `--accent-sel`, but CM6 only emits that element when
  `drawSelection()` is installed — it is not, so selection stays browser-native and the rule never
  matches. Not installing `drawSelection()` is deliberate: it swaps native selection for a synthetic
  drawn layer that interacts with the contentEditable caret/composition rendering — a poor trade against
  the composing guard (the package's most expensive invariant,
  [ADR-0004](./adr/0004-composing-guard-defer-plus-map.md)) for a purely cosmetic selection tint no
  consumer has requested (lightness — _"there must be a reason to add it"_). The rule is **kept and
  annotated dormant** at the call site: it is the already-wired, dark-aware, consumer-overridable token
  path, so the decision is reversible in one line if demand ever flips. No `drawSelection()` for 1.0.
