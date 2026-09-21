# Product

<!-- impeccable:product-schema 1 -->

## Scope of this record

This file is product truth for **`@beaket/paper`** — the editor package in
`packages/paper`, published to npm and `npm install`ed.

It exists because the repo-root `PRODUCT.md` describes `@beaket/ui` and
explicitly disclaims this package. Without this file, `packages/paper` inherits
a record whose users, success metric, and visual system are all someone else's.

`sites/paper/` (the standalone docs site and live playground) is a **separate
workspace and still inherits the root record**; it needs its own file if it is
ever worked on through this tooling. `@beaket/ui`'s Ink & Instrument
`DESIGN.md` is **not** this package's visual authority: paper ships its own
CodeMirror theme with no Tailwind, no `cn`, and none of the 69 semantic tokens.

## Platform

web

## Users

**Developers building note-taking and writing tools** who need an
Obsidian-style writing surface inside their own application rather than a
plain textarea or a code editor pressed into service.

Because they are building a writing product rather than adding a comment box,
depth in the authoring surface is what they judge: the slash menu, tables,
footnotes, images, code blocks, and how those behave under a real writing
session. A shallow editor with a wide API does not serve them.

## Product Purpose

Give an embedding developer a markdown editor where **the markdown text is the
only source of truth** and the rendered view is derived from it — Live Preview,
where only the line under the cursor shows raw syntax and everything else
renders inline as you type.

**Success is broad adoption as a general-purpose markdown editor**, competing
directly with the other CodeMirror-based options. That makes feature breadth,
onboarding, API surface, and documentation first-order concerns. CJK correctness
is a differentiator that wins the comparison, not the pitch that starts it.

> Worth knowing: the current README and site copy lead with "markdown-first,
> **CJK-first**." That foregrounds CJK as the headline, which sits at an angle
> to the success definition above. Recorded as an observation, not a decision —
> the copy has not been changed.

## Positioning

Live Preview is not unique. Three things together are:

1. **Live Preview that survives IME composition.** Rewriting the line as you
   type is exactly what breaks Japanese and Korean input in most editors —
   characters dropped or duplicated mid-composition. Paper's composing guard is
   a load-bearing architectural invariant, not a bug fix: during
   `view.composing` there is no decoration recompute, no widget DOM rebuild, and
   no menu action; existing decorations are mapped and re-evaluated on
   `compositionend`.
2. **Mechanism in the editor, policy in the consumer.** Images render in-editor
   but ingestion is delegated; code blocks render through consumer-supplied
   renderers, so paper ships zero renderer bytes for e.g. mermaid; slash items
   and selection annotations are host-configured. These are build-time injection
   points, deliberately not a runtime plugin system.
3. **One document, one undo, one IME.** The focused table cell is a nested
   CodeMirror subview sharing the parent document, so editing inside a table
   never forks the undo history or the composition state.

## Operating Context

- Consumers `npm install @beaket/paper` and import from `.` (framework-agnostic
  core) or `./react` (thin wrapper). React is a peer dependency at `>=18`.
- The React wrapper is **uncontrolled**: `defaultValue` seeds the document,
  `ref.setValue()` replaces it, `onChange` emits full markdown on user edits
  only. This enforces source-of-truth at the API boundary.
- Theming is a documented CSS custom-property contract: every token resolves
  through `var(--beaket-paper-X, …)`. `theme.ts` defines 26 such names and the
  styling docs enumerate the seven most commonly overridden (`accent`, `ink`,
  `canvas`, `font`, `font-size`, `measure`, `word-break`). Extensions read short
  internal names; the mapping lives only in `theme.ts`.
- `ref.getView()` returns the raw CodeMirror `EditorView` as an explicitly
  unsafe escape hatch with no cross-version guarantee.
- Work is organized as a curated GitHub issue queue biased to bugs and
  performance. `agent:ready` is a maintainer-only gate, so filing a candidate is
  not authorizing it. Decisions get an ADR; routine bug and perf fixes get a
  changeset whose body states the root cause.

## Capabilities and Constraints

- **Current version 0.9.1, MIT, pre-1.0.** `1.0.0` is the deadline for
  interface and breaking work — breaking changes are cheap on `0.x` minors and
  expensive deliberate majors afterward. Its exit criteria are all must-have:
  interface freeze plus ADR, zero P1/P2 bugs with every `DECISIONS.md`
  "Deferred" item resolved or accepted with reason, perf targets met and
  measured, and CJK/IME verification on real devices.
