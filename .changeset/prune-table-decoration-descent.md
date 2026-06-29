---
"@beaket/paper": patch
---

perf(table-widget): prune buildTableDecorations syntax-tree descent to block containers only

Root cause: `syntaxTree(state).iterate({ enter })` returned `undefined` (not `false`) for every
non-`Table` node, so it descended into the inline children of every `Paragraph`, `Heading`, etc.
on each `docChanged`. Cost scaled linearly with document size per keystroke even though tables are
block-level structures.

Fix: return `false` immediately for nodes that are not `Table` and not in the block-container set
(`Document`, `Blockquote`, `BulletList`, `OrderedList`, `ListItem`). The produced `DecorationSet`
is identical to before — GFM tables do nest inside blockquotes and list items, and the container
set covers all paths. `FootnoteDefinition` is single-line only in this package's v1 implementation
and can never contain a multi-line table.
