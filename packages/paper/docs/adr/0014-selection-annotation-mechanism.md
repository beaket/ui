# 0014 — Selection-based annotations/actions: mechanism only, policy delegated to the consumer; anchor = quote + source offset

- **Status:** Amended
- **Date:** 2026-06-17
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Selection-based annotations/actions — mechanism only, policy delegated to the consumer. anchor = quote + offset (source)

## Status

**Design decision (implementation-led).** This is the direction settled during a grilling session. The first-priority consumer is `beaket` (github.com/beaket) — we measured its two real "selection → further processing" patterns there (quote-pinned comments = annotation, and the Decision Trail) and used them as the design rationale.

**Implementation order (settled 2026-06-17, ADR-0013):** B (React wrapper / package boundary) → **A (the `createAnchor`/`resolveAnchor` pure functions of this ADR, red→green)** → C (porcelain). The anchor capabilities are exposed not as ref methods but as **React props** (`highlights` / `activeHighlightId` / `onHighlightStatusChange` / `onHighlightClick` / `onSelect`), while the vanilla core uses the `createAnchor`/`resolveAnchor` function exports. A attaches on top of the surface that B establishes.

## Context

Because `beaket`'s editor is a **plain textarea**, it implemented "selection → comment/trail" by hand in a _separately rendered HTML view_, using `window.getSelection()` + plain-text offsets + fuzzy text re-anchoring (`trace-content.tsx`, `quote-highlights.ts`). We have a **Live Preview CodeMirror** — the editing surface and the viewing surface are one and the same — so if we model the same pattern natively, most of that effort disappears (selection = source position, highlight = mark decoration, in-session tracking = `mapPos`, overlay = `coordsAtPos`). One decisive difference, though: beaket anchors to the _rendered plain text_, whereas **we anchor to the markdown source** (CONTEXT: the single source of truth = markdown).

## Decision 1 — Model B: the editor is mechanism, the consumer is policy

The **mechanism** the editor provides: ① it reports a selection in **source coordinates** (`onSelect` / `getSelection(): {from,to,text}`), ② it **renders the consumer-supplied anchor list as highlight decorations**, and ③ it reports highlight status/clicks. _What it does_ (comment or trail, server calls, panel UI, orphaned handling) is entirely **consumer policy**.

This is a continuation of the "mechanism only, policy delegated to the consumer" philosophy of ADR-0011/0007 — just as `onInsertImage` meant "insertion is the editor's job, storage is the consumer's," here "reporting the selection, rendering highlights, and re-anchoring is the editor; the comment/trail/server/panel is the consumer."

**Rejected alternative — leave it all to the `getView()` escape hatch:** the consumer would have to deal directly with CM6 decorations, mapPos, IME guarding, and coords. Re-exposing the CM6 complexity we just hid, at the single hardest feature, is a self-contradiction of portability. There is a real demand (beaket), so we make it a first-class mechanism (it passes the "reason to add it" bar of the lightness principle).

## Decision 2 — Anchor format = quote (source text) + source offset (option B)

```ts
interface Anchor {
  quote: string; // markdown source substring — primary key (end = offset + quote.length)
  offset: number; // source offset — a hint for picking the nearest candidate + bounding the fuzzy search range
  prefix?: string; // reserved only. Filled when we go to C (context anchor) — unused for now
  suffix?: string; // reserved only.
}
```

- **During a session**, CM6 `mapPos` follows the anchor exactly, so fuzzy matching is unnecessary. It is **only on save/reload** that we re-resolve via quote + offset.
- The re-resolution algorithm is **ported from beaket's `quote-highlights.ts`, adapted to the source basis**: exact match (candidate closest to offset) → on failure, ±radius bounded fuzzy Levenshtein (approximate) → still failing, orphaned.
- **Pure source offset alone (option A) rejected:** inserting even a single character ahead throws everything off, with no way to detect or recover. That is why the text is the primary key.
- **prefix/suffix context (option C) deferred:** it only beats B when "short, repeated text" coincides with "frequent edits." We won't write the matching code until we have observed real orphan rates (lightness; an ADR-0011-style deferral). But we put the optional slots in the type from the start, so that **B→C is a backward-compatible extension.**

