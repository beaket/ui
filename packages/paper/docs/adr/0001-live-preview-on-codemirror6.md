# 0001 — Live Preview editing model, CodeMirror 6 engine

- **Status:** Accepted
- **Date:** 2026-06-13
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Live Preview editing model, CodeMirror 6 engine

If we look only at the goal — "easy even for people who don't know markdown" — a WYSIWYG rich-text tree model would seem the natural fit. Instead, we chose an Obsidian-style Live Preview: the substance of the document is always plain markdown text, and only the part where the cursor sits exposes the raw syntax. The reasons are (1) when markdown is the source of truth, an entire category of problems — lossy format conversion and synchronization bugs — simply never arises, and (2) it aligns with our core values of lightness and simplicity.

The engine is CodeMirror 6. Because text is a first-class model, it is structurally consistent with Live Preview; its CJK IME composition handling is proven (Korean, Japanese, and Taiwanese users are first-class users); and Obsidian has operated with this same choice for years, proving its feasibility. The ProseMirror family was ruled out because its node tree becomes the substance, which would require a bidirectional conversion layer to and from markdown. We accept the cost of having to implement syntax hiding and widget rendering ourselves via decorations — that extension system also fits the requirement for "a design that is easy to extend."
