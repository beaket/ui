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
  CJK font stack; `colorScheme` / `setColorScheme` (light/dark/system, live via a compartment); the
  `height` / `minHeight` sizing recipes (`sizeTheme` / the pure `sizeRules` seam, ADR-0018).
- `editor/extensions/read-only.ts` — the `readOnly` option: `EditorState.readOnly` +
  `EditorView.editable` in one compartment; `setReadOnly` flips it live (ADR-0018). The doc-mutating
  entry points guard on `view.state.readOnly` themselves (the matrix lives in the ADR).
- `editor/extensions/markdown.ts` — the dialect: CommonMark + GFM core (Table, TaskList,
  Strikethrough, Autolink), the **footnotes** parser config (below), and the heading/code style ramp.

**Live Preview rendering** (hide syntax off-cursor, render on)

- `extensions/inline-syntax-hiding.ts` — hide inline marks (`**`, `*`, `~~`, `` ` ``) off-cursor.
- `extensions/block-syntax-hiding.ts` — hide block structural marks (headings, fences, HR) by
  cursor-on-block logic.
- `extensions/list-rendering.ts` — bullets `- * +` → •, task markers → checkboxes, off-cursor.
- `extensions/image-widget.ts` — a line that is a lone `![alt](url)` renders as the image (render
  side of images).

**Footnotes** (GitHub-style; ADR-0021. Always-on, no consumer config)

- `extensions/footnotes-syntax.ts` — the `@beaket/paper` `MarkdownConfig` adding real
  `FootnoteReference` (inline) + `FootnoteDefinition` (block) nodes, since GFM ships none. Wired into
  `markdown.ts`. `endLeaf` lets a definition interrupt a paragraph (no blank line needed).
- `extensions/footnote-render.ts` — `computeFootnotes(state)` (the one pure model: numbering by
  first-reference order; the pure test seam) + the ViewPlugin rendering: a `[^1]` reference → superscript
  reveal-on-cursor, and a referenced definition rendered **in place** off-cursor (number + body),
  locatable and clickable, raw on-cursor.
- `extensions/footnote-section.ts` — the collected "footnotes at the end" list. The package's **first
  StateField-provided block decoration** (CM6 forbids block decorations from a ViewPlugin); IME-safe via
  the widget's `eq()` + `docChanged`-only recompute. `mousedown` on an item jumps the cursor to its
  source definition (the collected list is a read-only preview — editing is always at the source).

**Tables** (structure permanently hidden; cell edited in a subview)

- `extensions/table-widget.ts` — the grid widget + focused-cell subview; the big one.
- `extensions/table-auto-convert.ts` — entry point: type `| A | B |` + Enter → real table.
- `extensions/paste-table-convert.ts` — entry point: paste HTML/TSV tables → markdown table.
- `extensions/cell-inline-renderer.ts` — inline markdown rendering for non-editing cells.

**IME & consumer notifications**

- `extensions/composing-guard.ts` — invariant #1; `guardedDecorations` (opt-in `{atomic}` also exposes
  the guarded set as `EditorView.atomicRanges`, ADR-0017).
- `extensions/change-notifier.ts` — `onChange` (full markdown on user `docChanged`, IME-guarded).
- `extensions/selection-notifier.ts` — `onSelect` (selected text + screen rect; IME-guarded).

**Selection annotations** (mechanism only)

- `editor/anchor.ts` — `createAnchor` / `resolveAnchor`; the `Anchor`/`AnchorStatus`/`ResolvedAnchor`
  types; reserved `prefix`/`suffix` context slots.
- `extensions/highlight-layer.ts` — renders the consumer's anchor list as mark decorations;
  `setHighlightsEffect` / `setActiveHighlightEffect`; `HighlightInput`.

**Menus (trigger-activated)**

- `extensions/menu-engine.ts` — the shared popup-menu engine (`PopupMenu`, `menuKeyBindings` /
  `menuKeymap`, `menuTheme`): menu DOM, selected-index, keyboard nav, porcelain overlay, and
  non-interactive header/loading rows (selection skips them). Both menus below are thin controllers
  over it (ADR-0016). Coordinate-dependent → browser-verified, not jsdom.
- `extensions/slash-command.ts` — the `/` insert menu; declarative `slashItems` config + privileged
  built-ins (table `after`). Catalog resolves sync or **async** (once-cached, Loading row) and items
  carry an optional `group` rendered as section headers (ADR-0012 + its amendment). `resolveSlashItems`
  (sync resolve) and `buildMenuRows` (filter + headers) are the pure test seams. → ADR-0012.
- `extensions/trigger-menu.ts` — declarative consumer triggers (`@` mentions, `[[` wikilinks); the
  `triggers` option, async `onQuery` with stale-response discarding, `onSelect` + `data` passthrough.
  `matchTrigger` / `isResponseCurrent` are the pure test seams. → ADR-0016.
- `extensions/token-render.ts` — atomic token rendering (the `tokens` option): a consumer `pattern →
view` rendered as a permanently-atomic replace-widget (caret steps over, one Backspace deletes whole;
  identity from capture groups; code-skipped; round-trips to markdown). Rides the `guardedDecorations`
  `{atomic}` path. `findTokenMatches` / `tokenEndingAt` are the pure test seams. → ADR-0017.

**Editing keys**

- `extensions/blockquote-keys.ts` — Enter escapes / Tab changes level.
- `extensions/code-block-autoclose.ts` — Enter on an _opening_ fence line auto-inserts the matching
  close + a blank middle line (cursor parked there); skips already-closed blocks via the `FencedCode`
  `CodeMark` count. Disjoint from `code-block-enter` (delimiter line vs. content line).
- `extensions/code-block-enter.ts` — Enter in a fence keeps indent, dodges the lazy language parser's
  `indentService`.
- `extensions/wrap-selection.ts` — wrap-on-type (Notion/Obsidian): typing a pair opener (`(` `[` `{`
  `` ` `` `"` `'` `*`) over a selection surrounds it, keeping the selection on the inner text (so a
  second press nests → `**bold**`). The package's first `EditorView.inputHandler`; pure seam
  `wrapEdit(state, text)`. Empty selection / pasted text fall through to default insertion.

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
`setColorScheme`, `setReadOnly`, `createAnchor`, `resolveAnchor`, `setHighlightsEffect`,
`setActiveHighlightEffect`; types `EditorOptions`, `SlashItemSpec`, `SlashItemsConfig`,
`TriggerSpec`, `TriggerItem`, `TokenSpec`, `TokenView`, `ColorScheme`, `ImageResolver`, `Anchor`,
`AnchorStatus`, `ResolvedAnchor`, `HighlightInput`, `SelectionInfo`.

**React (`@beaket/paper/react`)** — `Paper`; types `PaperHandle`, `PaperProps`, plus the shared
types above.

`EditorOptions`: `doc`, `onChange`, `onInsertImage`, `slashItems`, `triggers`, `tokens`,
`onHighlightStatusChange`, `onHighlightClick`, `onSelect`, `colorScheme`, `placeholder`, `readOnly`,
`height`, `minHeight` (ADR-0018). This surface is slated to
**freeze at 1.0**
(milestone `1.0.0`) — breaking changes are cheap on `0.x` minors now, expensive deliberate majors
after.

## Where to make changes

- **A new rendering/behavior extension** → add under `editor/extensions/`, route any decorations
  through `guardedDecorations`, wire it into `create-editor.ts` with the right `Prec`, add a contract
  test. If it changes a load-bearing approach, write an ADR (see [`adr/README.md`](./adr/README.md)).
- **Styling / colors** → `theme.ts` only (token chain), never hard-coded values in extensions.
- **A bug fix or perf tweak** → red→green test + a changeset whose body states the **root cause**
  (no ADR needed). See [`adr/README.md`](./adr/README.md) for the ADR-vs-changeset bar.
