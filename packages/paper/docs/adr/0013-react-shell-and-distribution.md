# 0013 — React shell and distribution form: a framework-agnostic core + a thin React wrapper, shipped as a standalone npm package

- **Status:** Amended
- **Date:** 2026-06-17
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# The React shell and distribution form — a framework-agnostic core + a thin React wrapper, as a separate npm package

## Status

**Design decision (ahead of implementation).** This ADR records the _direction_ settled during a grilling session. It is written before implementation; the first realized piece is ADR-0012 (`slashItems` = consumer configuration). The decisions here build on that and define how we package, how we expose React, and how we surface the anchor capability (ADR-0014).

## Context

The starting point was: "make this tool portable — from the perspective of the _developer who uses_ this editor." CLAUDE.md calls the editor a "CodeMirror 6 + React shell," but it was ambiguous whether "shell" meant the _unit of distribution_ or the _app wrapper_. At the same time, the organization already has `@beaket/ui` (github.com/beaket/ui), a **shadcn-style copy-paste registry library** (Tailwind + Radix, porcelain theme) — and whether the editor belongs inside that library was the point at issue.

## Decision 1 — Two layers: a framework-agnostic core + a thin React wrapper

- **Core (first-class):** `createEditor(el, opts): EditorView` — does not depend on React. This is the main body.
- **React wrapper (a thin convenience layer):** `<BeaketEditor ref … />` — it only forwards props into `EditorOptions`.

Rationale: the starting point is _portability_. Making React a _required_ public form would block Vue/Svelte/vanilla consumers, which conflicts with the goal. That the CodeMirror core is vanilla is an asset. The precise meaning of "React shell" is a **thin wrapper**, and it is _not the unit of distribution_.

## Decision 2 — An uncontrolled component

`<BeaketEditor defaultValue onChange ref />`. We do not adopt a controlled form that keeps `value` as a live prop.

Rationale ① **It collides head-on with first-class CJK/IME support.** A controlled form swaps the document out whenever the `value` prop changes; if an external value arrives mid-composition (`view.composing`), the result is a cursor jump and a broken composition — it breaks, at the React-contract level, the invariant that ADR-0004 paid the most to protect. ② It aligns with **"the single source of truth for the document = the markdown (owned by the editor)"** (CONTEXT). We do not make React state a second source of truth.

## Decision 3 — The ref handle: curated, with a `getView()` escape hatch

The `ref` exposes a declarative, stable handle as first-class: `{ getValue(): string, setValue(md), focus(), getSelection(), … }`. The raw `EditorView` is **not placed in the public contract**; instead `getView(): EditorView` is kept separately as "unsafe — no cross-version guarantees."

- 99% of consumers are done with the curated handle and need not know CM6 (portability). Power users escape via `getView()`.
- This is the **same discipline** by which ADR-0012 hid the `EditorView` from `slashItems` and separated out privileged actions.
- **`setValue` rides the IME guard** (deferred during composition) — ADR-0004.

## Decision 4 — Prop lifetimes: only the body is imperative; everything else is a live prop

| Input                                     | When it takes effect                                                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Initial document body                     | **Not** a live prop. Wholesale replacement (e.g. opening a different document) is explicit and IME-guarded via **`ref.setValue()`** |
| `highlights` (the comment list, ADR-0014) | Immediately, anytime                                                                                                                |
| `activeHighlightId`                       | Immediately, anytime                                                                                                                |
| `slashItems`, `onInsertImage`, theme      | Immediately, anytime                                                                                                                |

The core distinction: **typing changes flow _out_ from editor → app (`onChange`), while wholesale document replacement is a _command_ from app → editor (`ref.setValue`)**. Making the body a live prop would overwrite the body on every re-render and fight typing/composition (= the controlled form, rejected in Decision 2). Configuration and overlays that are not the body are safe, because they are not the body. The implementation uses CM6 `Compartment`/`StateField` for live reconfiguration (`slashItems` is already an internal facet, ADR-0012).

## Decision 5 — Distribution: a separate npm package, not a `@beaket/ui` registry component

`@beaket/editor` (core) + `@beaket/editor/react` (subpath wrapper). We ship it as an **npm import** and do not publish it as a shadcn-style copy-paste registry entry. CodeMirror = deps, React = peerDep. **No Tailwind dependency.**

Why the editor does not fit `@beaket/ui`'s copy-paste model:

