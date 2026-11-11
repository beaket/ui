---
"@beaket/paper": patch
---

Stop pasting tab-containing text inside code from turning into a markdown table. The paste-to-table handler only checked `readOnly` and the clipboard and never where the cursor was, so pasting indented code (for example Go) into a fenced block, indented code block or inline code replaced it with a table. The handler now returns early when the selection sits inside `FencedCode`, `CodeBlock` or `InlineCode`, leaving the paste to CodeMirror's default insertion (#1241).
