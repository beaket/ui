---
"@beaket/paper": minor
---

Editor base theme: render only real bold/italic faces (`font-synthesis: none`) and expose `word-break` as a public `--beaket-paper-word-break` knob (#554).

- **`font-synthesis: none`** on `.cm-content` — when a configured family lacks a real bold or italic face, the browser no longer synthesizes a faux-bold / faux-oblique. For CJK glyphs synthesis smears strokes and muddies weight; rich text here is body weight plus real Markdown bold, so the regression risk is low.
- **`--beaket-paper-word-break`** (default `normal`, unchanged CJK per-character breaking) — a host can now opt into `keep-all` (break Korean at spaces, not mid-word, a common readability recommendation) from the outside without fighting the cascade against the internal `.cm-*` rules. It pairs with the existing `overflow-wrap: break-word`, so long unbreakable tokens still wrap.