| `@beaket/ui` model                        | The editor's reality                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Single-file copy-paste, no shared imports | CodeMirror is a ~30-file subsystem (StateField, atomicRanges, IME guard, table subviews). Cannot be copy-pasted |
| Styled via Tailwind utility classes       | CM6 paints its own DOM via `EditorView.theme` + CSS variables (ADR-0009). Tailwind classes do not take effect   |
| Lightweight deps (Radix/clsx)             | It pulls in 8 `@codemirror/*` packages. Hiding that inside a copy-paste registry would be dishonest             |
| React-only                                | The core is vanilla (Decision 1). It is not a React component                                                   |
| No major versions                         | The rich API of anchors, `slashItems`, and the handle needs real semver (including major)                       |

## Decision 6 — Integrate the porcelain tokens (currently drifting)

The editor does not need Tailwind; it only needs to consume the porcelain **CSS token values** (the app provides them via the `@beaket/ui` theme, and the editor carries default fallbacks). But right now the tokens _merely imitate, and are diverging_ — measured evidence of a break in the consistency of ADR-0009's visual language:

| Editor (current)              | The real porcelain token (`@beaket/ui`)                                      |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `--accent`, `--accent-sel`    | `--color-signal-blue` (+ `--color-branch`)                                   |
| `--shadow-overlay`            | `--shadow-offset`                                                            |
| `--paper`, `--ink`, `--frost` | `--color-paper`, `--color-ink`, `--color-frost` (with the `--color-` prefix) |

The integration work = align the editor theme so it references porcelain `--color-*`/`--shadow-offset` directly, with fallback defaults when they are absent.

## Decision 7 — Location: co-locate in the `beaket.ui` monorepo (deferred, recorded only)

In the long run, place it as `packages/editor` in the `beaket.ui` monorepo (the same structure as the already-present `packages/cli`). The reason: **share the porcelain tokens from a single source**, structurally preventing the drift of Decision 6, plus sharing the changesets release flow and tooling. With a separate repo, the tokens would be duplicated and the drift would recur.

**However, we do not perform this move now — it is recorded only as future work.** For now, development continues in `sandbox-beaket-editor`.

## Alternatives and rejections

- **Controlled component (controlled `value`)** — risk of IME composition destruction + a double source of truth. Rejected (Decision 2). Document replacement via `ref.setValue` is sufficient.
- **Expose the `EditorView` directly via the ref** — a permanent public dependency on CM6, working against portability. Rejected (Decision 3). Replaced by the `getView()` escape hatch.
- **A `@beaket/ui` registry copy-paste component** — the five mismatches above. Rejected (Decision 5).
- **Graduate to an independent repo** — token duplication → drift recurs. Rejected in favor of co-location (Decision 7), though the timing is deferred.

## Implementation notes

- This ADR is direction. When implementing, apply the discipline of ADR-0005 (jsdom contract tests) + browser verification (coordinates, IME) to each decision.
- The React wrapper's live prop reconfiguration (`Compartment`) and the IME guard on `setValue` must not break the invariants protected by `imeComposition.test` / `composingGuard.test`.
- The details of the anchor capability are in ADR-0014.

## Implementation order settled (2026-06-17 grilling)

Starting from zero lines of implementation, we settle the starting point and order. The three candidates (C: porcelain tokens / B: React wrapper + boundary / A: anchor pure functions) are ordered by dependency:

**Order: B (React wrapper + package boundary) → A (anchor pure functions, ADR-0014) → C (porcelain token integration).**

- **B first** — the keystone. The goal is "a portable package," and the package boundary resolves all of ① where porcelain's fallback lives, ② the granularity of `onChange`, and ③ the surface the anchor props will hang off of. The anchor work (A) is pure and has zero dependencies, but it is a _leaf that blocks nothing if deferred_, so the case for putting it first is weak. Re-anchoring is a port of beaket's `quote-highlights.ts`, so the "eliminate hard unknowns early" argument is also weak.
- **C last** — porcelain's core value (a single source) is blocked by Decision 7 (co-locate, deferred), so for now it is only "matching names + wiring in fallbacks." On top of that, the fallback _location_ depends on B (the boundary), so we defer it to a cleanup step. **The original plan's "porcelain first" is rejected** (low risk = low urgency + with the boundary undecided, the fallback location is left dangling).

### Small branches settled

**`onChange` granularity** — `onChange(value: string)`: on every `docChanged`, it carries the full markdown.

