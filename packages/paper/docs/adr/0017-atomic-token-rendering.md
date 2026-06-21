# 0017 — Atomic token rendering: a declarative `pattern → view` API, permanently atomic, layered over the markdown source

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Atomic token rendering: a declarative `pattern → view` API, permanently atomic, layered over the markdown source

## Context

Once a mention/reference is inserted — e.g. the `[@Grace Hopper](user:u_003)` an `@`-trigger produces
(#498/ADR-0016) — the markdown stays the single source of truth, but the rendered view should present
it as an **atomic token**: the caret steps over it rather than into it, one Backspace removes the whole
thing, and the consumer controls its label and styling. No API renders a consumer-defined pattern as an
atomic widget today. A consumer could only reach for the unsafe `getView()` hatch and hand-wire CM6
decorations + `atomicRanges`, owning the IME composing guard (invariant #1) by hand.

This is child ③ of the embedding/extensibility epic (#505), the **pair** of the trigger API (#498):
#498 _inserts_ the mention markdown, #499 _renders_ it atomically. It is a **decision** (`type:arch`):
it adds public API to the surface that **freezes at 1.0** (#480), and the atomicity model (cursor /
Backspace semantics, and the interaction with Live Preview syntax hiding) is load-bearing.

The relevant existing behavior: `inline-syntax-hiding.ts` already treats a markdown `Link` as Live
Preview — off-cursor it hides the `](url)` and shows only the link text; on-cursor it **reveals** the
raw `[text](url)`. So a mention link already renders as clean text — but it is _not_ atomic (the caret
enters it, Backspace deletes one char) and it _reveals_ its source when touched. #499 layers atomicity
and consumer-controlled, non-revealing rendering on top.

The decisions below were validated in a browser spike before being written, because two CM6 behaviors
are load-bearing and not settled by reading the docs (see Decision 3 and Decision 4).

## Decision 1 — Public surface: a declarative `tokens?: TokenSpec[]`, in the `slashItems`/`triggers` family

`EditorOptions` gains `tokens?: readonly TokenSpec[]` (and the `<Paper tokens>` prop) — build-time
consumer config, the same family as `slashItems`/`triggers`/`onInsertImage`.

```ts
interface TokenView {
  label: string; // text shown in place of the matched markdown
  className?: string; // optional class on the token span — a stable .cm-* styling hook
}

interface TokenSpec {
  pattern: RegExp; // the markdown to atomize, matched per line
  render: (match: RegExpMatchArray) => TokenView; // declarative — capture groups carry identity
}
```

The shape carries the same reasoning as ADR-0012 decision 2 / ADR-0016 — **the hardest-to-reverse
lock-in is a public type that names a CM6 internal or DOM node**, so none does:

- **No second document model.** `render` returns a declarative `TokenView`; the editor builds the
  token's DOM (`<span class="cm-token {className}">{label}</span>`). The matched markdown is never
  mutated to render — copy/serialize reads `view.state.doc` (ADR-0007), so a token **round-trips to
  plain markdown for free**. This is the `CONTEXT.md` core rule, held.
- **Identity rides the markdown, not a side channel.** Unlike `triggers` (where the picked item is an
  async, ephemeral object that needs a `data` passthrough), a token's identity is _already in the
  source text_ — the consumer recovers it from the pattern's own **capture groups** in `render`
  (`m[2]` is the user id in `[@…](user:<id>)`). No `data` field is added; that would duplicate what the
  markdown already carries.
- **Declarative rendering power, chosen deliberately.** `render` returns `{ label, className? }`, not a
  DOM node. The consumer styles the chip through `className` + CSS. A richer return (an `onClick`
  handler, or a raw `HTMLElement` for avatars/icons) was weighed and **deferred**: we are on `0.x`, so
  adding `onClick` later is a non-breaking minor, whereas exposing a DOM node on the frozen surface
  reverses the declarative/portable principle and is hard to take back. Start narrow.

### Slash filters; triggers delegate filtering; tokens scan the source

The three sibling APIs differ by where matching lives: the slash menu filters a static list; a trigger
delegates filtering to the consumer's `onQuery`; a token **scans the document text** for its `pattern`.
`render` is the per-match projection, the token analogue of `SlashItemSpec`/`TriggerItem`.

## Decision 2 — Permanently atomic; **no** reveal-on-cursor (it diverges from the Link Live-Preview rule, on purpose)

A registered token is rendered **always** — it does _not_ reveal its raw markdown when the caret
touches it (unlike the `Link` hiding in `inline-syntax-hiding.ts`, and unlike inline `**bold**`). This
is the whole point of "atomic": the caret cannot sit _inside_ the token, so there is nothing to reveal;
to change a token you delete it whole and re-insert. This matches the table widget's model (ADR-0002:
structure permanently hidden, never unfolds) rather than the inline reveal model. The token's
full-range replace widget takes precedence over the link's inner syntax-hide on the matched range
(wired _before_ `inlineSyntaxHiding` in `create-editor.ts`), so the two coexist without conflict — the
chip shows both off- and on-cursor, and inline-hiding simply contributes nothing for that range.

## Decision 3 — Mechanism: the IME-guarded `atomic` path of `guardedDecorations`; Backspace-deletes-whole is an explicit command

Decorations go through `guardedDecorations` (invariant #1), extended with an **opt-in, additive**
`{ atomic: true }` flag: it also exposes the _same_ guarded decoration set as
`EditorView.atomicRanges`. Reading the live plugin's set — rather than a second recompute — keeps
atomicity consistent with what is rendered, including the mapped set the guard holds during composition
(no divergence between "rendered here" and "atomic there"). The flag changes no existing caller.

Three CM6 facts, **confirmed in the spike**:

1. **Arrow step-over is free** from `atomicRanges`. The caret jumps across the token.
2. **Delete-whole is NOT free, and is needed from _both_ sides.** `atomicRanges`' own default on
   Backspace/Delete is to _skip_ (move the caret across), not delete — exactly the lesson the table
   encodes with its custom Backspace (`table-widget.ts`). So delete-whole is two explicit `Prec.high`
   commands: **Backspace** at a token's _trailing_ edge (the token is behind the caret — just after
   inserting, or clicking to its right) and **Delete** at its _leading_ edge (the token is ahead —
   where a click on the chip lands the caret, see fact 3). Each deletes the whole `[from,to]` in one
   stroke; the target lookup (`tokenAtEdge`) is pure and unit-tested.
3. **A click on the chip lands the caret at the token's _leading_ edge** (verified: collapsed
   selection at `from`). So the widget must _not_ set `ignoreEvent()` to `true` — that would discard
   the click and leave the caret elsewhere, with nothing to delete. It returns `false` (like
   `image-widget`); `atomicRanges`, not that flag, is what keeps the caret out of the token's interior.
   With the click landing at `from`, **Delete** (fact 2) is what removes a clicked-on token.

## Decision 4 — Correctness: never atomize inside code; match per line with a fresh regex

A raw regex would match `[@x](user:y)` typed _inside_ a code fence or inline code — atomizing literal
sample text. That is a 1.0 correctness bug, so matching consults the **syntax tree** and skips ranges
inside code nodes (`InlineCode`/`FencedCode`/`CodeText`/…), the same reason `inline-syntax-hiding` only
chips `InlineCode`. Matching is per line with a **fresh `RegExp` per line** (no cross-line `lastIndex`
statefulness), and overlapping matches are resolved left-to-right so the decoration set never holds two
conflicting replace ranges. `findTokenMatches` is the pure, jsdom contract-test seam (ADR-0005);
geometry — widget DOM, placement, the live atomic cursor/Backspace feel — is carved out for the browser
(invariant #4) and was verified in the playground.

## Alternatives and rejections

- **`render → HTMLElement` (consumer-owned DOM)** — most powerful (avatars, icons), but exposes a DOM
  node on the 1.0-frozen surface, reversing the declarative/portable principle (ADR-0012 decision 2,
  ADR-0016). Rejected for 1.0; revisitable on a `0.x` minor if real demand appears.
- **`onClick` on the token** — a clean, _additive_ future minor; deferred now (no demand yet, lightness).
- **A `data` identity channel** (as `triggers` has) — redundant: a token's identity is in the markdown,
  recovered from capture groups. Rejected.
- **Reveal-on-cursor (reuse the Link Live-Preview rule)** — contradicts atomicity ("caret steps over,
  not into"). Rejected (decision 2); the token is permanently atomic like the table.
- **A separate StateField for atomicRanges** (the table's pattern) — heavier; only needed if
  atomicRanges-from-plugin read stale during cursor motion. The spike showed it consistent, so the
  lighter `guardedDecorations {atomic}` path is used. (The StateField remains the fallback if a stale
  read ever surfaces.)

## Consequences

- **The 1.0-frozen `EditorOptions` surface gains a declarative, CM6/DOM-free token API.** No public type
  names a CodeMirror internal or a DOM node; ADR-0012 decision 2 and ADR-0016 hold. `@`/`[[`
  autocomplete (#498) + atomic rendering (#499) are now the complete mention pair without `getView()`.
- **`guardedDecorations` grows one opt-in `{atomic}` capability**, shared by any future atomic widget;
  the IME-deferral contract stays in one place. Held to the same regression gate as #498 — full suite
  green, every existing decoration/IME test unchanged.
- **The atomicity model is documented and verified**, not assumed: arrow free, Backspace explicit,
  no-reveal, code-skipped, copy round-trips.
- **Deferred, not foreclosed:** `onClick`, raw-DOM rendering, live reconfiguration of `tokens` (fixed at
  creation today, like `slashItems`/`triggers`), and multi-line token patterns (`\S`-free, single-line
  for v1).
- Updates the **load-bearing** "mechanism-in-editor / policy-in-consumer" constraint in `DECISIONS.md`
  (the declarative consumer-config family now includes `tokens`), so that bullet is updated.
