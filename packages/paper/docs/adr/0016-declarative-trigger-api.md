# 0016 — Declarative `@` / `[[` trigger API: generalize the slash menu's engine, keep the public surface declarative and `EditorView`-free

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Declarative `@` / `[[` trigger API: generalize the slash menu's engine, keep the public surface declarative and `EditorView`-free

## Context

The slash menu (`slash-command.ts`) hardcodes its triggers — `/` plus the CJK alternates `、 ； ／` in
`TRIGGER_RE` — and resolves its items synchronously from a static list. A consumer who wants **another**
trigger — `@` mentions, `[[` wikilinks — backed by their own, often **asynchronous** suggestion source
has no blessed path. Today they would reimplement CM6 autocomplete through the explicitly-unsafe
`getView()` escape hatch (ADR-0013 decision 3), owning the IME composing guard (invariant #1) by hand.

This is child ② of the embedding/extensibility epic (#505) and a **decision** (`type:arch`): it adds
public API to the surface that **freezes at 1.0** (#480), and it lands exactly on the boundary that
`CONTEXT.md` invariant #3, ADR-0012, and ADR-0015 draw. ADR-0015 just **declined** a raw
`extensions[]` injection slot (#497, ①) precisely so that concrete needs route to declarative sibling
APIs like this one — so this ADR is where that promise is paid.

Two questions to settle (per the issue): **(1)** generalize the slash mechanism or build a separate
autocomplete extension; **(2)** how custom triggers compose with `/`. Plus the shape of the public
type, since it is the part that freezes.

## Decision 1 — Public surface: a declarative `triggers?: TriggerSpec[]`, in the `slashItems` family

`EditorOptions` gains `triggers?: readonly TriggerSpec[]` (and the matching `<Paper triggers>` prop) —
build-time consumer config, the same family and channel as `slashItems`/`onInsertImage` (ADR-0012
decision 1). No runtime registration, no plugin registry, no end-user UI; level B stays out of scope.

```ts
interface TriggerItem {
  label: string; // shown in the menu
  insert: string; // markdown inserted in place of trigger + query (single source of truth)
  cursorOffset?: number; // caret offset from insertion start; defaults to end of insertion
  data?: unknown; // opaque entity passthrough — handed back to onSelect, never read by the editor
}

interface TriggerSpec {
  trigger: string; // "@" | "[[" ...
  minQueryLength?: number; // default 0
  onQuery: (query: string) => TriggerItem[] | Promise<TriggerItem[]>; // sync or async source
  onSelect?: (item: TriggerItem) => void; // post-insertion notification
}
```

Three properties carry the same reasoning as ADR-0012 decision 2 — **the hardest-to-reverse lock-in
is a public type that names a CM6 internal**, so none does:

- **Insertion is declarative.** Selecting an item inserts a **markdown string** (`insert`), exactly as
  `SlashItemSpec.insert` does — the inserted result _is_ the source text, so no second model arises.
  Rendering that inserted token as an **atomic chip** is the separate concern of #499 (③), deliberately
  out of scope here.
- **No `EditorView` is exposed**, anywhere — not on the item, not on `onQuery`, not on `onSelect`. The
  public surface stays CM6-free and portable, and a consumer cannot break the composing guard or the
  table invariants from it (the failure mode ADR-0015 guarded against, kept shut here).
- **`onSelect` earns its place** (lightness): `insert` already does the insertion, so a callback is not
  needed _to insert_. It is the consumer's only structured hook to learn **which entity** was picked —
  an `@mention` needs the user id, not the rendered text. The `data` passthrough makes that concrete:
  the consumer attaches its entity to the item in `onQuery`, and gets it back verbatim in `onSelect`.
  It fires **after** the dispatch and is IME-safe (the dispatch already settled).

### Slash filters; triggers delegate filtering

A deliberate asymmetry with `slashItems`: the slash menu filters a **static list** internally
(label/keywords `includes`). A trigger's source is the consumer's own — so `onQuery(query)` returns the
**already-filtered/ranked** list. The editor does not re-filter. This is why `TriggerItem` carries no
`keywords` field: matching is the source's job, not the menu's.

## Decision 2 — Mechanism: generalize the slash menu's engine; do not build a parallel one

The slash menu and the trigger menu share ~80% of their machinery — the menu DOM, the selected-index
state, keyboard navigation (Arrow/Enter/Tab/Escape), the porcelain overlay, the coordinate placement,
and the IME-deferred update gate. Only the **source** differs (slash = sync static list filtered
internally; trigger = async `onQuery`) plus trigger matching and the apply/dispatch.

- A **fully separate** extension would duplicate that engine — against lightness, and a second place
  for the IME-deferral contract to drift.
- A **merged mega-plugin** would force the slash menu's quirks (the CJK alternates `、；／`, the CJK
  `minQueryLength=1` rule, the privileged `after` registry of ADR-0012 decision 3, the line-split on a
  block `|` insert) into a general mold they don't belong in — over-generalization.

So we **extract the shared engine** (`extensions/menu-engine.ts`: `PopupMenu`, `menuKeyBindings` /
`menuKeymap`, `menuTheme`) and keep **both** the slash menu and the trigger menu as thin controllers
over it. Each controller owns its own matching, source resolution, and apply; the engine owns
everything visual and navigational. This is reversible and internal — no public-surface impact — which
is why it was decided here rather than round-tripped as a product decision.

**Regression gate (held):** the slash menu's _public_ surface is byte-stable — `slashItems`,
`defaultSlashItems`, `SlashItemSpec`, `SlashItemsConfig`, `resolveSlashItems`, `slashCommand`, the
`.cm-slash-menu` / `.cm-slash-selected` class hooks — and `slash-command.test.ts` passes **unchanged**.
The refactor is internal only.

## Decision 3 — Composition with `/`: coexist, one menu at a time, distinct triggers

The slash menu stays its own controller; the trigger menu is a second controller driving a second
`PopupMenu`. They coexist:

- **Only one menu is ever open.** Their triggers are distinct (`/` is reserved for the slash menu;
  consumers are documented not to reuse it), and `matchTrigger` returns at most one active trigger at
  the cursor, so two menus cannot open together.
- **The shared keymap routes to whichever is open.** Both menus bind Arrow/Enter/Tab/Escape at
  `Prec.highest`, but each binding is a no-op that returns `false` (the keypress falls through) unless
  _that_ controller's menu is open. So the not-open menu yields and the keys reach the open one — the
  same `whenOpen` pattern the slash menu already used, now factored into `menuKeyBindings`.
- `triggerMenu([])` (or no `triggers`) contributes **nothing** — a consumer who doesn't use it pays
  zero overhead. `composingWake` and `menuTheme` are shared `Extension` _instances_, so including them
  from both menus adds no duplicate handler or StyleModule (CM6 dedups by identity).

## Decision 4 — Async source: discard stale responses; re-check IME at resolve time

`onQuery` may be async, which the synchronous slash menu never had to handle. Three rules, with the
decision points pulled into **pure, jsdom-testable** functions (ADR-0005), mirroring how
`resolveSlashItems` is the slash menu's test seam:

1. **Stale-response discarding.** A generation counter bumps on every issued query and on every close.
   A resolved response opens the menu only if its generation is still the latest
   (`isResponseCurrent(issued, current)`) — so a slow earlier query never overwrites a faster later
   one, and a response that arrives after the menu closed is dropped.
2. **IME across the await.** `onQuery` is never issued during composition (the update gate defers,
   invariant #1), and `view.composing` is re-checked **when the promise resolves**, not only when it is
   issued.
3. **Matching is pure.** `matchTrigger(before, head, specs)` finds the active trigger
   (first-registered-wins) with a per-trigger regex (`escapeRegExp` for multi-char `[[`), keeping the
   slash menu's `(?:^|\s)` word boundary and `\S*` query.

## Alternatives and rejections

- **A separate parallel autocomplete extension** — duplicates the menu engine and the IME-deferral
  contract. Rejected (decision 2); the engine is extracted and shared instead.
- **A public `onQuery`/`onSelect` that receives `EditorView`** — reintroduces the exact CM6 lock-in
  ADR-0012 decision 2 and ADR-0015 closed; a consumer could break the composing guard. Rejected
  (decision 1); insertion is a declarative string and identity travels via the opaque `data`.
- **Re-filtering the source's results inside the menu** — the source already filters/ranks
  (`onQuery(query)`); re-filtering would fight async sources and duplicate intent. Rejected; hence no
  `keywords` on `TriggerItem`.
- **Rendering the inserted mention as an atomic token now** — that is #499 (③), a separate decision.
  Out of scope; insertion here is only the markdown string.
- **A spaces-in-query option** (`[[My Note]]`) — the `\S*` boundary stops the query at a space, so a
  v1 query is single-token (matching the slash menu). A per-trigger custom pattern / `allowSpaces` is a
  **deferred enhancement**, added on a cheap `0.x` minor if demand appears.

## Consequences

- **The 1.0-frozen `EditorOptions` surface gains a declarative, CM6-free API.** No public type names a
  CodeMirror internal; ADR-0012 decision 2 and ADR-0015 hold unbroken. `@`/`[[` autocomplete no longer
  requires the unsafe `getView()` hatch.
- **One menu engine, two thin controllers.** Future menu-like surfaces reuse `menu-engine.ts`; the
  IME-deferral contract lives in one place per controller, not duplicated.
- **The async path is contract-tested where it can be** (`matchTrigger`, `isResponseCurrent`) and
  **browser-verified where it can't** (menu position/open/apply — `coordsAtPos` is zero under jsdom,
  invariant #4).
- **Deferred, not foreclosed:** spaces-in-query, live reconfiguration of `triggers` (fixed at creation
  today, like `slashItems`), and grouped/sectioned trigger results. Atomic-token rendering is #499.
- Updates the **load-bearing** "mechanism-in-editor / policy-in-consumer" constraint in `DECISIONS.md`
  (the declarative consumer-config family now includes `triggers`), so that bullet is updated.
