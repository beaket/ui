# @beaket/paper

## 0.3.0

### Minor Changes

- [#455](https://github.com/beaket/ui/pull/455) [`3574af2`](https://github.com/beaket/ui/commit/3574af2b1e0fef6225e6870ffdae43dafe5838b1) Thanks [@jihnma](https://github.com/jihnma)! - Rename the React component from `BeaketPaper` to `Paper` (and its types `BeaketPaperHandle` → `PaperHandle`, `BeaketPaperProps` → `PaperProps`). The package scope (`@beaket/paper`) already namespaces the export, so the prefix was redundant.

  **Breaking:** update imports from `@beaket/paper/react`:

  ```diff
  -import { BeaketPaper, type BeaketPaperHandle } from "@beaket/paper/react";
  +import { Paper, type PaperHandle } from "@beaket/paper/react";
  ```

  If `Paper` collides with another import in your code, alias it: `import { Paper as BeaketPaper } from "@beaket/paper/react"`.

## 0.2.0

### Minor Changes

- [#453](https://github.com/beaket/ui/pull/453) [`56c3b0d`](https://github.com/beaket/ui/commit/56c3b0dac33b2c66ee0db11038676a58d35c3e08) Thanks [@jihnma](https://github.com/jihnma)! - Add dark mode to `@beaket/paper`. The editor now follows the OS `prefers-color-scheme` automatically.

  - Previously, dark mode only flipped the porcelain-bridged tokens, but the editor pinned `--color-ink` and its editor-owned tokens (canvas, surface, code-syntax ramp, overlay shadow) to light values — so body text rendered dark on a dark surface and was unreadable.
  - Every token now carries a dark-aware default while keeping its `var()` chain intact, so `--beaket-paper-*` overrides and the porcelain `--color-*` bridge still win in both modes. Dark defaults mirror porcelain's dark block, with a GitHub Dark Default code-syntax ramp.
  - The dark tokens ship as a scoped stylesheet (CodeMirror's theme builder can't emit `@media` for the root selector); the task-list checkbox also gets a dark checkmark so it stays visible on the light checked fill.

## 0.1.0

### Minor Changes

- [#445](https://github.com/beaket/ui/pull/445) [`9950d96`](https://github.com/beaket/ui/commit/9950d969e1fd3654bc2f9937d155b8c931aeecf7) Thanks [@jihnma](https://github.com/jihnma)! - Add `@beaket/paper`: a markdown-first, CJK-first Live Preview editor, published as a standalone npm package (not a copy-paste registry component).

  - Framework-agnostic core (`@beaket/paper`, `createEditor`) with zero React, plus a thin React wrapper (`@beaket/paper/react`, `<BeaketPaper>`).
  - Uncontrolled by design (`defaultValue` + `ref.setValue()`); `onChange` emits full markdown on user edits only, guarded against IME composition.
  - CodeMirror 6 engine with a permanently-hidden table widget, IME composing guard, Live Preview syntax hide/show, slash menu, image ingestion hooks, and source-anchored selection annotations.
  - Porcelain design tokens reconciled against `@beaket/ui`'s `porcelain.css`: inherits `--color-*` when present, self-sufficient via fallbacks standalone.
