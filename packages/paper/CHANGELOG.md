# @beaket/paper

## 0.4.1

### Patch Changes

- [#491](https://github.com/beaket/ui/pull/491) [`7e724ff`](https://github.com/beaket/ui/commit/7e724ffe6f285ab8c8e22bfd529052e89e8d6136) Thanks [@jihnma](https://github.com/jihnma)! - Fix the task-list checkbox checkmark becoming invisible under a forced `colorScheme`. The checked checkmark image was selected with a bare `@media (prefers-color-scheme: dark)` rule, but forced light/dark schemes are driven by editor scope classes (`.cm-beaket-paper-dark` / `.cm-beaket-paper`), and the OS media query doesn't match a forced scheme. So a checkbox forced opposite the OS (e.g. `colorScheme="dark"` on a light OS) painted a same-color checkmark on its `--ink` fill — invisible. Root cause: it was the only styling rule keyed on `prefers-color-scheme` instead of the scope class. The checkmark image is now the internal `--cm-check-mark` editor token (light default in `tokens`, dark value in `darkTokens`), so it rides the same scoped dark stylesheet as every other dark token and follows the active scheme in both `system` and forced modes.

- [#495](https://github.com/beaket/ui/pull/495) [`b6ba398`](https://github.com/beaket/ui/commit/b6ba398c922cd84c3669e1187881148e9fa5858a) Thanks [@jihnma](https://github.com/jihnma)! - `tableBoundaryGuard` walked the full syntax tree on every `docChanged` transaction, including pure insertions (normal typing, `fromA === toA`), which can never delete a boundary newline and can never be blocked. Root cause: the guard's `syntaxTree().iterate()` ran unconditionally before the check that actually uses it. Fix: scan `tr.changes` once up-front; if no change has `toA > fromA` (no deletion or replacement), return the transaction immediately without walking the tree — eliminating the tree walk on the common keystroke path.

- [#506](https://github.com/beaket/ui/pull/506) [`3299dda`](https://github.com/beaket/ui/commit/3299ddac3e86680487f7307945d612e63169f96f) Thanks [@jihnma](https://github.com/jihnma)! - Clarify in the README that `getView()` is the deliberate raw escape hatch with no cross-version guarantee, and that there is intentionally no blessed `extensions` injection slot. This records the consumer-facing outcome of the extensibility decision ([#497](https://github.com/beaket/ui/issues/497), ADR-0015): a raw `Extension[]`/`keymap` slot on `EditorOptions` is declined because it would leak CodeMirror into the 1.0-frozen public surface and let a consumer break the core invariants (the composing guard, the permanently-hidden table structure). Concrete extensibility needs route to the declarative APIs instead; raw access stays on the unsafe `getView()` handle.

## 0.4.0

### Minor Changes

- [#469](https://github.com/beaket/ui/pull/469) [`3a9ff1c`](https://github.com/beaket/ui/commit/3a9ff1cc2e0e808eb9c122cf91203dabb92b3813) Thanks [@jihnma](https://github.com/jihnma)! - Add a `colorScheme` prop (`"light" | "dark" | "system"`). Previously the editor only followed the OS `prefers-color-scheme`; now a consumer with its own theme toggle can force light or dark. It's a live prop — flipped via a CodeMirror compartment, so switching never recreates the editor or drops the document. The vanilla core exposes the same `colorScheme` option plus a `setColorScheme(view, scheme)` helper. `"system"` remains the default, so existing usage is unchanged.

### Patch Changes

- [#467](https://github.com/beaket/ui/pull/467) [`3a5a652`](https://github.com/beaket/ui/commit/3a5a652fb9c291e2f88f27649e7149bdca120068) Thanks [@jihnma](https://github.com/jihnma)! - Refresh the npm README: a frontend-focused quick start (install → import → go), standalone-first framing, and links out to the docs site for the full styling and API reference instead of duplicating them inline.

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
