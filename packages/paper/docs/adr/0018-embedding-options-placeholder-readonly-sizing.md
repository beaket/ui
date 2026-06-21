# 0018 — Embedding options: `placeholder`, `readOnly`, and explicit sizing (`height` / `minHeight`)

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Embedding options: `placeholder`, `readOnly`, and explicit sizing (`height` / `minHeight`)

## Context

Three table-stakes embedding options were missing from `EditorOptions`, so consumers faked them: a
placeholder via absolutely-positioned CSS, read-only via the unsafe `getView()` hatch and a
hand-wired reconfigure, and height "by accident" of whatever CSS the host hung on the wrapper.

This is child ⑤ of the embedding/extensibility epic (#505, issue #501). Like its siblings it is a
**decision** (`type:arch`): it adds public API to the surface that **freezes at 1.0** (#480), and the
read-only behavior matrix + the sizing model are load-bearing. Each addition is in the same build-time
**consumer-config family** as `slashItems`/`triggers`/`tokens`/`colorScheme` — no public type names a
CM6 internal or a DOM node (the ADR-0012 decision 2 / ADR-0016 lock-in rule).

The sizing item carried a concrete repro (issue #501 comment): when a host reserves a `min-height` on
the editor with a short or empty document, the **editable surface does not fill it** — `.cm-content`
stays one line tall while `.cm-editor` is the reserved height, so the area below the content is a
non-focusable dead zone (clicking it neither focuses nor places a cursor), unlike a `<textarea>`.

## Decision 1 — `placeholder?: string`: CodeMirror's `placeholder`, wired only when set

`EditorOptions` (and the `<Paper placeholder>` prop) gains `placeholder?: string`. It wires
CodeMirror's own `placeholder` extension, which renders the hint on an empty document and hides it once
there is text. Plain text only for v1 (CM's `placeholder` also accepts an `HTMLElement`/render
function — deferred, additive on a `0.x` minor if demand appears; a string keeps the frozen surface
DOM-free, the same restraint as `tokens` returning `{label}` not a node, ADR-0017). Fixed at creation.

## Decision 2 — `readOnly?: boolean`: both CM6 facets, in a live compartment, with an explicit behavior matrix

`readOnly` sets **two** CM6 facets together, in one compartment:

- `EditorState.readOnly` — the _intent_ flag built-in commands consult to opt out.
- `EditorView.editable` (off) — turns `contenteditable` off, so the browser itself blocks typing, IME,
  and drag-to-edit, and the content stops being a text-input target.

`setReadOnly(view, …)` (React: the `readOnly` prop) reconfigures the compartment to flip the mode
**live** without recreating the editor — the same live-flip pattern as `setColorScheme` (ADR-0009
amendment). It is the one new option here that earns a compartment; `placeholder`/`height`/`minHeight`
are fixed at creation (lightness — see Decision 4).

**Why a behavior matrix is load-bearing.** `EditorState.readOnly` does **not** block a raw
`view.dispatch` — by CM6 design it only makes built-in _commands_ opt out. So every entry point that
mutates the document through its own DOM handler or command must guard on `view.state.readOnly`
itself; `editable=false` covers only browser-native editing. The matrix:

| Surface                                             | Read-only behavior | Mechanism                                                                                                                                                        |
| --------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typing / IME                                        | inert              | `editable=false` (contenteditable off)                                                                                                                           |
| Built-in keymaps (defaultKeymap, history, markdown) | inert              | they consult `EditorState.readOnly`                                                                                                                              |
| `blockquote-keys`, `code-block-enter`               | inert              | keystroke commands — starved of input by `editable=false`                                                                                                        |
| `table-auto-convert` (type `\| … \|` + Enter)       | inert              | `editable=false` **+** an explicit `readOnly` guard (defense in depth)                                                                                           |
| **Table cell editing** (click a cell → subview)     | **blocked**        | the cell subview is a _separate_ `EditorView`, so the parent's `editable` does **not** propagate — an explicit guard at the mousedown entry **and** in `mount()` |
| Image drop / paste ingest                           | blocked            | explicit `readOnly` guard in the drop/paste/dragover handlers                                                                                                    |
| Paste-to-table conversion                           | blocked            | explicit `readOnly` guard in the paste handler                                                                                                                   |
| Markdown-copy + per-fence copy buttons              | **keep working**   | they dispatch nothing to the document; read-only docs are exactly when copy matters                                                                              |
| Native selection                                    | **keeps working**  | `editable=false` still allows selection (so copy works)                                                                                                          |

The **table cell subview is the sharp edge**: because it is its own `EditorView` mounted on the focused
cell (ADR-0003), `editable=false` on the parent leaves it independently editable. Guarding only the
mousedown entry would miss a programmatic activation, so `mount()` also returns early when
`view.state.readOnly` — both are contract-tested.

## Decision 3 — Sizing: two options mapping 1:1 to CM6's documented recipes; the dead-zone fix is unconditional

Two independent, optional CSS lengths, each the CodeMirror-documented recipe:

- `height?: string` — a **fixed** height with internal scroll. Sized on `.cm-editor` (`&`): the editor
  owns its sizing; the React wrapper `<div>` is just a mount point. The scroll comes from
  `.cm-scroller { overflow-y: auto }` (added unconditionally to `baseTheme` — inert in grow mode,
  where the scroller is content-sized and never overflows).
- `minHeight?: string` — a **minimum editable height** that grows with content. Sized on
  **`.cm-content`** — the _editable surface itself_, not the outer wrapper — which is exactly the
  dead-zone fix: with the editable at least `minHeight` tall, clicking anywhere in the reserved height
  places a cursor. Targeting `.cm-content` (CM6's official min-height recipe) rather than `.cm-editor`
  also sidesteps the percentage-`min-height` flex gotcha (a percentage min-height resolves against the
  parent's _computed_ height, which is auto here, so it would collapse). The `minHeight` rule is
  scoped to the **direct** `& > .cm-scroller > .cm-content`, not a bare `.cm-content`: a CM theme rule
  is a descendant selector off the editor root, so a bare `.cm-content` would also match the nested
  table-cell subview (a separate `EditorView` mounted inside `.cm-content`, ADR-0003) and balloon every
  focused cell to the full min-height — the same trap the docs playground worked around by hand. The
  child combinator pins the floor to the top-level editable only.

Both unset (the default) = pure grow-with-content, layout unchanged.

**The fill is decoupled from the option.** CM6's default theme already gives
`.cm-content { min-height: 100%; flex-grow: 2 }` over a `.cm-scroller { height: 100% }`; `baseTheme`
adds `.cm-scroller { flex-grow: 1 }` so the scroller claims the editor's spare vertical space however
the editor got tall — our `height` **or** a host sizing `.cm-editor` directly. So the editable surface
fills whenever `.cm-editor` is taller than its content, not only when `height` is set. The literal
repro — a host `min-height` on the editor with an empty doc — is resolved by using `minHeight` (or the
documented `.cm-content` CSS hook), which puts the reserved height on the editable surface itself.

The rendered geometry (grow vs. fixed-scroll, and click-anywhere-focuses) is **browser-verified**, not
jsdom-tested — jsdom returns zero-size rects (invariant #4). jsdom asserts only the wiring: `sizeRules`
maps the options to the right selectors (the pure seam, like `darkThemeCss`).

## Decision 4 — Live vs. fixed-at-creation: only `readOnly` gets a compartment

`readOnly` is live-flippable (toggling an edit/view mode is a real use); `colorScheme` already is.
`placeholder`, `height`, and `minHeight` are **fixed at creation** — like `slashItems`/`triggers`/
`tokens` — per the lightness principle ("there must be a reason to add it"). Live reconfiguration of
the sizing/placeholder options is a non-breaking `0.x` minor if demand appears; starting narrow keeps
the frozen surface minimal.

## Alternatives and rejections

- **Placeholder as `HTMLElement`/render function** (CM supports it) — exposes a DOM node on the frozen
  surface; deferred, additive later. Rejected for v1 (string-only, DOM-free).
- **Read-only via `editable=false` alone** — would leave `view.dispatch`-based handlers (image
  ingest, paste-to-table, the table subview) live, so a "read-only" editor would still mutate.
  Rejected: both facets **and** the entry-point guards are required for coherence.
- **A single `autosize?: boolean`** — conflates the two real needs (a fixed scroll height vs. a grow
  floor) and can't express "fixed height" without a value. Two CSS-length options map 1:1 to CM's
  recipes and are strictly more expressive. Rejected.
- **Sizing the wrapper `<div>`** — the percentage-height chain then can't reach `.cm-content`, so the
  dead zone persists; and it splits sizing ownership between the host's div and the editor. The editor
  owns its sizing on `.cm-editor`/`.cm-content`. Rejected.
- **Gating the content-fill behind `height`** — would leave the reported repro (host `min-height`, no
  JS option) broken. The fill is unconditional instead. Rejected.

## Consequences

- **The 1.0-frozen `EditorOptions` surface gains three declarative, CM6/DOM-free options**
  (`placeholder`, `readOnly`, `height`, `minHeight`) plus a live `setReadOnly` helper. No public type
  names a CodeMirror internal or a DOM node; ADR-0012 decision 2 / ADR-0016 hold.
- **Read-only is coherent, not partial:** the behavior matrix above is the contract, the table cell
  subview and the doc-mutating ingest paths are explicitly guarded, and copy keeps working. Held to
  the regression gate — full suite green.
- **Height is an explicit, documented option** instead of CSS-by-accident, and the click-target dead
  zone is fixed unconditionally (the editable surface fills the editor's reserved height).
- **Deferred, not foreclosed:** rich placeholder content, live reconfiguration of
  `placeholder`/`height`/`minHeight`, and a `maxHeight` option.
- Updates the **load-bearing** "mechanism-in-editor / policy-in-consumer" constraint in `DECISIONS.md`
  (the consumer-config family now also includes `placeholder`/`readOnly`/sizing), so that bullet is
  updated, along with `CONTEXT.md`'s public-API surface list.
