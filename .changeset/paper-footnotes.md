---
"@beaket/paper": minor
---

Add GitHub-style footnotes (ADR-0021). Type a `[^label]` reference in a sentence and a `[^label]: text` definition anywhere — off the cursor they "become footnotes," all derived from the markdown source (no second model; round-trips for free).

- **Parser.** GFM in `@lezer/markdown` ships no footnote node, so a custom `MarkdownConfig` adds real `FootnoteReference` (inline) and `FootnoteDefinition` (block) nodes — driving marker hiding, definition detection, and round-trip without fragile regex. A definition may interrupt a paragraph with no blank line above it (`endLeaf`), and a `[^x]` inside inline code stays literal.
- **Reference → superscript, reveal-on-cursor.** `[^1]` renders as a superscript ordinal off-cursor and reveals its raw form on-cursor (the Live-Preview contract, not an atomic token). Numbering follows GitHub: by **first-reference order**, computed over the whole document; an undefined `[^x]` stays literal and an unreferenced definition is excluded from the numbering.
- **Definition rendered in place + collected at the end.** Off-cursor, a referenced definition renders as a real footnote (number + body) where it is authored — locatable and clickable, not hidden — and on-cursor reveals raw for editing. Every referenced definition is also gathered into a section after the last line (the package's first StateField-provided block decoration; IME-safe via the widget's `eq()` and `docChanged`-only recompute). Both renderings share markup so they stay consistent.
- **Re-edit model.** Editing always happens at the source: cursor-on-line reveals raw like any other block, and clicking a collected item moves the cursor to its source definition. The cursor moves; content never teleports.

Always-on (like tables) — no `EditorOptions` change. Known v1 cuts: footnote bodies are plain text (inline markdown inside a footnote not yet rendered), single-line definitions only, and numbering rescans the whole document per edit. A publish-oriented `footnoteLayout: "inline" | "collected"` toggle (collected = clean body, definitions only at the bottom) is a planned follow-up.
