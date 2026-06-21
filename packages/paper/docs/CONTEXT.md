# `@beaket/paper` — orientation map

**Read this before editing the package.** It is the _what / where_ map; `DECISIONS.md` is the
_why_ (load-bearing decisions, indexing the full [`adr/`](./adr/) log). Together they are the context
an agent or contributor needs to make a change that fits.

`@beaket/paper` is a markdown-first, CJK-first **Live Preview** editor built on CodeMirror 6 (CM6).
It ships a framework-agnostic **core** plus a thin **React wrapper**. No Tailwind, no `cn`, no
Storybook — it is a standalone npm package, exempt from the monorepo component checklist.

## The one mental model

**The markdown text is the only source of truth.** The rendered view is derived by _decorations_ —
there is no second document model. Everything else follows from this:

- **Live Preview** = only the text under the cursor shows raw syntax; everything else renders. The
  table widget is the single exception (its structural syntax is _permanently_ hidden).
- The React wrapper is **uncontrolled** (`defaultValue` + `ref.setValue()`) to enforce
  source-of-truth at the API boundary; `onChange` emits the full markdown on user edits only.

## Load-bearing invariants — honor these in every change

1. **The composing guard (the most expensive invariant).** During IME composition
   (`view.composing`): no decoration recompute, no widget DOM rebuild, no menu action. Map existing
   decorations to the new coordinates; re-evaluate on `compositionend`. Any decoration-producing
   extension must go through the **`guardedDecorations`** helper (`extensions/composing-guard.ts`),
   never a bare `ViewPlugin`. Locked by `composing-guard.test` / `ime-composition.test`.
   → [ADR-0004](./adr/0004-composing-guard-defer-plus-map.md)
2. **CJK font ordering.** In the font stack, **Japanese fonts must precede Korean** — otherwise
   shared Han glyphs render in the Korean font (measured). Lives in `theme.ts`.
   → [ADR-0009](./adr/0009-visual-language-porcelain-tokens-cjk-typography.md)
3. **Mechanism in editor, policy in consumer.** The editor exposes build-time injection points
   (`onInsertImage`, `slashItems`, the highlight/selection props) — not a runtime plugin system, and
   **not a raw `extensions[]`/`keymap` slot** (that stays on the unsafe `getView()` hatch, ADR-0015).
   Curated APIs deliberately do not expose `EditorView`. Images _render_ in-editor but _ingestion_ is
   delegated; selection annotations are anchored to the **markdown source**, not rendered HTML.
   → [ADR-0011](./adr/0011-images-render-vs-ingest-consumer-delegation.md),
   [ADR-0012](./adr/0012-slash-items-consumer-config.md),
   [ADR-0014](./adr/0014-selection-annotation-mechanism.md),
   [ADR-0015](./adr/0015-no-raw-codemirror-extension-injection-slot.md)
4. **Test boundary.** Logic is covered by jsdom **contract + regression tests** (every bug fixed
   red→green). Coordinate/visual concerns are deliberately _carved out_ — jsdom returns zero-size
   rects (polyfills in `test/setup.ts`), so anything geometry-dependent needs real-browser
   verification, not a jsdom test.
   → [ADR-0005](./adr/0005-quality-via-jsdom-contract-and-regression-tests.md)

## Glossary