## Decision 3 — Anchor capture = a pure source slice. Handling hidden syntax

`createAnchor(view, from, to) → { quote: view.state.sliceDoc(from, to), offset: from }`. It does **not** normalize — since we match the quote _source↔source_, the quote must also be source (stripping markers would break matching). The exact opposite of beaket anchoring to rendered plain text; because the source is our truth, this is simpler and more consistent.

Confirmed hiding mechanisms (measured in our own code):

| Target                               | Method                                     | Selectable                                             |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------------ |
| Inline/block syntax (`**`, `#`, `>`) | `Decoration.replace({})`, **not atomic**   | Yes. The source range may include hidden markers       |
| Tables                               | `replace({widget,block})` + `atomicRanges` | Atomic in the main view; cells are subviews (ADR-0003) |
| Images                               | `replace({widget})` + atomic               | The whole block only                                   |

- We **snap a selection endpoint out of a hidden marker.** Because these are not atomic, an endpoint can land between the `**` pair, producing a messy quote like `*bold**`. Snapping to the token boundary keeps the quote clean (panel preview). The saved format is left untouched.

## Decision 4 — v1 highlight scope = body text + inline styles only

Body / bold / italic / code / links: ✅ (a source-range mark decoration → only the visible characters get colored, and hidden markers are zero-width so there is no smearing). **Inside table cells and inside images: out of scope for v1** (atomic / subview, so the coordinate systems differ). We document this as a limitation, and if it becomes necessary, we follow up with "annotate the whole block" (an ADR-0011-style resumption condition).

## Decision 5 — Resolution result = three states per anchor, exposed as a single status map

`resolveAnchor` returns one of three states per anchor: `exact` / `approximate` / `orphaned` (not collapsed into two — approximate means "roughly right, low confidence," so the panel UX should differ). React exposure:

```tsx
<BeaketEditor
  highlights={[{ id, anchor }]}            // input: id is the consumer's, anchor is the editor format
  activeHighlightId={hoveredOrSelectedId}  // hover/selection sync (declarative)
  onHighlightStatusChange={(m: Map<id, 'exact'|'approximate'|'orphaned'>) => …}
  onHighlightClick={(id) => …}
  onSelect={(sel) => …}                    // sel = { text, anchor, rect (screen coords) }
/>
```

- The output is a **single status map**. beaket's split callbacks (`onOrphanedIdsChange` / `onApproximateIdsChange`) are a relic of the textarea era — a single map is more general and extensible (the signature stays fixed even as the kinds of status grow).
- Hover/selection is a **declarative `activeHighlightId` prop** rather than an imperative DOM toggle.
- Status changes mostly **on load** (saved copy ↔ current doc) and **on delete** (the anchor text is removed); during a session, mapPos keeps it almost always exact.

## Decision 6 — The floating action affordance is drawn by the consumer

