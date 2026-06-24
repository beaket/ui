---
"@beaket/paper": patch
---

Escape backslashes before pipes when converting pasted tables (CodeQL `js/incomplete-sanitization`).

`escapeCell` (paste-to-markdown-table conversion) escaped `|` as `\|` but left existing backslashes untouched. A pasted cell containing `\|` collapsed to `\\|`, which a GFM parser reads as a literal backslash followed by a **live column delimiter** — defeating the pipe escaping and letting cell content inject extra table columns. Backslashes are now escaped first (`\` → `\\`), so `\|` becomes `\\\|` (escaped backslash + escaped pipe) and the cell boundary holds.