- Honors the IME guard (deferred during composition, fired once after settle, ADR-0004). **No internal debounce in the editor** — debouncing is the consumer's responsibility (lightness = restraint of features).
- For a long document, the per-keystroke O(n) serialization is ~1ms within our scope (a single document, desktop), so it is not an input-responsiveness bottleneck. A consumer that prefers to pull ignores `value` and uses `ref.getValue()`.
- **Rejected**: a value-less notification form (`onChange()` + `getValue` pull) — purest as uncontrolled, but it clashes with React convention and forces `getValue` on every consumer. Since `getValue()` lives on the ref anyway, the pull capability is preserved even with push.

**The exports map** —

```jsonc
{
  "name": "@beaket/editor",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }, // core (vanilla)
    "./react": { "types": "./dist/react/index.d.ts", "import": "./dist/react/index.js" }, // thin wrapper
  },
  "dependencies": { "@codemirror/*": "…", "@lezer/*": "…" }, // CM6 = deps
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "peerDependenciesMeta": { "react": { "optional": true }, "react-dom": { "optional": true } },
}
```

- Core `.` = `createEditor`, `EditorOptions`, `defaultSlashItems`, the types (`SlashItemSpec`/`SlashItemsConfig`), the anchors (`Anchor`/`createAnchor`/`resolveAnchor`). **Zero React imports.**
- `./react` = `<BeaketEditor>` + the handle types. React is kept as an **optional peerDep** so that a vanilla consumer does not get a "not installed" warning.
- **No Tailwind/CSS file export** — `baseTheme` (JS, `EditorView.theme`) is self-sufficient with inline `var()` fallbacks (made concrete below in Decision 6). No separate `import '@beaket/editor/style.css'` is needed.

**The ref handle surface** — the curated minimum + the `getView()` escape hatch (Decision 3 made concrete):

```ts
interface BeaketEditorHandle {
  getValue(): string;
  setValue(md: string): void; // IME guard (deferred during composition, ADR-0004)
  focus(): void;
  getSelection(): { from: number; to: number; text: string } | null;
  getView(): EditorView; // unsafe, no cross-version guarantees
}
```

- **The anchor capability is exposed as React props, not as ref methods** (ADR-0014: `highlights`/`activeHighlightId`/`onHighlightStatusChange`/`onHighlightClick`/`onSelect`). Since `onSelect`'s `sel` already carries the `anchor`, a consumer rarely has to call `createAnchor` directly. A vanilla core consumer is well served by the exported `createAnchor`/`resolveAnchor` functions.

### Decision 6 made concrete — porcelain mapping + fallback location (the plan for step C)

| Editor current                 | → porcelain target                                                        | inline fallback (current value) |
| ------------------------------ | ------------------------------------------------------------------------- | ------------------------------- |
| `--ink`                        | `--color-ink`                                                             | `#232a35`                       |
| `--paper`                      | `--color-paper`                                                           | `#ffffff`                       |
| `--frost`                      | `--color-frost`                                                           | `#f3f4f6`                       |
| `--accent`                     | `--color-signal-blue`                                                     | `#0c6bae`                       |
| `--accent-sel`/`--accent-weak` | not exposed by porcelain → **derived inside the editor** from signal-blue | `rgba(12,107,174,.16/.08)`      |
| `--shadow-overlay`             | `--shadow-offset`                                                         | `2px 2px 0 0 #c0c4ca`           |

- **Fallback location = inside the editor** (inline in `baseTheme`, of the form `var(--color-ink, #232a35)`). We remove the current dependency on the app's `src/index.css` so the package is self-sufficient. If a consumer defines the porcelain `--color-*`, those values override.
- The remaining neutral scale (`--platinum`…`--slate`) and the syntax tokens (`--syn-*`) have no porcelain counterpart, so they remain **editor-owned tokens** (only the prefixes are cleaned up).

## Implementation complete — Step C: porcelain token integration (2026-06-17)

Implemented per Decision 6 + the concrete plan. **Out of scope for tests (the ADR-0005 visual/coordinate carve-out) — only the 5173 browser verification applies**: the 201 tests do not see color, so they are not evidence for C.

**Implementation — a single token source in `theme.ts`, with the 11 extension files unchanged.** Instead of the concrete plan's "per-site inline `var(--color-ink, …)`," we chose **indirect definition** (more DRY, the mapping lives in one place):