The button(s) that appear on selection (comment / Decision Trail / etc.) are **drawn by the consumer**. The editor only gives "selected + screen position (rect)" via `onSelect` (the consumer cannot compute coordinates, so that is the editor's responsibility). The only UI the editor draws directly is the **highlight**. Rationale: beaket has **two kinds** of selection button (comment, trail), which a fixed button could not accommodate = Model B (delegated policy) as-is.

## Decision 7 — Ownership and versioning of the anchor type

The editor **owns and provides** the `Anchor` type plus `createAnchor`/`resolveAnchor`. The consumer only **persists the anchor as opaque JSON** (server/DB) without looking inside (isomorphic to `onInsertImage` exchanging only a URL). Evolution is **additive optional slots only** (prefix/suffix already reserved) → old saved copies never break. We **do not stamp a version number now** (add `v` if it becomes necessary; absence = v1). `Anchor` is pure JSON (strings and numbers only).

## Implementation notes (CJK first-class / testing)

- **IME invariant:** highlight decoration recomputation, status computation, and `onSelect` firing are held during composition and resume after the docChange settles (ADR-0004). Widget `eq()` keeps the DOM unchanged during composition.
- **Deterministic contract tests (ADR-0005):** `createAnchor`, `resolveAnchor` (three states), the source slice, the snap, and the re-resolution algorithm are coordinate-independent pure functions, unit-tested under jsdom. red→green.
- **Coordinate-dependent (browser-verified):** `onSelect`'s rect, highlight decoration rendering, hover/selection visual sync, and selection snapping over hidden syntax. Measured against the running app at 5173.

## Implemented — Step A: anchor pure functions (2026-06-17)

`src/editor/anchor.ts` (+ `anchor.test.ts`, 14 cases red→green). The core barrel (`src/index.ts`) exports `createAnchor`/`resolveAnchor` plus the types (`Anchor`/`AnchorStatus`/`ResolvedAnchor`). 173 tests green, the core kept at React-0 closure. **This step is pure functions only** — the props/decoration surface is a separate step (below).

**The re-resolution algorithm = a port of beaket's `quote-highlights.ts` (per decision 2).** We checked the strategy and tuning constants in the prototype's local `quote-highlights.ts` and carried them over (not invented). The ported constants are named (to be tuned after observing real orphan rates): `FUZZY_RADIUS_FLOOR=120`, `FUZZY_MIN_QUOTE_LEN=12`, `FUZZY_MAX_RATIO=0.25`, window lengths `[qLen, 0.8·qLen, 1.2·qLen]`, ceiling-based early-exit Levenshtein.

**Source-basis adaptation (the ADR's "port, not copy" — rendered plain text → source coordinates):**

- The HTML / flat-text / `stripTags` / `flatToHtml` / `<br>` normalization and tag-straddle defenses are **all removed**. Because it is source↔source, `doc.indexOf` / `doc.slice` work directly.
- Exact matching picks, among all occurrences of the quote, **the one closest to offset** (beaket's closest-match, on the source).
- **Short quotes (< 12 chars) go straight to orphaned.** beaket did a bounded `indexOf` for short quotes, but that was because it used strict regex (whitespace-normalized), unlike here. Our exact matching is over plain text, so if global exact matching fails, bounded exact matching is guaranteed to fail too → approximating a short quote is structurally impossible. Rather than dead code, we make it an explicit orphaned.

**`createAnchor` takes an `EditorState` (refined from decision 3's `view`).** It only needs sliceDoc + syntaxTree (for the subsequent snap) → it works and tests without a mounted view. View consumers pass `view.state`. Both backward compatibility and testability win.

**`ResolvedAnchor` = a discriminated union.** `{status:'exact'|'approximate', from, to} | {status:'orphaned'}` — since the decoration layer uses the position, status comes together with from/to, but orphaned having no position is enforced by the type. We never collapse the three states into two (decision 5).

### Deferred from Step A (next step = the props/decoration surface)

- **Selection-endpoint snapping (the back half of decision 3):** if an endpoint falls inside a hidden marker (EmphasisMark/CodeMark/LinkMark/URL), snap to the token boundary → a clean quote. **Rationale for deferring:** ① the advisor classified it as a "refinement that can be deferred," ② the value (a clean quote for the panel preview) manifests at the decoration/panel surface, ③ it depends on syntaxTree and coordinates, so browser verification is natural, ④ since resolveAnchor is source↔source, exact matching does not break even with a partial marker = snapping is purely cosmetic, capture-time only, and backward compatible (old saved copies unchanged). It will be implemented with syntaxTree at the surface step and verified at 5173.
- **The React props surface:** `highlights` (mark decoration rendering), `activeHighlightId`, `onHighlightStatusChange`, `onHighlightClick`, `onSelect` (rect). Because it is coordinate-dependent, browser-verified, and roughly Step-B in size, we split it into a **separate step that was nowhere in the named order (B→A→C)** (distinct from C = porcelain). The decorations ride the IME guard (`guardedDecorations`), and `onSelect` is held during composition and fires after settle (the IME invariant of the decisions).

## Implemented — anchor surface step: snap + decoration + onSelect (2026-06-17)

On top of Step A we layered part of the surface. **Scoped to exactly the three the user specified (snap + decoration + onSelect)** — `activeHighlightId` and `onHighlightClick` are a separate interaction surface, deferred to the next step (below). 194 tests green, the core kept at React-0 closure, and 5173 browser verification done.

**S1 — Selection-endpoint snapping (`createAnchor`, `anchor.ts`).** If an endpoint falls _strictly_ inside a hidden marker (EmphasisMark/CodeMark/StrikethroughMark/LinkMark/URL), it snaps **toward the visible content** (start → marker.to, end → marker.from) to exclude the partial marker → a clean `bold` instead of `*bold**`. **Snap direction settled (the advisor called this "a detail you have to see with your eyes"):** pinned with jsdom tests + measured at 5173 by selecting into the inside of `**Markdown**`'s markers and getting `quote='Markdown'`. An ordinary visible selection lands on token boundaries, so it is unchanged. If the selection is entirely inside a marker, it collapses to an empty anchor.

**S2 — Highlight layer (`extensions/highlightLayer.ts`).** Adopted the advisor's design: **StateField + effect, no guard fork.**

- The field tracks positions every transaction with `decos.map(tr.changes)` (mapPos, almost always exact during a session), and **re-resolution (`resolveAnchor`) happens only in `setHighlightsEffect`.** Holding mark decorations in the field gives a double exemption from the line-break replace exception → the renderer needs no `composing` check (IME safety for free).
- The only place an IME guard is needed = the effect dispatch that _triggers re-resolution_ → `createHighlightController` holds during composition (isomorphic to valueController).
- status produces a new Map instance only on re-resolution → `updateListener` emits `onHighlightStatusChange` via reference comparison (updateListener runs after apply, so calling directly is safe = no microtask needed, advisor-confirmed). **docChange does not re-emit status** (the main change points = load / setHighlights, decision 5). Re-emitting orphans caused by in-session deletion is deferred (rare, and load re-resolution is the main path).
- **Inside table cells / images = out of scope for v1 (decision 4):** in the 5173 measurement, a bold/italic anchor in a table cell has status exact, but because it falls in the atomic table widget range, **the decoration is not drawn + there is no crash** (graceful skip). Pinned with a jsdom no-throw regression test.
- Smearing check (an advisor concern): at 5173, highlights over body inline bold (`**Markdown**`), links (`[docs]`), and code (`` `pnpm dev` ``) contain **only the visible text** (the hidden markers confirmed zero-width).

**S3 — Selection reporting (`extensions/selectionNotifier.ts`).** Same IME guard as `changeNotifier`. A non-empty selection → `{ text: the snapped quote, anchor: createAnchor(snap), rect: coordsAtPos(head) }`; an empty selection → `onSelect(null)` (it also fires on every cursor move — the consumer hides the affordance). `text = anchor.quote` for a single truth (a clean preview with no partial markers). The real rect coordinates were measured at 5173.

**Wiring / boundaries.** The core `EditorOptions` gets `onHighlightStatusChange` / `onSelect`, and `editorExtensions` gets `highlightLayer` / `selectionNotifier`. The React `<BeaketEditor>` gets `highlights` (a live prop → controller, held during composition), `onHighlightStatusChange`, and `onSelect` (the callbacks kept current via refs). Barrel: the core exports `setHighlightsEffect` / `HighlightInput` / `SelectionInfo`, re-exposed by React. The core still has zero React imports.

### Deferred from this step (next = the interaction surface)

- **`activeHighlightId`** (declarative hover/selection visual sync) and **`onHighlightClick`** (reporting highlight clicks). Not part of the set the user specified, and a separate interaction surface (active-class toggle + DOM click mapping), so split off. The decorations already carry `data-highlight-id`, so the surface for click mapping / active toggling is ready.
- **Re-emitting orphan status on in-session deletion** and **prefix/suffix context anchors (option C):** deferred until real orphan rates are observed (decision 2 · ADR-0011-style).

## Implemented — interaction surface: activeHighlightId + onHighlightClick (2026-06-17)

The last two of decision 5's five props. With these the annotation surface closes (what remains is C + the deferred items). 201 tests green, the core kept at React-0.

**Position truth = keep `decorations.map()`, re-issue only the class (avoiding the trap the advisor caught).** A manual `mapPos`-resolved array would take on a boundary bias and cause **a regression the existing tests can't catch** (the S2 tests insert _before_ a highlight → identical under any assoc). So the field still tracks positions with `decorations.map(tr.changes)` (CM-accurate non-inclusive bias for free), and on an active change it **reads `data-highlight-id` + `from/to` from the currently-mapped decoration set and re-issues only the class** (`entriesOf` → `marksFrom`, no re-resolution). The common path (typing) stays the cheap single `.map()`. **Boundary regression tests added:** input right after a highlight does not grow the range, while input inside it is tracked.

**Derive the decorations only once per transaction.** If `setHighlights` + `setActive` arrive in the same tr, they build in one pass with the final activeId. The controller **coalesces the items held during composition (highlights · active) into a single `dispatch`** to prevent a stale active. `setActiveHighlight` is also a transaction, so it is held during composition (ADR-0004).

**active does not re-emit status.** The `statuses` Map is a new instance only on re-resolution (`setHighlights`) → reference comparison. active changes and docChange keep the same ref, so `onHighlightStatusChange` stays silent. Pinned with a regression test (the active analogue of the existing "docChange does not re-emit").

**`onHighlightClick` = a `click` domEventHandler** (not mousedown — it doesn't interfere with drag selection; pure reporting needing no guard; `return false` to allow cursor placement). The id is extracted with `closest('[data-highlight-id]')` (for overlapping highlights, the innermost wins, the v1 rule). Giving an orphaned / table-cell / nonexistent id as active is a no-op (no rendered range, so no class is applied, no throw) — pinned with a test.

**Consumer contract (recommended documented edges):** ① a click inside a highlight fires **both** `onHighlightClick(id)` and `onSelect(null)` (or `onSelect(info)` if it was a drag) — the consumer distinguishes by empty/non-empty selection. ② the callbacks come out of `updateListener` / DOM handlers, so do not dispatch synchronously inside them (defer by one tick).

**Verification status (done).** 16 jsdom tests (active class · null toggle · no-op · status non-re-emission · boundary · **a real `click` handler dispatch over a real CM span** · coalesce) + the real 5173 browser prop path: toggling `activeHighlightId` makes only the h1 active (background accent-sel 0.16 vs. non-active accent-weak 0.08 — visual distinction confirmed), toggling null removes it, and clicking a real span → `onHighlightClick(id)` reported. **One item remaining = confirming the new hold path (setActiveHighlight · coalesced flush) with a real physical-keyboard Korean IME** (verified only with synthetic events; left to a user spot-check — same as Step B and the surface step).

## Amendment (2026-06-21) — host component renamed `BeaketEditor` → `Paper`

The body above is historical and uses the prototype-era host name `<BeaketEditor>` and the camelCase file names `highlightLayer.ts` / `selectionNotifier.ts`. In the production package these have drifted:

- **Host component is now `<Paper>`** (PR #455 / v0.3.0). The five-prop anchor surface from decision 5 lives on `<Paper>` and is unchanged: `highlights`, `activeHighlightId`, `onHighlightStatusChange`, `onHighlightClick`, `onSelect` (see `src/react/paper.tsx`).
- **Extension files are kebab-cased:** `src/editor/extensions/highlight-layer.ts` and `src/editor/extensions/selection-notifier.ts`.

Everything the decisions turn on is intact in the current code:

- The `Anchor` type is still `quote` + `offset` with reserved `prefix` / `suffix` slots (`src/editor/anchor.ts`).
- The three-state resolution `exact` / `approximate` / `orphaned` (`AnchorStatus` / `ResolvedAnchor`) is unchanged.
- `createAnchor` / `resolveAnchor`, the ported tuning constants (`FUZZY_RADIUS_FLOOR` / `FUZZY_MIN_QUOTE_LEN` / `FUZZY_MAX_RATIO`), `setHighlightsEffect`, and the IME-held `createHighlightController` all match the body.

The "decision N" numbering is unchanged, so the citations elsewhere in the codebase (ADR-0014 decision 3/5/6/7) still resolve.
