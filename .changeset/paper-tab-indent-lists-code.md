---
"@beaket/paper": minor
---

Tab indentation for lists and fenced code blocks (ADR-0022).

- **Lists**: Tab nests the item one level deeper (under its preceding sibling), Shift+Tab lifts it one level shallower — or strips the marker at top level. The whole item subtree (continuation lines + child items) shifts together, so nesting stays valid. Indent depth is driven by the parsed syntax tree (the parent's content column — 2 under `- `, 3 under `1. `), not a fixed space count, and is blockquote-aware (indents after the `> ` prefix). The first item of a list has no parent to nest under, so Tab there is a consumed no-op rather than a focus escape.
- **Code blocks**: VSCode-style Tab/Shift+Tab — Tab inserts one indent unit of spaces (or indents every line of a multi-line selection), Shift+Tab outdents — scoped to fenced code content lines (the fence delimiter lines are left alone so Tab can't break the fence). Indentation is spaces (the default 2-space unit), not a hard tab.

Tab is never bound globally (no `indentWithTab`): each handler yields outside its context so plain prose keeps the default focus-move (and never gets silently turned into an indented code block by stray leading spaces). Precedence: an open slash/trigger menu's Tab still wins; a list line inside a blockquote indents the list, not the quote; Tab inside a code block nested in a list/quote still reaches the code-block handler.

v1 limits: ordered-list numbers aren't renumbered on indent/outdent, and a range selection in a list falls through. Table-cell Tab navigation and code-block auto-closing brackets are deferred to follow-ups.