- **Dialect**: CommonMark + GFM (tables, task lists, strikethrough, autolink),
  plus a custom lezer parser for footnotes, which GFM has no node for.
- **Built on CodeMirror 6** (`@codemirror/*`, `@lezer/*`). CM6 is deliberately
  kept out of the public surface: there is no `extensions[]` or `keymap` slot.
- **Permanently out of scope** — these are closed questions, not backlog:
  a runtime or third-party plugin system; a raw CodeMirror extension injection
  slot (ADR-0015); **document persistence or storage** — paper takes a
  `defaultValue` and emits `onChange`, and that is the whole contract;
  **a markdown-less WYSIWYG mode** — nothing may break the model that the
  markdown text is the only source of truth; **mobile or touch-first editing** —
  the target is desktop keyboard editing, and touch is best-effort.
- **Explicitly undecided**: collaborative or multiplayer editing (CRDT). It is
  not committed to and not ruled out. Today the editor is a single-document,
  single-author surface and synchronization is the consumer's problem; do not
  record it as either planned or rejected without the maintainer deciding.
- **Test boundary**: logic is covered by jsdom contract and regression tests
  (40 test files; every fixed bug lands red-to-green). Coordinate and visual
  concerns are deliberately carved out — jsdom returns zero-size rects, so
  anything geometry-dependent requires real-browser verification rather than a
  jsdom test.

## Brand Commitments

- Name: **Paper** / `@beaket/paper`. Site tagline: "Write markdown the way it
  reads."
- **Lightness is the test for adding a feature**: input responsiveness, feature
  restraint ("there must be a reason to add it"), visual minimalism. This is a
  stated product value, not a performance target.
- Its visual identity is its own — a standalone site at `sites/paper/` with its
  own brand, separate from the `@beaket/ui` docs. It is not an Ink & Instrument
  surface and must not be redesigned into one.
- The `--beaket-paper-*` token names are a **public contract**; renaming one is
  a breaking change to consumers.

## Evidence on Hand

- Published: `@beaket/paper` 0.9.1 on npm, MIT. The release workflow publishes
  with npm provenance (`id-token: write` in `.github/workflows/release.yml`).
- Docs, API reference and live playground: https://beaket.github.io/ui/paper/
- **23 ADRs** (`docs/adr/0001`–`0023`) recording every load-bearing decision,
  indexed by `docs/DECISIONS.md`; `docs/CONTEXT.md` is the module map;
  `docs/MAINTENANCE.md` holds the queue rules and the 1.0.0 exit criteria.
- 40 test files covering the contract and every regression.

**Absences that must not be filled with invention**: there are no adoption
metrics, no named consumers, no testimonials, and no published benchmarks. The
perf targets named in the 1.0.0 criteria are a goal, not a measured result.

## Product Principles

1. **The markdown text is the only source of truth.** Rendering is derived by
   decorations; there is never a second document model. Any feature that would
   need one is the wrong feature.
2. **IME composition is inviolable.** Correctness during composition outranks
   responsiveness, feature delivery, and code simplicity. Every
   decoration-producing extension goes through the composing guard.
3. **Lightness over completeness.** A feature must earn its place against input
   responsiveness and visual quiet. "It would be nice" is not a reason.
4. **Mechanism, not policy.** Expose build-time injection points and let the
   host decide behavior. Ship no renderer, no uploader, and no storage.
5. **Every change records why.** Decisions get an ADR; fixes get a changeset
   naming the root cause. The reasoning is part of the deliverable.

## Accessibility & Inclusion

CJK correctness is treated as a functional requirement rather than
localization. It means three concrete things: IME composition is never broken by
Live-Preview syntax hide and show; CJK typography is correct, including
per-character line breaking, a font stack in which Japanese precedes Korean
(shared Han glyphs otherwise render in the Korean font — measured), and a
body-readable line height; and editor commands never misfire mid-composition.

Real-device CJK/IME verification is a named 1.0.0 exit criterion, which is an
acknowledgement that jsdom tests cannot establish it.

Beyond CJK, no formal accessibility standard has been adopted for this package.
ARIA is applied per widget rather than to a stated conformance target
(`aria-label` and `aria-hidden` across five source files). Keyboard operation is
the primary input path by design, since touch-first editing is out of scope.