| Term                | Meaning                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Preview**    | Render markdown in place; reveal raw syntax only on the line/range under the cursor.                                                                        |
| **decoration**      | A CM6 `Decoration` (mark/replace/widget/line) — how all rendering is done; the doc text is never mutated to render.                                         |
| **widget**          | A `WidgetType` that replaces a range with custom DOM (tables, block images, list bullets).                                                                  |
| **composing guard** | The `view.composing` deferral contract (invariant #1); `guardedDecorations` is its helper.                                                                  |
| **subview**         | A nested CM6 `EditorView` mounted on the one focused table cell, sharing the parent document (keeps undo + IME a single system).                            |
| **anchor**          | A selection annotation's source reference: a `quote` (source substring) + `offset`; resolves 3-state `exact`/`approximate`/`orphaned` against the markdown. |
| **token**           | A `--beaket-paper-*` CSS variable — the public theming contract. Extensions read short internal names (`var(--ink)`); the mapping lives only in `theme.ts`. |
| **consumer config** | Build-time injection points the host app passes in — distinct from a runtime plugin API (out of scope).                                                     |

## Module map (`src/`)

**Assembly & lifecycle**

- `editor/create-editor.ts` — the factory. `createEditor(parent, opts)`, `editorExtensions(opts)`,
  the `EditorOptions` surface, and `defaultSlashItems`. Wires every extension together; precedence
  matters (e.g. `blockquoteKeymap` is `Prec.highest` to beat `markdownKeymap`).
- `editor/value-controller.ts` — `setValue` full-document replacement, IME-safe (deferred during
  composition; does not echo through `onChange`).
- `editor/theme.ts` — single source of token truth; the porcelain bridge + editor-owned tokens; the
  CJK font stack; `colorScheme` / `setColorScheme` (light/dark/system, live via a compartment).
- `editor/extensions/markdown.ts` — the dialect: CommonMark + GFM core (Table, TaskList,
  Strikethrough, Autolink) and the heading/code style ramp.

**Live Preview rendering** (hide syntax off-cursor, render on)

- `extensions/inline-syntax-hiding.ts` — hide inline marks (`**`, `*`, `~~`, `` ` ``) off-cursor.
- `extensions/block-syntax-hiding.ts` — hide block structural marks (headings, fences, HR) by
  cursor-on-block logic.
- `extensions/list-rendering.ts` — bullets `- * +` → •, task markers → checkboxes, off-cursor.
- `extensions/image-widget.ts` — a line that is a lone `![alt](url)` renders as the image (render
  side of images).

**Tables** (structure permanently hidden; cell edited in a subview)

- `extensions/table-widget.ts` — the grid widget + focused-cell subview; the big one.
- `extensions/table-auto-convert.ts` — entry point: type `| A | B |` + Enter → real table.
- `extensions/paste-table-convert.ts` — entry point: paste HTML/TSV tables → markdown table.
- `extensions/cell-inline-renderer.ts` — inline markdown rendering for non-editing cells.

**IME & consumer notifications**

- `extensions/composing-guard.ts` — invariant #1; `guardedDecorations`.
- `extensions/change-notifier.ts` — `onChange` (full markdown on user `docChanged`, IME-guarded).
- `extensions/selection-notifier.ts` — `onSelect` (selected text + screen rect; IME-guarded).

**Selection annotations** (mechanism only)

- `editor/anchor.ts` — `createAnchor` / `resolveAnchor`; the `Anchor`/`AnchorStatus`/`ResolvedAnchor`
  types; reserved `prefix`/`suffix` context slots.
- `extensions/highlight-layer.ts` — renders the consumer's anchor list as mark decorations;
  `setHighlightsEffect` / `setActiveHighlightEffect`; `HighlightInput`.

**Editing keys**

- `extensions/blockquote-keys.ts` — Enter escapes / Tab changes level.
- `extensions/code-block-enter.ts` — Enter in a fence keeps indent, dodges the lazy language parser's
  `indentService`.

**Copy**

- `extensions/markdown-copy.ts` — corner button: copy the whole doc as raw markdown (AI handoff).
- `extensions/code-block-copy.ts` — per-fence "copy code" button.

**Images — ingest**

- `extensions/image-drop.ts` — insert dropped/pasted image files; delegates resolution to
  `onInsertImage` (`ImageResolver`).

**Entries**

- `src/index.ts` — core entry (vanilla, zero React).
- `src/react/index.ts` + `src/react/paper.tsx` — the `<Paper>` wrapper; `PaperHandle`, `PaperProps`.
- `src/test/setup.ts` — jsdom polyfills (and the zero-size-rect boundary of invariant #4).

## Public API surface

**Core (`@beaket/paper`)** — `createEditor`, `editorExtensions`, `defaultSlashItems`,
`setColorScheme`, `createAnchor`, `resolveAnchor`, `setHighlightsEffect`,
`setActiveHighlightEffect`; types `EditorOptions`, `SlashItemSpec`, `SlashItemsConfig`,
`ColorScheme`, `ImageResolver`, `Anchor`, `AnchorStatus`, `ResolvedAnchor`, `HighlightInput`,
`SelectionInfo`.

**React (`@beaket/paper/react`)** — `Paper`; types `PaperHandle`, `PaperProps`, plus the shared
types above.

`EditorOptions`: `doc`, `onChange`, `onInsertImage`, `slashItems`, `onHighlightStatusChange`,
`onHighlightClick`, `onSelect`, `colorScheme`. This surface is slated to **freeze at 1.0**
(milestone `1.0.0`) — breaking changes are cheap on `0.x` minors now, expensive deliberate majors
after.

## Where to make changes

- **A new rendering/behavior extension** → add under `editor/extensions/`, route any decorations
  through `guardedDecorations`, wire it into `create-editor.ts` with the right `Prec`, add a contract
  test. If it changes a load-bearing approach, write an ADR (see [`adr/README.md`](./adr/README.md)).
- **Styling / colors** → `theme.ts` only (token chain), never hard-coded values in extensions.
- **A bug fix or perf tweak** → red→green test + a changeset whose body states the **root cause**
  (no ADR needed). See [`adr/README.md`](./adr/README.md) for the ADR-vs-changeset bar.
