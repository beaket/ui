---
"@beaket/ui": minor
---

Drop three dependencies and one migration path.

- `Label` and `Separator` render a plain `<label>` and `<div role="separator">` instead of wrapping `@radix-ui/react-label` / `@radix-ui/react-separator`. Same DOM, same `data-slot`/`data-orientation`/`aria-orientation`, two fewer packages for a project that installs them. Radix Label's one behavior beyond the element — suppressing text selection when a label is double-clicked — is gone with it.
- The CLI drops `fs-extra` and `picocolors` for `node:fs/promises` and `node:util.styleText`, which raises its floor to **Node 22.13** (now declared in `engines`).
- `ui theme` and `ui add` no longer recognise a theme block written before the `/* beaket:theme:start */` markers shipped (April 2026, #309). An unmarked block is now left alone and the current theme is appended after it; re-run `npx @beaket/ui init` if your CSS still carries one.
