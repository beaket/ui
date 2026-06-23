# 0021 — Footnotes: in-place definition render + a collected section

- **Status:** Accepted
- **Date:** 2026-06-23
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Footnotes: GitHub-style markers, definitions rendered in place _and_ collected at the end

## Context

GitHub-flavored footnotes are two constructs: an inline **reference** `[^label]` that lives in a
sentence, and a block **definition** `[^label]: text` authored anywhere. The ask: type them anywhere
and have them "magically become footnotes," with a re-editing model thought through deliberately.

Two facts shaped the design:

1. **GFM in `@lezer/markdown` ships no footnote node.** The dialect is CommonMark + GFM (Table,
   TaskList, Strikethrough, Autolink) — `[^1]` / `[^1]: …` are not parser-recognized. So footnotes need
   either a custom parser extension or syntax-independent regex detection.
2. **The editor's one model is "markdown is the only source of truth; the view is derived by
   decorations" (ADR-0001), and Live Preview reveals raw only on the cursor's line.** A reference is a
   natural fit. A definition is the hard part: "collected at the bottom" means rendering content away
   from its source position, which fights render-in-place.

The re-editing model was the genuinely hard question (an earlier, never-committed footnote epic cycled
here). Two approaches were tried in the browser and **rejected**:

- **Collapse the off-cursor definition to an invisible hairline** (content shown only in the collected
  section). This produced a real editing bug: editing a definition then pressing Enter moved the cursor
  off the line, so the definition _vanished_ — and because it was zero-height and invisible, it could
  not be relocated or clicked to bring back. Confirmed in the playground with a body-interleaved
  definition.
- **A dual-mode `inline | collected` layout toggle, built up front.** Deferred — it front-loaded
  complexity (and was the rock the prior epic split on). In-place rendering turned out to be the simple,
  no-teleport base, which makes the toggle cheap to add _later_ rather than a prerequisite.

## Decision

**Parse footnotes as real nodes; render the reference inline (Live Preview) and the definition _in
place_; also collect every definition into a section at the document's end. Everything derives from the
markdown source — no second model, round-trips for free.**

Concretely:

- **Parser (`footnotes-syntax.ts`).** A custom `@lezer/markdown` `MarkdownConfig` adds
  `FootnoteReference` (inline, installed `before: "Link"`) and `FootnoteDefinition` (block, installed
  `before: "LinkReference"` so it isn't mis-claimed as a link-reference definition). `endLeaf` lets a
  definition interrupt a running paragraph, so it works with no blank line above ("write anywhere"). Real
  nodes — not regex — drive marker hiding, definition detection, and a clean round-trip; matches inside
  inline code are never treated as footnotes (the InlineCode parser claims them first).
- **Numbering = GitHub's: by first-_reference_ order**, computed over the whole document (stable, not
  viewport-dependent). A reference with no matching definition stays literal `[^x]`; an unreferenced
  definition is parsed but excluded from the numbering. `computeFootnotes(state)` is the one pure model,
  shared by both renderers (the jsdom contract-test seam, ADR-0005).
- **Reference rendering (`footnote-render.ts`, ViewPlugin via `guardedDecorations`).** Off-cursor, a
  `[^label]` reference becomes a superscript ordinal; on-cursor it reveals raw — the same
  reveal-on-cursor contract as inline-syntax-hiding, **not** the permanently-atomic token path.
- **Definition rendering = in place, locatable.** Off-cursor, a referenced definition line renders as a
  real footnote (its number + body) where it is authored — **not** collapsed to nothing. On-cursor it
  reveals raw for editing. This is what fixes the vanish/relocate bug: the definition's position is
  always visible and clickable.
- **Collected section (`footnote-section.ts`, a StateField).** Every referenced definition is also
  gathered into a list rendered after the last line. This is a **block** decoration, which CM6 requires
  from a StateField, not a ViewPlugin ("Block decorations may not be specified via plugins") — the
  package's first block decoration. IME safety without the composing-guard plugin (a StateField can't use
  it): the field recomputes only on `docChanged` (its content never depends on the cursor) and the
  widget's `eq()` compares the full model, so composing CJK into a paragraph leaves the definition set
  unchanged → `eq` true → CM6 keeps the DOM, no rebuild near the composition target. The collected items
  reuse the in-place definition's markup/classes so the two are consistent by construction.
- **Re-edit model.** You never edit at the bottom — it is a derived preview. Editing happens at the
  source: cursor-on-line reveals raw (like every other block), and **clicking a collected item moves the
  cursor to its source definition** (revealing it raw). The cursor moves; content never teleports.
- **Default presentation shows both** the in-place render and the collected section. The redundancy is
  accepted for now; a publish-oriented `footnoteLayout: "inline" | "collected"` (collected = clean body,
  definitions only at the bottom) is **deferred** to a follow-up, modeled on the existing
  `colorScheme`/`readOnly` compartment+setter shape. Collected mode's mouse re-edit path is the
  click-to-source jump, already built.

## Consequences

- Footnotes are always-on (like tables) — zero consumer config; nothing added to the 1.0-frozen
  `EditorOptions` surface. The follow-up toggle is an additive `0.x` minor when it lands.
- The package gains its **first StateField-provided block decoration**; future block-level rendering has
  a precedent (and its IME story) to follow.
- **v1 cuts (deliberate, revisit on demand):**
  - Footnote bodies render as **plain text** — inline markdown inside a footnote is not rendered.
  - **Single-line definitions only** — no indented continuation lines.
  - `computeFootnotes` scans the **whole document** per `docChanged` (numbering is global). Fine for
    normal documents; a very large document is a perf follow-up.
  - The StateField's IME deferral rests on `eq()` only; a **physical-key CJK IME** spot-check of the
    block-section path is deferred (consistent with the existing deferred IME spot-checks).
- Coordinate/DOM behavior (superscript placement, the in-place and collected renders, reveal-on-cursor,
  click-to-source) is carved out for browser verification (invariant #4) — done in the playground; the
  parser and `computeFootnotes` model are covered by jsdom contract tests.