- All tokens are defined in the `&` (.cm-editor) scope of `baseTheme`. The porcelain-mapped ones are of the form `--ink: var(--color-ink, #232a35)` (redefining under their own name), while the editor-owned ones (neutral, syntax) are literals. The extensions go on using `var(--ink)`/`var(--accent)` _exactly as before_, and those values resolve through the porcelain mapping + fallback.
- Every overlay (the slash menu, the imageDrop indicator, the copy button) attaches to `view.dom` (= .cm-editor), so the scoped definitions all cascade (confirmed by measurement).
- `--accent-sel`/`--accent-weak` are **derived** from signal-blue via `color-mix(in srgb, var(--color-signal-blue, #0c6bae) 16%/8%, transparent)` — if a consumer overrides signal-blue, the selection tint follows. `color-mix` at 16% = `rgba(12,107,174,.16)` (exactly identical), so the default look is unchanged.

**The goal of the "prefix cleanup" achieved without renaming.** The .cm-editor scoped definitions are more specific than a consumer's `:root{--muted}`, so they are isolated in both directions — consumer neutral tokens do not leak into the editor, and editor tokens do not leak out. So the prefix (`--bk-*`) rename is unnecessary (intentionally omitted; the effect is the same).

**`src/index.css` cleanup.** The whole `:root` block of editor-used tokens is removed → the package is self-sufficient. Only `--canvas` (the body background), used directly by the app shell, remains in `:root` (an app concern, not the package's). The remaining shell rules (body/#root/.editor-shell) are kept, as they are the consumer shell.

**Verification (= C's definition of done, advisor).** ① Visual identity: after moving tokens from index.css → theme.ts, the 5173 render is unchanged. ② **Override measured (the core point)**: `--color-ink:crimson` on `:root` → body crimson (flows in via cascade); overriding `--color-signal-blue` → the derived accent follows; removing it → restored to #232a35. We observe that consumer porcelain tokens are actually integrated. ③ **color-mix render measured**: the used backgroundColor of a highlight span = `color(srgb 0.047 0.420 0.682 / 0.08·0.16)` (valid, non-transparent) — no silent loss from a color-mix parse failure. C creates no new IME-guard dispatch (pure CSS plumbing), so there is no physical-key IME handoff (an intentional absence).

**Side observation (unrelated to C, separate):** the `.cm-selectionBackground{var(--accent-sel)}` rule is _dormant_ — the extension set has no `drawSelection()`, so that element is never created and text selection uses the browser native (same as before C, not a regression). If a porcelain selection tint is wanted, adding `drawSelection()` is separate work.

**Dark mode (ADR-0009, deferred)** can be done by adding one more `@media (prefers-color-scheme: dark)` block to the token block in `theme.ts`, overriding the editor-owned literals — being a single source, only one place is touched.

## Implementation complete — Step B (2026-06-17)

Step B (React wrapper + package boundary) implemented and verified. 159 tests green, the core closure confirmed to have zero React, and no 5173 browser regression.

**The source-module seam (= the substance of the "package boundary." The package.json `./dist` is held back from publishing, so it is left untouched, Decision 7).**

- `src/index.ts` — the core entry (vanilla). Re-exports `createEditor`/`EditorOptions`/`defaultSlashItems`/the slash types. **Zero React in the import closure** (verified both by build and by grep). The anchors are added to this surface in Step A.
- `src/react/index.ts` + `src/react/BeaketEditor.tsx` — the thin wrapper. No logic, only wiring (calling the core, the ref handle). So the core is contract-verified under jsdom (ADR-0005) without React test dependencies.
- Core cleanup: removed `sampleDoc`/`import.meta.env.DEV`/`window.__view` from `createEditor` → **sandbox concerns (the sample document, the debug exposure) move to the consumer App**. The core option = `doc` (the initial body), the React prop = `defaultValue`. `__view` is exposed by the App in DEV via `ref.getView()`.

**`onChange`/`setValue` asymmetry — resolving an internal contradiction in the ADR (settled 2026-06-17, a user decision).**

- This ADR's "push on every `docChanged`" (literal) and "typing flows out / replacement is a command" (framing) conflict → **the framing is adopted: `onChange` fires only on user edits, and `setValue` produces no echo.** Rationale: a consumer's dirty-flag/save must not misfire when the consumer loads a document (`setValue`) + the React uncontrolled convention (a programmatic set does not trigger `onChange`).
- **Implementation = an opt-out annotation (`silentDocChange`), not an `isUserEvent` whitelist.** Reason: "programmatic changes triggered by typing," such as `tableAutoConvert`/`pasteTableConvert`, are the result of a user edit and must keep being pushed — a user-event whitelist would miss them. Marking only `setValue` with the annotation to exclude it preserves the auto-conversion push.

**The IME invariant (ADR-0004) is embedded in the core — proven by jsdom contract tests.**

- `changeNotifier` (`src/editor/extensions/changeNotifier.ts`): an updateListener. Deferred during composition → woken by `composingWake`'s `composingRefresh` to push the final doc once. When `onChange` is unspecified, `[]` (existing tests invariant). `changeNotifier.test.ts`.
- `valueController` (`src/editor/valueController.ts`): `setValue` is deferred during composition → applied after `compositionend`, marked with `silentDocChange`. `dispose()` makes StrictMode unmount / deferred-work cancellation safe. `valueController.test.ts`.

**What was intentionally not built in Step B (out of scope, with the deferral rationale recorded).**

- **No live prop reconfiguration (`Compartment`).** `highlights`/`activeHighlightId` are Step A surface, so they are "left blank." `onInsertImage`/`slashItems` are also **fixed at creation time** for now (the Step B checklist has no live-reconfiguration item → implementing it preemptively would be over-engineering). Only `onChange` is held via a ref to call the latest callback (avoiding editor recreation). When live reconfiguration becomes necessary, it goes via `Compartment` in Step A.
- The ref handle surface = `getValue`/`setValue`/`focus`/`getSelection` (null on an empty selection)/`getView()` (unsafe). The anchor capability is props (Step A).

## Amendment (2026-06-21) — React component renamed BeaketPaper -> Paper

The body above is **historical** — it was written on 2026-06-17, before the rename, and its identifier names reflect the prototype as it then stood.

**Rename (PR #455 / v0.3.0).** The React component and its types were renamed:

- `BeaketPaper` → `Paper`
- `BeaketPaperHandle` → `PaperHandle`
- `BeaketPaperProps` → `PaperProps`

(Note: the prototype body above uses the even earlier names `BeaketEditor` / `BeaketEditorHandle`; the public component went through `BeaketPaper` before arriving at the current `Paper`.) The component now lives at `src/react/paper.tsx` (not `BeaketEditor.tsx`), and `src/react/index.ts` exports `{ Paper }` plus the types `{ PaperHandle, PaperProps }`. Wherever the historical body says `BeaketEditor`/`BeaketEditorHandle`/`<BeaketEditor>`, read `Paper`/`PaperHandle`/`<Paper>`.

**Package name.** The body's `@beaket/editor` (and the `@beaket/editor/react` subpath) is now **`@beaket/paper`** (the standalone npm package), with the React wrapper at the `./react` subpath.

**What still holds (the decision is intact).** The substance of every decision survives the rename and is confirmed against the current code:

- **Decision 1 (framework-agnostic core + thin React wrapper):** `src/index.ts` is the vanilla core entry with zero React imports; `src/react/paper.tsx` is the thin React wrapper that only does wiring.
- **Decision 2 (uncontrolled):** `defaultValue` is the initial value only; the effect does not recreate on `defaultValue` change.
- **Decision 3 (curated ref handle + `getView()` escape hatch):** `PaperHandle` exposes `getValue`/`setValue`/`focus`/`getSelection`/`getView()` (the last marked unsafe).
- **Decision 5 (standalone npm package, not a registry component):** still a published package, React still an optional `peerDep`.

**Exports map / peerDeps verified (no drift beyond the names).** `packages/paper/package.json` matches what the body claims: the **exports map** has `.` (core) and `./react` (wrapper), both pointing at `./dist/...`; `react`/`react-dom` are `peerDependencies` (`>=18`) and both `optional` in `peerDependenciesMeta`; the `@codemirror/*` and `@lezer/*` packages are regular `dependencies`. The only deviations from the historical body are the two name changes above (`@beaket/editor` → `@beaket/paper`, `BeaketEditor*` → `Paper*`).

**Additional drift since the body was written (capabilities now present that the body marked as future).** The historical body describes anchors/highlights and `colorScheme` as later-step surface; in the current code they are implemented:

- `PaperProps` now includes the live anchor/highlight props (`highlights`, `activeHighlightId`, `onHighlightStatusChange`, `onHighlightClick`, `onSelect`) of ADR-0014, reconfigured live via dedicated controllers — no longer "left blank."
- A `colorScheme` live prop (`"light" | "dark" | "system"`) exists, flipped via a compartment reconfigure without recreation (dark mode, which the body deferred under ADR-0009, has shipped — v0.2.0).
- The package now lives in the `beaket.ui` monorepo at `packages/paper` — i.e. the co-location of **Decision 7** (recorded as deferred future work in the body) has since been carried out.
