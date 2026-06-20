# 0008 — Line breaks inside a table cell are a hidden `<br>` — rendered as a real line break even while editing, and treated as an atomic cursor unit

- **Status:** Accepted
- **Date:** 2026-06-14
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Line breaks inside a table cell are a hidden `<br>` — rendered as a real line break even while editing, and treated as an atomic cursor unit

## Context

Pressing Shift+Enter inside a table cell inserts the GFM-standard `<br>` into the source. Because of the "the cell being edited shows its source" rule (ADR-0003), that `<br>` was **exposed literally as text** during editing. User feedback: "I made a line break, but seeing `<br>` is a poor UX."

The underlying question: is `<br>` **inline content syntax** that should be shown as source while a cell is being edited (like `**bold**`), or is it a **structural artifact** that should stay hidden?

A survey of comparable Live Preview editors found the same behavior: the always-rendered-table model also relies on `<br>` for in-cell line breaks, and it carries a known UX weakness — i.e. the industry-standard behavior is itself the shortcoming.

## Decision

We **treat `<br>` as a structural artifact and hide it** — it is merely a workaround notation that GFM requires because a table row cannot contain a real newline (`\n`), not content the user "typed as characters." We **extend the philosophy of ADR-0002 (permanent hiding of table structure syntax) down to in-cell line breaks.**

- **Source representation**: keep the GFM-standard `<br>` (parser/cross-editor compatibility; the principle that the source of truth is the markdown text is unchanged).
- **Render**: even in the cell being edited, `<br>` is not exposed as characters — it is rendered as a **real line break** (an atomic replace `decoration`, `BrWidget`, in the editing subview). Non-editing cells continue to render the line break via `cellInlineRenderer` as before.
- **Cursor**: `<br>` is bundled with `EditorView.atomicRanges` so it is treated **atomically** — arrow keys step over it as a single unit, and a single Backspace deletes it whole (merging the lines). To the user it feels like an ordinary newline.
- **Unified input**: not only Shift+Enter — **newlines that arrive via paste or input are also converted to `<br>`** (the `cellNewlineToBr` `transactionFilter`; previously a newline transaction was rejected). Every newline inside a cell = `<br>` = a visible line break, unified into one path.

Real inline syntax such as `**bold**` continues to show as source while editing — that is content the user edits as text, whereas `<br>` is a line-break notation with no "text to be edited" meaning. This boundary is an explicit exception-extension of ADR-0003 ("the only thing hidden is the table's skeletal syntax"), so we record it deliberately.

## CJK first-class / the guard

The `BrWidget` `decoration` is created through `guardedDecorations` (ADR-0004: during composition, defer + map + re-evaluate). Since it is a decoration inside the subview rather than a mirror, it follows the same contract that forbids rebuilding widget DOM during IME composition (`view.composing`).

## Alternatives and why they were rejected

- **Keep the status quo (`<br>` exposed as characters)**: the cause of the user complaint. Rejected.
- **Pin a cell to a single line (remove line breaks)**: the simplest, but loses multi-line cells. Tables genuinely need line breaks in note/description cells, so rejected.
- **Replace `<br>` with a ↵ chip**: makes "there is a line break here" visible, but is less clean than a real render. Rejected.

## Related decisions (same task — the table-UX batch)

The same session also implemented edge-arrow escape from the table, a block-selection outline ring for the table, and blocking of table↔paragraph boundary absorption (empty-line isolation). These are easily reversible UX policies, so they were not promoted to ADRs and were recorded in the table-UX plan document for that work rather than here.
