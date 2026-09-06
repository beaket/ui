# @beaket/paper

## 0.9.1

### Patch Changes

- [#906](https://github.com/beaket/ui/pull/906) [`0d51ce4`](https://github.com/beaket/ui/commit/0d51ce4be915e49140a026db2389d27717ce681b) Thanks [@jihnma](https://github.com/jihnma)! - Stop exporting three symbols that never left their module

  `cellSync` and `clearActiveCell` (`table-widget.ts`) and `sourceHighlighting`
  (`markdown.ts`) carried an `export` keyword while being used only inside their own
  file. None was re-exported from `index.ts`, so no consumer could reach them
  through the package's `exports` map. No public API changes.

## 0.9.0

### Minor Changes

- [#616](https://github.com/beaket/ui/pull/616) [`fd2cfc8`](https://github.com/beaket/ui/commit/fd2cfc8509c4ee99de81828bd4b99e3763e287a6) Thanks [@jihnma](https://github.com/jihnma)! - fix(react): `PaperHandle.getView()` returns `undefined` before mount instead of throwing

  Root cause: the `EditorView` is created in a passive `useEffect`, which runs after the commit
  phase, while React `ref` callbacks (and `useImperativeHandle`) fire during commit. A consumer using
  the documented `getView()` escape hatch from a ref callback therefore hit `viewRef.current === null`
  and the handle threw `Paper: view is not mounted yet`, crashing the React tree on first render.

  Fix: `getView()` now returns `EditorView | undefined`, yielding `undefined` until the view mounts.
  The idiomatic `const v = h.getView(); if (!v) return;` now works, bringing the hatch in line with its
  curated siblings — `getSelection()` returns `null`, `getValue()` returns `""` — instead of being the
  one handle that throws.

  This changes the return type from `EditorView` to `EditorView | undefined` (a semver-legal breaking
  type change on `0.x`). See ADR-0013's 2026-07-11 amendment; the `onReady` callback and raw
  `extensions[]` slot from the issue were deliberately not added (ADR-0015).

### Patch Changes

- [#617](https://github.com/beaket/ui/pull/617) [`78d1b49`](https://github.com/beaket/ui/commit/78d1b49d4501abdecbcacf88d9a79ae6138970af) Thanks [@jihnma](https://github.com/jihnma)! - docs(paper): adjudicate the DECISIONS.md "Deferred (not bugs)" list for the 1.0 gate

  Root cause: the 1.0 exit criterion ([#481](https://github.com/beaket/ui/issues/481)) requires every `DECISIONS.md` Deferred item to be resolved
  or consciously accepted with written rationale, but the three items were still recorded as open
  deferrals. Verified all three against current code — accurate, not stale — and adjudicated each without
  any behavior change:

  - **Physical-key Korean IME spot-check** — redirected, not a [#481](https://github.com/beaket/ui/issues/481) code deferral: it is the deliberate
    jsdom-strategy boundary (ADR-0005) and is owned by the CJK/IME real-device verification gate ([#483](https://github.com/beaket/ui/issues/483),
    blocked by [#479](https://github.com/beaket/ui/issues/479)). The specific guarded paths (`setValue`, highlight-deferral hold, coalesced
    `onSelect`/active flush) are recorded as the matrix [#483](https://github.com/beaket/ui/issues/483) inherits; IME stays delegated, not verified.
  - **Orphan re-emit on in-session delete; prefix/suffix context anchors** — accepted for 1.0 with the
    bounded consequence named (a stale `exact`/`approximate` status until the next `setHighlights`/reload;
    the decoration itself is dropped on map — empty mark decorations are removed) and the ADR-0014
    resumption trigger kept.
    The `Anchor` slots and `onHighlightStatusChange` map are additive-only, so the 1.0 interface freeze is
    not blocked.
  - **`.cm-selectionBackground` dormant** — accepted for 1.0 (browser-native selection); `drawSelection()`
    declined for IME/composing-guard risk and lightness. The dead rule is kept as the wired token path and
    annotated dormant at the call site in `theme.ts` so the decision is self-documenting and reversible.

- [#614](https://github.com/beaket/ui/pull/614) [`a32a35d`](https://github.com/beaket/ui/commit/a32a35dccf30bd26f535903828a6d582c40fe86a) Thanks [@jihnma](https://github.com/jihnma)! - refactor(paper): extract the duplicated `selectionTouches` helper into `editor/extensions/selection-utils.ts`

  Root cause: the Live-Preview reveal-on-cursor predicate `selectionTouches(state, from, to)` was
  copy-pasted verbatim into three extensions (`code-block-render.ts`, `footnote-render.ts`,
  `inline-syntax-hiding.ts`). A future correction to its boundary handling — e.g. a collapsed caret
  sitting exactly at `from`/`to` — would have to land in all three, with the risk that only one copy
  gets updated.

  Fix: a single exported `selectionTouches` now lives in `editor/extensions/selection-utils.ts`; the
  three extensions import it. The logic is byte-identical (inclusive on both ends), so behavior is
  unchanged. A `selection-utils.test.ts` pins the contract with the four boundary cases (collapsed
  caret at `from`, at `to`, strictly inside, strictly outside) plus a non-collapsed overlap.

- [#575](https://github.com/beaket/ui/pull/575) [`4dfa3a8`](https://github.com/beaket/ui/commit/4dfa3a893298d02ae70b6df47393c5dfc04ef752) Thanks [@jihnma](https://github.com/jihnma)! - perf(table-widget): prune buildTableDecorations syntax-tree descent to block containers only

  Root cause: `syntaxTree(state).iterate({ enter })` returned `undefined` (not `false`) for every
  non-`Table` node, so it descended into the inline children of every `Paragraph`, `Heading`, etc.
  on each `docChanged`. Cost scaled linearly with document size per keystroke even though tables are
  block-level structures.

  Fix: return `false` immediately for nodes that are not `Table` and not in the block-container set
  (`Document`, `Blockquote`, `BulletList`, `OrderedList`, `ListItem`). The produced `DecorationSet`
  is identical to before — GFM tables do nest inside blockquotes and list items, and the container
  set covers all paths. `FootnoteDefinition` is single-line only in this package's v1 implementation
  and can never contain a multi-line table.

- [#615](https://github.com/beaket/ui/pull/615) [`c5bfbc4`](https://github.com/beaket/ui/commit/c5bfbc4dfa3257a5eafded6a260f7ce5ffddffc9) Thanks [@jihnma](https://github.com/jihnma)! - refactor(table): extract the pure parse/serialize model into `table-model.ts`

  Root cause: `extensions/table-widget.ts` had grown to ~1,600 lines covering four distinct concerns
  (pure model, widget DOM/grid rendering, cell subview sync, keymap handlers) in one file, so a change
  to any one concern required reading the whole file for context and risked touching the others.

  This is the first, lowest-risk split: the pure model layer — `parseAligns`, `parseRowCells`,
  `parseTable`, `serializeRow`, `serializeDelimiter`, and the `TableAlign` / `CellRange` / `TableData`
  types — moves to a new `extensions/table-model.ts` (no view/DOM dependency; state-only). It already
  had its own `table-model.test.ts`, now pointed at the new module. `table-widget.ts` imports what it
  needs from there. Behavior is unchanged (move only); the full suite stays green.

  Also documents the previously-undocumented table keymap invariants (in-cell Tab/Enter/Shift-Enter/
  arrow-escape, the two-step Backspace select-then-delete, and the boundary-newline guard) in
  `packages/paper/docs/DECISIONS.md`.

## 0.8.1

### Patch Changes

- [#562](https://github.com/beaket/ui/pull/562) [`6635ae5`](https://github.com/beaket/ui/commit/6635ae5828ec3dedfee14d43594e4ea144ef5f20) Thanks [@jihnma](https://github.com/jihnma)! - Table cell sizing (overflow, uniform columns, blank-row height) + structure-affordance accessibility.

  - **Long unbreakable cell no longer blows out the editor width.** A cell holding a long token (a URL, a 200-char string) set the cell's min-content width, widening the `width:100%` table past the viewport and forcing editor-wide horizontal scroll. Cells now use `overflow-wrap: anywhere` (which, unlike the body's inherited `break-word`, shrinks min-content), so the table holds 100% and the content wraps inside the cell.
  - **Uniform columns + wide-table scroll preserved.** `overflow-wrap: anywhere` alone would collapse empty/new columns to ~1ch and cram a many-column grid into the viewport instead of scrolling. A `min-width: 5em` floor on cells restores both: a genuinely wide grid trips the scroller's default `overflow-x:auto` again, and an inserted column lands at a sensible, roughly-uniform size rather than a razor-thin sliver. (em-based, ADR-0009.)
  - **Blank rows keep a full line height.** An empty cell has no inline content, so its line box collapsed and a freshly added blank row shrank to padding-only height (~14px), looking razor-thin next to filled rows. Empty rendered cells now carry a zero-width space, restoring exactly one line box that matches a text cell across any font/theme.
  - **Grips are accessible `<button>`s.** The row/column grip that opens the structure menu was a bare `<div>` with a click listener — invisible to assistive tech. It's now a `<button type="button">` with an `aria-label` (and a `:focus-visible` reveal for when focus lands on it), so the insert/move/delete/align menu is exposed in the accessibility tree. (It sits inside the `contenteditable="false"` widget, so it is not in the sequential Tab order — a dedicated keyboard opener is a separate follow-up.)
  - **Touch / no-hover discoverability.** Every structure affordance (grips, the `+` edge buttons) was `opacity:0` until `:hover`, leaving them unreachable on touch devices. They now rest at a faint visible opacity under `@media (hover: none)`; desktop hover-reveal is unchanged.
  - **`+` Add row focuses the new cell.** The edge `+` add-row button left the caret at the document head; it now focuses the new row's first cell (matching the Tab-at-end path).
  - **Deleting the last body row removes the table.** "Delete row" on the only data row used to strand a header-only table that no row grip could remove (grips attach only to body rows); it now removes the whole table.
  - **Table selection-ring no longer does DOM work on every caret move.** The ring plugin scheduled a `setTimeout` + `querySelectorAll('.cm-table-widget')` + class toggle on every `selectionSet` — i.e. every arrow keypress, even in a table-less document. It now tracks the painted state and early-returns when nothing is (or was) block-selected (an empty selection can never match a table's block range), paying the DOM cost only when a ring actually turns on, off, or must repaint after a re-render.

## 0.8.0

### Minor Changes

- [#560](https://github.com/beaket/ui/pull/560) [`e6023ee`](https://github.com/beaket/ui/commit/e6023eecd18c633a92b3aeb2cf73c96956b17c91) Thanks [@jihnma](https://github.com/jihnma)! - Add `codeBlockRenderers` — consumer-delegated code-block rendering (ADR-0023). A registered fenced language (e.g. ` ```mermaid `) renders as a block widget off-cursor and reveals its raw source on-cursor (Live Preview); the editor ships **zero renderer bytes and zero renderer opinion** — the consumer installs the renderer (mermaid, etc.) and injects it.

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

- [#559](https://github.com/beaket/ui/pull/559) [`3aceb68`](https://github.com/beaket/ui/commit/3aceb6896bbc14326abdef3964a52a48f880ed52) Thanks [@jihnma](https://github.com/jihnma)! - Editor base theme: render only real bold/italic faces (`font-synthesis: none`) and expose `word-break` as a public `--beaket-paper-word-break` knob ([#554](https://github.com/beaket/ui/issues/554)).

  - **`font-synthesis: none`** on `.cm-content` — when a configured family lacks a real bold or italic face, the browser no longer synthesizes a faux-bold / faux-oblique. For CJK glyphs synthesis smears strokes and muddies weight; rich text here is body weight plus real Markdown bold, so the regression risk is low.
  - **`--beaket-paper-word-break`** (default `normal`, unchanged CJK per-character breaking) — a host can now opt into `keep-all` (break Korean at spaces, not mid-word, a common readability recommendation) from the outside without fighting the cascade against the internal `.cm-*` rules. It pairs with the existing `overflow-wrap: break-word`, so long unbreakable tokens still wrap.

### Patch Changes

- [#557](https://github.com/beaket/ui/pull/557) [`c140692`](https://github.com/beaket/ui/commit/c140692b67ac943b8a85452c01fbe4b534ffec41) Thanks [@jihnma](https://github.com/jihnma)! - Inline tokens (`@mention`, `[[reference]]`) now render as accent-colored underlined text instead of a bordered, filled chip — matching the treatment of links and bare URLs so every inline "go elsewhere" marker shares one visual language ([#556](https://github.com/beaket/ui/issues/556)).

  Root cause: ADR-0009's 2026-06-22 amendment unified links, bare URLs, and the `@`-mention token under one "accent text + accent underline" treatment, but only the markdown highlight style (`tags.link`/`tags.url`) was updated — the `.cm-token` theme in `token-render.ts` still painted a `--accent-sel` background + `1px solid --accent` border. The chip was a stale divergence from the documented decision; a boxed pill sitting next to an underlined link on the same line read as a second, competing affordance.

  The token rendering mechanism (atomic decoration, ADR-0017) is unchanged — only the default CSS. Consumers who want a chip can still fully restyle via the token's `className`.

## 0.7.0

### Minor Changes

- [#548](https://github.com/beaket/ui/pull/548) [`20c1667`](https://github.com/beaket/ui/commit/20c1667c467c26eda465fd1fbb8e4b37f8e18ad6) Thanks [@jihnma](https://github.com/jihnma)! - Auto-close fenced code blocks: pressing Enter at the end of an opening fence line (` ``` `, ` ```js `, `~~~`, …) inserts the matching closing fence and parks the cursor on a blank middle line, so you get a ready-to-fill block instead of an unterminated fence.

  Implemented as `codeBlockAutoClose`, a `Prec.high` Enter keymap alongside `codeBlockEnter` (disjoint cases: this owns the opening delimiter line, `codeBlockEnter` the content lines). It only fires when the cursor is at the end of an unterminated opening fence — a closed block (two `CodeMark` children in the `FencedCode` node) is left untouched, so no double-close. Honors the IME composing guard and read-only state. Leading indentation is preserved on the inserted lines.

- [#551](https://github.com/beaket/ui/pull/551) [`8471fa1`](https://github.com/beaket/ui/commit/8471fa18f68dd9510e2147de8ac2876d2ce2e7bc) Thanks [@jihnma](https://github.com/jihnma)! - Tab indentation for lists and fenced code blocks (ADR-0022).

  - **Lists**: Tab nests the item one level deeper (under its preceding sibling), Shift+Tab lifts it one level shallower — or strips the marker at top level. The whole item subtree (continuation lines + child items) shifts together, so nesting stays valid. Indent depth is driven by the parsed syntax tree (the parent's content column — 2 under `- `, 3 under `1. `), not a fixed space count, and is blockquote-aware (indents after the `> ` prefix). The first item of a list has no parent to nest under, so Tab there is a consumed no-op rather than a focus escape.
  - **Code blocks**: VSCode-style Tab/Shift+Tab — Tab inserts one indent unit of spaces (or indents every line of a multi-line selection), Shift+Tab outdents — scoped to fenced code content lines (the fence delimiter lines are left alone so Tab can't break the fence). Indentation is spaces (the default 2-space unit), not a hard tab.

  Tab is never bound globally (no `indentWithTab`): each handler yields outside its context so plain prose keeps the default focus-move (and never gets silently turned into an indented code block by stray leading spaces). Precedence: an open slash/trigger menu's Tab still wins; a list line inside a blockquote indents the list, not the quote; Tab inside a code block nested in a list/quote still reaches the code-block handler.

  v1 limits: ordered-list numbers aren't renumbered on indent/outdent, and a range selection in a list falls through. Table-cell Tab navigation and code-block auto-closing brackets are deferred to follow-ups.

- [#547](https://github.com/beaket/ui/pull/547) [`75927fb`](https://github.com/beaket/ui/commit/75927fb201c8027ceeb7bb20b6b40513757bc1d6) Thanks [@jihnma](https://github.com/jihnma)! - Wrap the selection on type (Notion/Obsidian style): with text selected, typing `(` `[` `{` `` ` `` `"` `'` or `*` now surrounds the selection with the pair and keeps the selection on the inner text, instead of replacing it. Always-on, no config.

  Because the selection stays on the inner text after a wrap, pressing the same marker twice nests it — pressing `*` twice yields bold and `` ` `` twice yields a double-backtick code span. Single `_` and `~` are deliberately excluded: a lone `_word_` won't render intra-word in CommonMark and a lone `~word~` isn't GFM strikethrough (use `*` / double-`*`, or two backticks).

### Patch Changes

- [#545](https://github.com/beaket/ui/pull/545) [`7aa885d`](https://github.com/beaket/ui/commit/7aa885d28d28d5c26c43419119078b445c3daf3d) Thanks [@jihnma](https://github.com/jihnma)! - Escape backslashes before pipes when converting pasted tables (CodeQL `js/incomplete-sanitization`).

  `escapeCell` (paste-to-markdown-table conversion) escaped `|` as `\|` but left existing backslashes untouched. A pasted cell containing `\|` collapsed to `\\|`, which a GFM parser reads as a literal backslash followed by a **live column delimiter** — defeating the pipe escaping and letting cell content inject extra table columns. Backslashes are now escaped first (`\` → `\\`), so `\|` becomes `\\\|` (escaped backslash + escaped pipe) and the cell boundary holds.

## 0.6.2

### Patch Changes

- [#544](https://github.com/beaket/ui/pull/544) [`f131c7c`](https://github.com/beaket/ui/commit/f131c7c83069d7dbafec0818df274143216772a1) Thanks [@jihnma](https://github.com/jihnma)! - fix: keep floating menus glued to their anchor on scroll, and close when the anchor scrolls out of view ([#541](https://github.com/beaket/ui/issues/541))

  The slash (`/`) menu, the `@`/`[[` trigger menus, and the table grip menu were positioned once when opened (from `coordsAtPos` / `getBoundingClientRect`) with `position: fixed` and no scroll listener — a side effect of [#471](https://github.com/beaket/ui/issues/471). Scrolling the editor left them pinned to the viewport, floating over unrelated content while their anchor moved away.

  They now re-place from the live anchor coordinates on scroll/resize (capture-phase listener so the inner `.cm-scroller` is caught), and close once the anchor scrolls out of the editor's scroll viewport. Repositioning is skipped during IME composition so the close path never fires mid-compose.

- [#542](https://github.com/beaket/ui/pull/542) [`bdc5c08`](https://github.com/beaket/ui/commit/bdc5c08febbc19deb84d629db7780b3f0e568799) Thanks [@jihnma](https://github.com/jihnma)! - Fade the in-place footnote definition so it recedes from the body flow ([#525](https://github.com/beaket/ui/issues/525)).

  An off-cursor footnote definition (`[^1]: …`) renders in place as an accent number + body, and is _also_ collected at the document end (ADR-0021). The in-place copy is what lets you locate and re-edit the definition without teleporting, but at full `--steel` it read like a small paragraph wedged between the surrounding prose — and because a definition's source position is arbitrary (authored anywhere), that made it look like it belonged to whichever paragraph it happened to sit under.

  The body span now mixes `--steel` 68% toward `--paper` (`color-mix`, theme-aware: lighter in light, dimmer in dark — no new token), so the definition visibly recedes while the accent number stays crisp as the locator/number-anchor. Font size is held at `0.8em` deliberately, **not** shrunk further: CJK glyphs lose legibility when smaller. Verified in-browser (light + dark, EN/KO/JA) — the definition reads as a faded, number-anchored footnote rather than body prose, and CJK stays legible.

  This resolves the `footnoteLayout: "inline" | "collected"` follow-up deferred in ADR-0021: the publish/"collected" _toggle_ is rejected (Paper has no render-to-output reading mode; any in-body hide reduces to the vanish bug or an orphaned marker), and the in-place render — faded — is the answer. See the ADR-0021 amendment.

## 0.6.1

### Patch Changes

- [#531](https://github.com/beaket/ui/pull/531) [`8b06648`](https://github.com/beaket/ui/commit/8b06648d8f2b35fa15ad7c6304972bd2261dbe45) Thanks [@jihnma](https://github.com/jihnma)! - Make a table deletable from its grip menu.

  The row/column grip menus offered only "Delete row" / "Delete column", and both silently no-op'd
  on the last remaining row or column (`rows.length <= 1` / `cols <= 1`) — so a small table could not
  be removed from the menu at all (reported as "can't delete the table"). Keyboard deletion already
  worked (block-select via Escape or a second Backspace, then Backspace), but the menu — the
  discoverable path — had no way out.

  Add a "Delete table" item to both grip menus, and make "Delete row" / "Delete column" on the last
  row/column delete the whole table rather than no-op. Deletion removes the table's own lines and
  leaves the surrounding blank lines, matching the block-select Backspace path. Covered by
  `table-delete.test.ts`.

- [#530](https://github.com/beaket/ui/pull/530) [`4fe8843`](https://github.com/beaket/ui/commit/4fe8843b12981523415cc8b868da33a9d2c2011c) Thanks [@jihnma](https://github.com/jihnma)! - Fix vertical cursor navigation landing on blank separator lines below a table ([#520](https://github.com/beaket/ui/issues/520)).

  The table widget's `<table>` had no margin reset, so a host/global `table { margin }` rule (common in markdown CSS — the docs site ships `table { margin: 1rem 0 }`) applied to it. The widget wrap is `position: relative` with `padding: 0`, so that margin collapses out above/below the block widget. CodeMirror measures only the wrap's box for its height map, so the escaped margin desynced the height map from the actual DOM for everything below the table. `posAtCoords` (which arrow-key vertical motion uses) then mapped a screen y to the line one below the visually-correct one, so ↑/↓ around the table skipped onto blank lines.

  Resetting `.cm-table-widget table { margin: 0 }` keeps the widget's DOM footprint equal to what the height map measures (block rhythm already comes from the blank lines, per the existing `padding: 0` design). The selector outspecifies a bare `table` rule, so it holds without `!important`. Verified in-browser (geometry is jsdom-carved-out per ADR-0005): ↑/↓ across the table, the exact issue repro (cell → ↓↓ → paragraph), non-zero goal columns, and content above the table all land on the expected lines.

## 0.6.0

### Minor Changes

- [#526](https://github.com/beaket/ui/pull/526) [`7ee8c2e`](https://github.com/beaket/ui/commit/7ee8c2eda936c3b72fc2bee5da3836e3d45f48fa) Thanks [@jihnma](https://github.com/jihnma)! - Add GitHub-style footnotes (ADR-0021). Type a `[^label]` reference in a sentence and a `[^label]: text` definition anywhere — off the cursor they "become footnotes," all derived from the markdown source (no second model; round-trips for free).

  - **Parser.** GFM in `@lezer/markdown` ships no footnote node, so a custom `MarkdownConfig` adds real `FootnoteReference` (inline) and `FootnoteDefinition` (block) nodes — driving marker hiding, definition detection, and round-trip without fragile regex. A definition may interrupt a paragraph with no blank line above it (`endLeaf`), and a `[^x]` inside inline code stays literal.
  - **Reference → superscript, reveal-on-cursor.** `[^1]` renders as a superscript ordinal off-cursor and reveals its raw form on-cursor (the Live-Preview contract, not an atomic token). Numbering follows GitHub: by **first-reference order**, computed over the whole document; an undefined `[^x]` stays literal and an unreferenced definition is excluded from the numbering.
  - **Definition rendered in place + collected at the end.** Off-cursor, a referenced definition renders as a real footnote (number + body) where it is authored — locatable and clickable, not hidden — and on-cursor reveals raw for editing. Every referenced definition is also gathered into a section after the last line (the package's first StateField-provided block decoration; IME-safe via the widget's `eq()` and `docChanged`-only recompute). Both renderings share markup so they stay consistent.
  - **Re-edit model.** Editing always happens at the source: cursor-on-line reveals raw like any other block, and clicking a collected item moves the cursor to its source definition. The cursor moves; content never teleports.

  Always-on (like tables) — no `EditorOptions` change. Known v1 cuts: footnote bodies are plain text (inline markdown inside a footnote not yet rendered), single-line definitions only, and numbering rescans the whole document per edit. A publish-oriented `footnoteLayout: "inline" | "collected"` toggle (collected = clean body, definitions only at the bottom) is a planned follow-up.

- [#522](https://github.com/beaket/ui/pull/522) [`5163cbe`](https://github.com/beaket/ui/commit/5163cbe675388108f4b4edeef74f964900c78a1a) Thanks [@jihnma](https://github.com/jihnma)! - Align the Live-Preview markdown typescale to beaket's finalised "paper-md" body grill (ADR-0009 amendment, 2026-06-22), and default the writing surface to white.

  - **White canvas default + self-painted surface.** `--canvas` now defaults to `#ffffff` (was the near-white `#fbfcfd`), and the editor paints its own writing-surface background instead of being transparent over the host. The surface tint is now a consumer choice: override with `--beaket-paper-canvas` (e.g. `#fffefc` for a barely-warm paper). Dark canvas unchanged.
  - **Body size + heading ramp re-pointed to the grill.** Body `--font-size` 17px → 16.5px; headings h1/h2/h3 → 1.58 / 1.27 / 1.09em at weight 600 (was 700/650). The load-bearing CJK decisions are preserved — `--line-height: 1.75` and the Japanese-before-Korean font stack are untouched (the grill's 1.7 leading and Latin-first stack were not ported).
  - **Link treatment.** A link renders as accent text + accent underline (`text-underline-offset: 2px`), matching the text color to the underline so `[text](url)` links, bare URLs, and `@`-mention tokens all share one consistent link style.
  - **Blockquote rule → accent (blue), 3px.** The blockquote left rule moves from grey (`--chrome`) to the accent (`--accent`) and from 2px to 3px; quote text stays muted, non-italic (CJK-safe). Empty `>` separator lines inside a quote now render as a tight ~0.5em strip (instead of a full line-height row) when the cursor is elsewhere, so the in-quote rhythm (paragraph ↔ list ↔ nested quote) matches collapsed-HTML quotes; the line returns to full height while the cursor is on it for editing. A list inside a blockquote now keeps the quote's bar gutter in its hanging-indent padding (`calc(gutter + Nch)`), so its bullets no longer collide with the bar.
  - **h2/h3 bottom spacing.** Headings now carry a real `padding-bottom` (h2 0.45em, h3 0.28em) so the gap to the following block stays beaket-like even with no blank line after the heading (the common single-Enter editing case), instead of collapsing to ~8px.
  - **Image captions.** A titled image `![alt](url "caption")` now renders as a `<figure>` with a `<figcaption>` (12.5px, muted, left-aligned); a bare `![alt](url)` stays a plain image. `alt` remains the accessibility text in both cases. (Previously `title` only set the `<img title>` tooltip.) Both wrappers are `inline-block` so a captioned and a bare image get identical vertical spacing in their line (a block figure would pull in CM6's line-height-tall widgetBuffer anchors and sit ~25px further from the surrounding text).

  Not changed: the prose measure stays full-width by default (`--measure: none`) — opt into a reading column with `--beaket-paper-measure` (the editor has no breakout, so a hard cap would clip tables/code) — and the task-checkbox keeps the brutalist ink fill.

### Patch Changes

- [#527](https://github.com/beaket/ui/pull/527) [`8f5aacf`](https://github.com/beaket/ui/commit/8f5aacfa317115678d525b473e9c7d1b54d16767) Thanks [@jihnma](https://github.com/jihnma)! - Add a `source` export condition so monorepo consumers can resolve the package to its TypeScript source during local dev.

  `exports[".".|"./react"].source` now points at `src/index.ts` / `src/react/index.ts`, ordered before `types`/`import`. Default resolvers (npm, Node, a normal Vite/webpack install) never request `source`, so installs are unchanged — they keep resolving `import → dist`, and the published tarball still ships `dist` only. A dev server that opts into the condition (`resolve.conditions: ["source"]`) instead compiles the package from source via the workspace symlink, enabling Fast Refresh on `@beaket/paper` edits with no rebuild.

  No runtime or API change for consumers.

## 0.5.0

### Minor Changes

- [#512](https://github.com/beaket/ui/pull/512) [`fc3a4af`](https://github.com/beaket/ui/commit/fc3a4af5cee35b447ace3823624becf11d613674) Thanks [@jihnma](https://github.com/jihnma)! - Async and grouped slash menu items — child ④ of the embedding/extensibility epic ([#500](https://github.com/beaket/ui/issues/500), ADR-0012 amendment). Two backward-compatible extensions to the existing `slashItems` declarative spec:

  - **Async catalog:** the transformer may now return a `Promise` (`(defaults) => SlashItemSpec[] | Promise<SlashItemSpec[]>`). The catalog is resolved **once** on first open and cached, then filtered synchronously per keystroke — preserving the slash menu's "filter a static list locally" identity. A non-interactive **"Loading…"** row shows while pending; a catalog that resolves empty, or a query that filters to zero, closes the menu (unchanged). Per-query async is deliberately left to the `triggers` API (ADR-0016), not duplicated here.
  - **Group section headers:** `SlashItemSpec` gains an optional `group?: string`. A header is rendered at each group boundary — the consumer clusters by ordering items (consistent with "array order = display order"; no `priority`). Headers are woven in after filtering, so a group whose items all filter out shows no empty header, and the selection always lands on a selectable row. The default menu, and any consumer that omits `group`, stays divider-free.

  Internally: `resolveSlashItems` stays synchronous (its contract tests unchanged); a thin `resolveSlashConfig` branches on promise-ness and the `SlashMenu` plugin holds the resolved catalog as instance state, re-evaluating through the IME-guarded path on async settle (no DOM rebuild mid-composition, invariant [#1](https://github.com/beaket/ui/issues/1)). The shared menu engine gained one non-interactive-row type that serves both group headers and the Loading row (keyboard nav skips it, selection indexes selectable rows only); the trigger menu, which emits no headers, is byte-identical. New pure contract-test seam `buildMenuRows(items, query)` (filter + header insertion) alongside the unchanged `resolveSlashItems`; async resolution and loading-row geometry are browser-verified in the `sites/paper` playground.

- [#510](https://github.com/beaket/ui/pull/510) [`de5d2d1`](https://github.com/beaket/ui/commit/de5d2d110adcd6512bf94e69fb199abba36ea806) Thanks [@jihnma](https://github.com/jihnma)! - Add an atomic token rendering API for inserted mentions/references — child ③ of the embedding/extensibility epic ([#499](https://github.com/beaket/ui/issues/499), ADR-0017), the pair of the trigger API ([#498](https://github.com/beaket/ui/issues/498)). `EditorOptions.tokens?: TokenSpec[]` (and the `<Paper tokens>` prop) renders markdown matching a `pattern` — e.g. an inserted `[@Grace Hopper](user:u_003)` — as an **atomic token**: the caret steps over it, one Backspace at its trailing edge deletes the whole thing, and the consumer controls its label/styling.

  Declarative and CM6/DOM-free, in the `slashItems`/`triggers` family (ADR-0012/0016): `render(match) => { label, className? }`. The markdown stays the single source of truth — the token is a replace-widget layered over it, so copy/serialize round-trips to plain markdown with no second document model, and the token's identity is recovered from the pattern's own capture groups (no separate `data` channel). The token is **permanently atomic** (no reveal-on-cursor, like the table widget — unlike inline Live-Preview syntax hiding); a richer return (`onClick`, raw DOM) is deferred as a non-breaking future minor.

  Internally: decorations ride a new opt-in `{ atomic: true }` flag on `guardedDecorations` that also exposes the same IME-guarded set as `EditorView.atomicRanges` (additive — existing callers unchanged). Arrow step-over is free from `atomicRanges`; delete-whole is not (its default is skip, not delete — the table's lesson), so it is two explicit `Prec.high` commands: **Backspace** at a token's trailing edge and **Delete** at its leading edge (where a click on the chip lands the caret). Matches inside code (fenced or inline) are skipped via the syntax tree (a 1.0 correctness rule), with a fresh regex per line and left-to-right overlap resolution. `findTokenMatches`/`tokenAtEdge` are pure jsdom contract tests (ADR-0005); the live atomic cursor/delete feel and widget placement are browser-verified in the `sites/paper` playground (type `@gr` → select → renders as a chip → Backspace at the edge or click-then-Delete removes it whole; no decoration-overlap exception with inline-syntax-hiding).

- [#508](https://github.com/beaket/ui/pull/508) [`8698181`](https://github.com/beaket/ui/commit/869818124dc3972c1c5bc8d9ade8300f1fc0cee4) Thanks [@jihnma](https://github.com/jihnma)! - Add a declarative `@` / `[[` trigger API for custom autocomplete (mentions, wikilinks) — child ② of the embedding/extensibility epic ([#498](https://github.com/beaket/ui/issues/498), ADR-0016). `EditorOptions.triggers?: TriggerSpec[]` (and the `<Paper triggers>` prop) lets a consumer register extra triggers beyond the built-in slash menu, each `{ trigger, minQueryLength?, onQuery, onSelect? }` backed by its own — possibly **asynchronous** — suggestion source. It stays in the declarative `slashItems`/`onInsertImage` consumer-config family (ADR-0012): a selected item inserts a **markdown string** (single source of truth), no `EditorView` is ever exposed, and the opaque `data` passthrough on items is handed back to `onSelect` so an `@mention` can recover the picked entity's id. Rendering an inserted token as an atomic chip remains the separate concern of [#499](https://github.com/beaket/ui/issues/499).

  Internally this generalizes the slash menu rather than duplicating it: the shared menu DOM / keyboard nav / porcelain overlay / IME-deferral are extracted into a new `menu-engine.ts` (`PopupMenu`), and both the slash menu and the trigger menu are thin controllers over it. The slash menu's public surface and `slash-command.test.ts` are unchanged. The two menus coexist — only one is ever open (distinct triggers; the shared keymap routes to whichever is open). The async source path discards stale responses (a slow earlier `onQuery` never overwrites a faster later one) and never acts on a result that resolves mid-IME-composition; the matching (`matchTrigger`) and stale-response decision (`isResponseCurrent`) are pure, jsdom contract-tested (ADR-0005), with menu position/open/apply browser-verified.

- [#514](https://github.com/beaket/ui/pull/514) [`7b72c65`](https://github.com/beaket/ui/commit/7b72c659d4db07558ab22c4d8e32d6d5c88c2282) Thanks [@jihnma](https://github.com/jihnma)! - Add three table-stakes embedding options to `EditorOptions` (and the `<Paper>` props) — child ⑤ of the embedding/extensibility epic ([#501](https://github.com/beaket/ui/issues/501), ADR-0018). They replace the CSS hacks and the unsafe `getView()` reconfigure consumers reached for before.

  - `placeholder?: string` — a hint shown on an empty document (CodeMirror's `placeholder`), hidden once there is text. Fixed at creation.
  - `readOnly?: boolean` — a view mode that flips **live** via `setReadOnly(view, …)` (React: the `readOnly` prop), no recreation. It sets **both** `EditorState.readOnly` and `EditorView.editable`, with an explicit, coherent behavior matrix: typing/IME, image drop & paste ingest, paste-to-table, table auto-convert, and **table cell editing** are all inert, while native selection and the markdown/code copy buttons keep working. Because `EditorState.readOnly` does not block a raw `view.dispatch` (CM6 design), each doc-mutating entry point guards on `view.state.readOnly` itself — most importantly the table cell subview, which is a separate `EditorView` the parent's `editable` does not reach (guarded at the mousedown entry and in `mount()`).
  - `height?: string` / `minHeight?: string` — explicit sizing instead of CSS-by-accident. `height` is a fixed height that scrolls internally past it; `minHeight` is a grow-with-content floor sized on the **editable surface** (`.cm-content`) so clicking anywhere in the reserved height places a cursor — fixing the dead-zone repro where a short/empty document left a non-focusable gap below the content ([#501](https://github.com/beaket/ui/issues/501)). The `minHeight` rule is scoped to the top-level editable (a direct child combinator) so the nested table-cell subview is never ballooned. Both fixed at creation.

  `sizeRules` and the readOnly/placeholder wiring are jsdom contract tests (the editable/readOnly facets, the live `setReadOnly` flip, placeholder rendering, and the table cell-edit guard); the rendered grow-vs-scroll geometry and click-anywhere-focuses are browser-verified in the `sites/paper` playground (invariant [#4](https://github.com/beaket/ui/issues/4)), which now uses the `minHeight` option in place of its former hand-rolled `.cm-content` CSS.

### Patch Changes

- [#516](https://github.com/beaket/ui/pull/516) [`1fedefc`](https://github.com/beaket/ui/commit/1fedefcb358e1117b211b34ae73f6e78b717e86a) Thanks [@jihnma](https://github.com/jihnma)! - Fix ([#474](https://github.com/beaket/ui/issues/474)): clicking in the empty space below a table that is the **literal last block** no longer parks the caret before the table.

  **Root cause.** The user-visible symptom in the docs demo was a dead zone (the demo card was taller than the editor), already fixed docs-side in [#475](https://github.com/beaket/ui/issues/475) by letting the editor content fill its card. The hypothesized editor-internal `posAtCoords` bug does not exist — for a table followed by a trailing blank line (the state `tableBoundaryGuard` always enforces during editing) a below-content click resolves to that trailing line and renders correctly after the table.

  The one remaining case is an **initial `doc` passed straight in that ends with a table and no trailing line**: the table's block-widget replace range ends exactly at doc end, and CM6 renders a caret at that end-boundary _before_ the widget (there is no following text line for it to attach to). State position is correct (doc end), only the rendered caret is wrong.

  **Fix.** The body `mousedown` handler now detects this case (`docEndsWithBareTable`) and, when the click lands below the last block, heals the doc with a trailing line and places the caret there — mirroring `escapeTable("below")`'s keyboard behavior. Read-only never mutates. The geometry gate ("below the last block") is browser-verified per invariant [#4](https://github.com/beaket/ui/issues/4); `docEndsWithBareTable` and the doc-mutation path are covered by jsdom regression tests.

- [#518](https://github.com/beaket/ui/pull/518) [`1c3b94e`](https://github.com/beaket/ui/commit/1c3b94ee4f883543ff81d45c20c014e6ad7daa16) Thanks [@jihnma](https://github.com/jihnma)! - Fix ([#472](https://github.com/beaket/ui/issues/472)): a forced `colorScheme` ("light"/"dark") now overrides a consumer's porcelain `--color-*` bridge, so overlays (slash menu, "Copied" toast, table row/col insert handles) follow the forced scheme instead of leaking the OS scheme.

  **Root cause.** Surface tokens resolve through the 3-tier bridge `var(--beaket-paper-X, var(--color-Y, default))`. Forcing only swapped the tier-3 built-in _default_ — it never beat a consumer-provided tier-2 `--color-*`. So when a consumer bridges `--color-paper`/`--color-frost`/… to a palette that tracks the OS, a forced-light editor under a dark OS still painted those surfaces dark (and CSS custom-property resolution makes it sticky: `--color-paper: var(--paper)` declared at `:root` is computed once against the OS scheme, and that value inherits down). Only `--color-ink`, which was already pinned per scheme, didn't leak.

  **Fix.** When a scheme is forced, pin the full set of bridged surface `--color-*` (and `--shadow-offset`) per scheme on `.cm-editor` — the same mechanism `--color-ink` already used, so the editor's own declaration beats the inherited bridge and reaches every overlay (they are `.cm-editor` descendants). `colorScheme="light"` now wears its own scope class (`cm-beaket-paper-light`) carrying the light pins; `"dark"` adds dark pins to its existing block; `"system"` stays unpinned so it keeps deferring to the bridge. The tier-1 `--beaket-paper-*` override still wins inside a forced scheme. Pins are derived off the var() chains in `theme.ts` (single source of truth), forced-block-only — never merged into the token maps. See ADR-0020. The docs playground's consumer-side `--color-*` re-bridge workaround was removed (the package fix makes forcing authoritative on its own). jsdom tests lock the derived pins + placement; the rendered colors are browser-verified (ADR-0005 carve-out).

- [#517](https://github.com/beaket/ui/pull/517) [`0c45645`](https://github.com/beaket/ui/commit/0c456454af8f598bd4dc0aba9f011235dd9bb041) Thanks [@jihnma](https://github.com/jihnma)! - Fix ([#471](https://github.com/beaket/ui/issues/471)): the table grip context menu (column/row: insert, move, delete) is no longer clipped near the editor's scroll viewport edge.

  **Root cause.** `openMenu()` appended the menu to the table widget wrapper (`this.wrap`) — which lives inside `.cm-content` → `.cm-scroller` — and positioned it `absolute` relative to that wrapper. `.cm-scroller` is `overflow: auto`, so any descendant menu extending past the scroller box was clipped (worse when the editor was tall or scrolled).

  **Fix.** Mirror the slash menu: the menu now attaches to `view.dom` (`.cm-editor`, `overflow: visible`) with `position: fixed`, positioned from the anchor grip's `getBoundingClientRect()` (viewport coords). This takes it out of the scroller's overflow context so it can never be clipped. The outside-click close and IME guard are unchanged. The clip geometry is browser-verified per invariant [#4](https://github.com/beaket/ui/issues/4); a jsdom regression test locks the structural fact that the open menu attaches under `.cm-editor` and outside `.cm-scroller`.

## 0.4.1

### Patch Changes

- [#491](https://github.com/beaket/ui/pull/491) [`7e724ff`](https://github.com/beaket/ui/commit/7e724ffe6f285ab8c8e22bfd529052e89e8d6136) Thanks [@jihnma](https://github.com/jihnma)! - Fix the task-list checkbox checkmark becoming invisible under a forced `colorScheme`. The checked checkmark image was selected with a bare `@media (prefers-color-scheme: dark)` rule, but forced light/dark schemes are driven by editor scope classes (`.cm-beaket-paper-dark` / `.cm-beaket-paper`), and the OS media query doesn't match a forced scheme. So a checkbox forced opposite the OS (e.g. `colorScheme="dark"` on a light OS) painted a same-color checkmark on its `--ink` fill — invisible. Root cause: it was the only styling rule keyed on `prefers-color-scheme` instead of the scope class. The checkmark image is now the internal `--cm-check-mark` editor token (light default in `tokens`, dark value in `darkTokens`), so it rides the same scoped dark stylesheet as every other dark token and follows the active scheme in both `system` and forced modes.

- [#495](https://github.com/beaket/ui/pull/495) [`b6ba398`](https://github.com/beaket/ui/commit/b6ba398c922cd84c3669e1187881148e9fa5858a) Thanks [@jihnma](https://github.com/jihnma)! - `tableBoundaryGuard` walked the full syntax tree on every `docChanged` transaction, including pure insertions (normal typing, `fromA === toA`), which can never delete a boundary newline and can never be blocked. Root cause: the guard's `syntaxTree().iterate()` ran unconditionally before the check that actually uses it. Fix: scan `tr.changes` once up-front; if no change has `toA > fromA` (no deletion or replacement), return the transaction immediately without walking the tree — eliminating the tree walk on the common keystroke path.

- [#506](https://github.com/beaket/ui/pull/506) [`3299dda`](https://github.com/beaket/ui/commit/3299ddac3e86680487f7307945d612e63169f96f) Thanks [@jihnma](https://github.com/jihnma)! - Clarify in the README that `getView()` is the deliberate raw escape hatch with no cross-version guarantee, and that there is intentionally no blessed `extensions` injection slot. This records the consumer-facing outcome of the extensibility decision ([#497](https://github.com/beaket/ui/issues/497), ADR-0015): a raw `Extension[]`/`keymap` slot on `EditorOptions` is declined because it would leak CodeMirror into the 1.0-frozen public surface and let a consumer break the core invariants (the composing guard, the permanently-hidden table structure). Concrete extensibility needs route to the declarative APIs instead; raw access stays on the unsafe `getView()` handle.

## 0.4.0

### Minor Changes

- [#469](https://github.com/beaket/ui/pull/469) [`3a9ff1c`](https://github.com/beaket/ui/commit/3a9ff1cc2e0e808eb9c122cf91203dabb92b3813) Thanks [@jihnma](https://github.com/jihnma)! - Add a `colorScheme` prop (`"light" | "dark" | "system"`). Previously the editor only followed the OS `prefers-color-scheme`; now a consumer with its own theme toggle can force light or dark. It's a live prop — flipped via a CodeMirror compartment, so switching never recreates the editor or drops the document. The vanilla core exposes the same `colorScheme` option plus a `setColorScheme(view, scheme)` helper. `"system"` remains the default, so existing usage is unchanged.

### Patch Changes

- [#467](https://github.com/beaket/ui/pull/467) [`3a5a652`](https://github.com/beaket/ui/commit/3a5a652fb9c291e2f88f27649e7149bdca120068) Thanks [@jihnma](https://github.com/jihnma)! - Refresh the npm README: a frontend-focused quick start (install → import → go), standalone-first framing, and links out to the docs site for the full styling and API reference instead of duplicating them inline.

## 0.3.0

### Minor Changes

- [#455](https://github.com/beaket/ui/pull/455) [`3574af2`](https://github.com/beaket/ui/commit/3574af2b1e0fef6225e6870ffdae43dafe5838b1) Thanks [@jihnma](https://github.com/jihnma)! - Rename the React component from `BeaketPaper` to `Paper` (and its types `BeaketPaperHandle` → `PaperHandle`, `BeaketPaperProps` → `PaperProps`). The package scope (`@beaket/paper`) already namespaces the export, so the prefix was redundant.

  **Breaking:** update imports from `@beaket/paper/react`:

  ```diff
  -import { BeaketPaper, type BeaketPaperHandle } from "@beaket/paper/react";
  +import { Paper, type PaperHandle } from "@beaket/paper/react";
  ```

  If `Paper` collides with another import in your code, alias it: `import { Paper as BeaketPaper } from "@beaket/paper/react"`.

## 0.2.0

### Minor Changes

- [#453](https://github.com/beaket/ui/pull/453) [`56c3b0d`](https://github.com/beaket/ui/commit/56c3b0dac33b2c66ee0db11038676a58d35c3e08) Thanks [@jihnma](https://github.com/jihnma)! - Add dark mode to `@beaket/paper`. The editor now follows the OS `prefers-color-scheme` automatically.

  - Previously, dark mode only flipped the porcelain-bridged tokens, but the editor pinned `--color-ink` and its editor-owned tokens (canvas, surface, code-syntax ramp, overlay shadow) to light values — so body text rendered dark on a dark surface and was unreadable.
  - Every token now carries a dark-aware default while keeping its `var()` chain intact, so `--beaket-paper-*` overrides and the porcelain `--color-*` bridge still win in both modes. Dark defaults mirror porcelain's dark block, with a GitHub Dark Default code-syntax ramp.
  - The dark tokens ship as a scoped stylesheet (CodeMirror's theme builder can't emit `@media` for the root selector); the task-list checkbox also gets a dark checkmark so it stays visible on the light checked fill.

## 0.1.0

### Minor Changes

- [#445](https://github.com/beaket/ui/pull/445) [`9950d96`](https://github.com/beaket/ui/commit/9950d969e1fd3654bc2f9937d155b8c931aeecf7) Thanks [@jihnma](https://github.com/jihnma)! - Add `@beaket/paper`: a markdown-first, CJK-first Live Preview editor, published as a standalone npm package (not a copy-paste registry component).

  - Framework-agnostic core (`@beaket/paper`, `createEditor`) with zero React, plus a thin React wrapper (`@beaket/paper/react`, `<BeaketPaper>`).
  - Uncontrolled by design (`defaultValue` + `ref.setValue()`); `onChange` emits full markdown on user edits only, guarded against IME composition.
  - CodeMirror 6 engine with a permanently-hidden table widget, IME composing guard, Live Preview syntax hide/show, slash menu, image ingestion hooks, and source-anchored selection annotations.
  - Porcelain design tokens reconciled against `@beaket/ui`'s `porcelain.css`: inherits `--color-*` when present, self-sufficient via fallbacks standalone.
