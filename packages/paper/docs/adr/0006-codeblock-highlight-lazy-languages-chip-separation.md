# 0006 — Code-block highlighting via lazy `language-data`, with the inline-code chip style separated from the monospace tag

- **Status:** Accepted
- **Date:** 2026-06-13
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Code-block highlighting is wired through lazy-loaded `language-data`, and the inline-code chip style is separated from the monospace tag

Per-language syntax highlighting for code blocks is attached through `markdown()`'s `codeLanguages: languages` option (from `@codemirror/language-data`). The language parsers are lazy-loaded via dynamic import — a given language's parser is fetched only the first time a fence of that language is encountered in the document, so there is no impact on the initial bundle or on input responsiveness (the lightness principle). Once the load finishes, CM6 re-parses and re-highlights on its own, so we need no loading code of our own at all. For the token colors, we added the code tags (keyword/string/comment/number/typeName/function, etc., in the GitHub Light family) directly to our existing `sourceHighlight`. We do **not** use the approach of layering `defaultHighlightStyle` with `{ fallback: true }` on top — the fallback highlighter is ignored whenever even a single non-fallback highlighter is registered, so in a setup like ours, which uses its own `HighlightStyle`, it would silently have no effect.

A trap discovered during this work: lezer-markdown attaches `tags.monospace` to **both InlineCode and fence content (CodeText)**. So if you give the inline-code chip style (background and 0.9em) to the monospace tag, it leaks into the code-block content as well — in practice, a chip background was being laid over each token on top of the code-block line background (double layering), and the 0.9em compounded with the line's (`.cm-codeblock-line`) own 0.9em, double-shrinking the font to 0.81em (13.77px against a 17px base). Language-tagged fences are worse still: their nested parse replaces the CodeText highlight, so the chip disappears — producing an inconsistency where the style differs depending on whether the fence has a language. The fix: leave only the font family on the monospace tag, and move the chip (background, radius, 0.9em) onto a mark decoration (`.cm-inline-code`) that inlineSyntaxHiding always attaches to the InlineCode node. The criterion for whether a node-level style should be given via a tag versus a decoration: **when several nodes share the same tag, the tag style leaks** — a style that must be bound to one specific node should be a decoration.

Relationship to the IME: nested-language highlight recomputation is the territory of the CM6 core (`syntaxHighlighting`), so it runs outside our composing guard (ADR-0004). This was already the case before this change (markdown's own highlighting), and since the CM6 core preserves the composition-range DOM, the guard contract remains valid as-is. That said, the timing where a language parser finishes loading mid-composition is an area that is hard to reproduce in jsdom, so if a composition break is reported, this is the first place to suspect. The test is `code-block-highlight.test.ts` — it polls (`until`) for the asynchronous load → re-parse → re-decorate sequence, then asserts token separation and the absence of chip leakage (a regression test in the ADR-0005 tier).
