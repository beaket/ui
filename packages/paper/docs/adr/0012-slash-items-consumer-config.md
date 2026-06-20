# 0012 — Slash items are opened through consumer config — a declarative contract, transformer override, and a separation of privileged built-ins

- **Status:** Accepted
- **Date:** 2026-06-16
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Slash items are opened through consumer config — a declarative contract, transformer override, and a separation of privileged built-ins

## Context

This started from "let's make what the slash command can do (built-in items included) extensible from the perspective of the _developer who uses this editor_." It soon became clear that this **brushes up against a scope line we have already codified**.

- The **Extension** definition in `CONTEXT.md`: "for the developer's internal modularity — **an external plugin API or end-user customization is out of scope**." The design-clarification log likewise nails down "an externally public API is out of scope."
- On the other hand, the **"consumer delegation"** of ADR-0011 and ADR-0007 (the embedding app injects policy via an `onInsertImage` callback) is _explicitly blessed_.

→ The request straddles two boundary lines. Distinguishing the two is the heart of this ADR.

|                                       | Actor                                                           | Timing                          | Stance                                      |
| ------------------------------------- | --------------------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| **A. consumer config**                | The developer embedding the editor                              | Build time, via `EditorOptions` | ✅ Blessed (same family as `onInsertImage`) |
| **B. External plugin API / end user** | Third parties, runtime registration, a user's personal settings | Runtime                         | ❌ Out of scope by the codified line        |

## Decision 1 — Open A (consumer config) only. Do not open B

Slash-item injection is received **once at build time** through `EditorOptions.slashItems`. It travels the same channel and belongs to the same family as `onInsertImage`. We build no runtime registration API, no third-party plugin registry, and no end-user customization UI — those remain out of scope (the CONTEXT Extension definition).

Rationale: this is the natural extension of the "consumer delegation" philosophy, and it is the lightest. The internal carrier is already a CM6 Facet (`slashItemsFacet`), but there is **a single provider** (the result `slashCommand` resolves). Multi-extension contribution (several extensions each emitting items into the same facet) is structurally open, since a facet can already combine multiple providers; but _exposing_ that publicly is deferred until real demand is observed — we do not open it speculatively now.

## Decision 2 — The public contract is **declarative**. Never expose `EditorView`

The point hardest to reverse is lock-in in the public API. The existing internal `SlashItem.after?: (view: EditorView, from) => void` exposes CM6's `EditorView`. Making that _public_ would ① turn CM6 into a permanent public dependency, working against portability, and ② let a consumer's `after` **break core invariants** such as the IME composing guard (ADR-0004) and the hiding of table structural syntax (ADR-0002).

The public type holds only declarative fields:

```ts
interface SlashItemSpec {
  id?: string; // A stable ID held only by built-ins. Consumer items omit it
  label: string;
  keywords?: string; // Filter aliases (English, etc.). Defaults to '' when absent
  insert: string; // A markdown string — rides directly on the "single source of truth = markdown" principle
  cursorOffset?: number;
}
```

The crucial point is that `insert` is a markdown string — the inserted result _is_ the source text, so no separate model arises (this respects the CONTEXT core rule).

## Decision 3 — Privileged built-ins are separated out by ID (the table's `activateCell`)

The "table" must, after insertion, enter editing of its first cell via `activateCell` (which depends on `EditorView`) — a **privileged action** that a declarative `insert` alone cannot express. We need a transformer to be able to reorder or exclude the table without that action being exposed.

The solution: **key an internal behavior registry by `id`.**

```ts
const BUILTIN_BEHAVIORS: Record<string, (view, from) => void> = {
  table: (view, from) => activateCell(...),
}
```

- `defaultSlashItems` exposes the table declaratively, as `{ id: 'table', label: 'Table', insert: TABLE_2X2, ... }`.
- At final resolution, the registry is looked up by the spec's `id`, and `after` is **reattached internally**. If a transformer keeps the `id:'table'` spec, the behavior survives; if it drops it, the behavior disappears.
- A consumer's own items have no `id` (or an ID not in the registry) → purely declarative, with no privileged action. That is, a consumer can work with the table without ever touching `EditorView`.

## Decision 4 — For override, make the transformer first-class; a flat array is complete replacement

```ts
type SlashItemsConfig =
  | SlashItemSpec[] // complete replacement (only their own items)
  | ((defaults: SlashItemSpec[]) => SlashItemSpec[]); // derive from defaults (recommended)
```

We export `defaultSlashItems` so cherry-picking is possible. Because the transformer returns the final array directly, **display order = array order** — we add no separate `priority` field (once the transformer states the order explicitly, `priority` becomes unused chrome, working against lightness). A flat array is taken as complete replacement, which is the most intuitive reading of "this is the entirety of my items."

## Decision 5 — Keep the menu UI minimal. Add only overflow protection

Even as items grow, the visual language stays as it is today (label-centric, porcelain overlay, ADR-0009). We add no section dividers, icons, or descriptive text (lightness). The one exception: against the case where items overflow the viewport, we add only a `max-height` plus vertical scroll — this is not adding chrome but a robustness measure against overflow, and it is invisible when there are few items.

## Alternatives and rejections

- **External plugin API / runtime registration (level B)** — directly reverses the CONTEXT Extension definition. It grows the public surface with no real demand. Rejected (decision 1).
- **A public `after(view)` callback** — permanently exposes `EditorView` and risks destroying core invariants. Rejected (decision 2). The privileged action is replaced by the ID registry instead (decision 3).
- **A `priority` field for order control** — the transformer already expresses order through array order. Unused chrome. Rejected (decision 4). To be revisited if and when we later open facet-based multi-extension contribution.
- **A `{ items, mode: 'append'|'replace' }` mode object** — the transformer expresses append/replace/reorder/exclude through a single API, so a mode branch is unnecessary. The two shapes "flat array = replacement" plus "function = derivation" are fewer concepts. Rejected.

## Implementation notes (CJK first-class / testing)

- Item injection does not change the decoration or DOM-recompute path — the composing guard contract (ADR-0004) is maintained by the existing `SlashMenu` unchanged (open/close/filter deferred while composing).
- **Deterministic contract test (ADR-0005):** spec → internal-item resolution, transformer application, `id` → behavior reattachment, order preservation, and filter matching are unit-tested under jsdom (coordinate-independent) through the pure function `resolveSlashItems`. red → green.
- Coordinate-dependent concerns (menu position, scroll overflow) cannot run under jsdom → verified in the 5173 browser.
