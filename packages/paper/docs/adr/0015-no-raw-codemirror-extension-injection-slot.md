# 0015 — No raw CodeMirror `Extension[]` injection slot; keep raw access on the explicitly-unsafe `getView()` escape hatch and route concrete needs to declarative APIs

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# No raw CodeMirror `Extension[]` injection slot; keep raw access on the explicitly-unsafe `getView()` escape hatch and route concrete needs to declarative APIs

## Context

A consumer who needs editor behavior the package does not ship — a custom keymap, a bespoke
decoration, a third-party CM6 extension — has no _blessed_ entry point today. The only escape is the
`getView()` handle on the React ref (ADR-0013 decision 3), which is documented as **unsafe** ("Raw
CM6 `EditorView` — no cross-version guarantees"); from it a power user can reconfigure the live view
by hand (`view.dispatch({ effects: StateEffect.appendConfig.of(ext) })`, or compartment
reconfiguration) with no contract from us.

The request is to bless a first-class injection slot — an `extensions?: Extension[]` (or
`(defaults) => Extension[]`) field on `EditorOptions`. This is a **decision** because it adds public
API, and the public surface is **slated to freeze at 1.0** (#480, milestone `1.0.0`): breaking
changes are cheap on `0.x` minors now and expensive deliberate majors after, so what we bless here we
carry. It is also a **boundary** decision — it lands exactly on the line that `CONTEXT.md` invariant
#3 and ADR-0012 draw.

The tension. `CONTEXT.md` invariant #3 is explicit: the editor exposes **build-time injection
points**, _not_ a runtime plugin system, and the curated APIs (`slashItems`, `onInsertImage`)
**deliberately do not expose `EditorView`** (ADR-0012 decision 2). A raw `extensions?: Extension[]`
slot is effectively "`getView()` at construction time" — it leaks CM6 internals into the surface that
freezes at 1.0.

### Options weighed

- **A.** Bless `extensions?: Extension[]` (or `(defaults) => Extension[]`), appended at a defined
  precedence slot.
- **B.** Keep raw injection as the explicitly-_unsafe_ `getView()` escape hatch only, and push
  concrete needs into the declarative APIs (#498–#501).
- **C.** A narrow, named middle ground — e.g. a `keymap`-only slot.

## Decision — B. Do not add a raw injection slot; defer (do not foreclose)

We add **no** `extensions[]` (option A) and **no** `keymap` slot (option C) to `EditorOptions` for
1.0. Raw, un-contracted access stays where it already is and is already honestly labeled: the
`getView()` escape hatch (ADR-0013 decision 3). Concrete extensibility needs are routed to the
**declarative, `EditorView`-free** sibling APIs in the epic (#505): the trigger API (#498), atomic
token rendering (#499), grouped/async slash items (#500), and `placeholder`/`readOnly`/autosize
(#501). This is the outcome the epic itself anticipates ("#497 may bless an injection slot or be
rejected in favour of the declarative APIs — #498–#501 stand alone either way").

This is a **deferral, not a permanent door-slam**, in the established stance of ADR-0012 decision 1
("we do not open it speculatively now"). If real demand for a _narrow declarative_ slot appears, a
future ADR can add it on a cheap `0.x` minor before the freeze.

### Why A is rejected — it reverses ADR-0012 decision 2, on both halves

ADR-0012 decision 2 named the **hardest-to-reverse** lock-in: a public API that exposes
`EditorView`. A raw `extensions[]` slot reintroduces exactly that, doubly:

1. **CM6 becomes a permanent public dependency.** `Extension` is a CM6 type; blessing it ties the
   frozen 1.0 surface to CodeMirror's package and version, working directly against the portability
   that ADR-0012 decision 2 and ADR-0013 protect. The declarative APIs (`SlashItemSpec.insert` is a
   _markdown string_; highlights anchor to _markdown source_) were shaped precisely so that no public
   type names a CM6 internal.
2. **A raw extension can break core invariants.** An injected `ViewPlugin`/decoration source that
   does not go through `guardedDecorations` violates the composing guard (ADR-0004, invariant #1 —
   "the most expensive invariant"); an injected widget over a table range can break the permanently-
   hidden table structure and its atomic ranges (ADR-0002/0003). We would be handing consumers a
   build-time, _blessed_ way to corrupt the invariants the whole package is built to hold — and then
   freezing that promise at 1.0.

A is, precisely, "`getView()` at construction time." Its capability already exists on `getView()`;
the only thing blessing it adds is a **contract we cannot keep across the freeze**.

### Why C is rejected — a keymap slot is not actually more declarative, and has a live precedence hazard

C looks like a safe middle ground but fails on two facts that hold _today_:

1. **It carries the same `EditorView` lock-in.** A CM6 keymap binding's `run` is
   `(view: EditorView) => boolean` — a keymap slot hands the consumer an `EditorView` just as
   `extensions[]` does. It is only "more declarative" if we invent our own command vocabulary to
   replace the handler signature, and there is **no demand** to justify that surface.
2. **A precedence hazard that is visible in the code.** `blockquoteKeymap` and `slashCommand` are
   `Prec.highest` _on purpose_ (`create-editor.ts`: blockquote Enter/Tab must beat `markdownKeymap`,
   and yield to the slash menu). A consumer keymap injected without that precedence reasoning would
   silently break Enter/Tab behavior — a support burden we would own after the freeze.

If a keymap need turns out to be real, the right shape is a _declarative_ command slot designed then,
under its own ADR — not a raw CM6 keymap blessed now.

## Consequences

- **The 1.0-frozen `EditorOptions` surface stays declarative and CM6-free.** No public type names a
  CodeMirror internal; portability and the invariants stay defensible (ADR-0012 decision 2 holds
  unbroken).
- **Raw access remains available but explicitly unsafe.** Power users keep `getView()` and
  post-construction reconfiguration (`StateEffect.appendConfig` / compartments). The cost — no
  cross-version guarantee, and the consumer owns invariant-breakage — is the deliberate price of the
  raw door, unchanged by this decision.
- **The concrete needs move, not vanish.** #498–#501 are the blessed channels for the behaviors a raw
  slot would have served; none of them is blocked on this decision (#505).
- **The door is left ajar, narrowly.** A future declarative slot (a command vocabulary, a
  `theme?: Extension` append — already noted as a deliberate scope-cut in `DECISIONS.md`) can be
  added on a `0.x` minor before the freeze if demand is observed. What this ADR forecloses for 1.0 is
  only the _raw_, `EditorView`-exposing form.

This ADR establishes no new code surface, so it does not add a public-API bullet; it **reaffirms and
extends** the existing "Consumer config ≠ plugin API" constraint in `DECISIONS.md` from _runtime_
plugins to _build-time raw injection_.
