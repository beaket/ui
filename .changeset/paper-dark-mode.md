---
"@beaket/paper": minor
---

Add dark mode to `@beaket/paper`. The editor now follows the OS `prefers-color-scheme` automatically.

- Previously, dark mode only flipped the porcelain-bridged tokens, but the editor pinned `--color-ink` and its editor-owned tokens (canvas, surface, code-syntax ramp, overlay shadow) to light values — so body text rendered dark on a dark surface and was unreadable.
- Every token now carries a dark-aware default while keeping its `var()` chain intact, so `--beaket-paper-*` overrides and the porcelain `--color-*` bridge still win in both modes. Dark defaults mirror porcelain's dark block, with a GitHub Dark Default code-syntax ramp.
- The dark tokens ship as a scoped stylesheet (CodeMirror's theme builder can't emit `@media` for the root selector); the task-list checkbox also gets a dark checkmark so it stays visible on the light checked fill.
