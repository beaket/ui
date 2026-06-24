---
"@beaket/paper": minor
---

Wrap the selection on type (Notion/Obsidian style): with text selected, typing `(` `[` `{` `` ` `` `"` `'` or `*` now surrounds the selection with the pair and keeps the selection on the inner text, instead of replacing it. Always-on, no config.

Because the selection stays on the inner text after a wrap, pressing the same marker twice nests it — pressing `*` twice yields bold and `` ` `` twice yields a double-backtick code span. Single `_` and `~` are deliberately excluded: a lone `_word_` won't render intra-word in CommonMark and a lone `~word~` isn't GFM strikethrough (use `*` / double-`*`, or two backticks).
