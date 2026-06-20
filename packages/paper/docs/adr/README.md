# Architecture Decision Records — `@beaket/paper`

This directory is the **append-only decision log** for the `@beaket/paper` package. Each file
records one architectural decision: the context, the choice, the alternatives weighed, and the
consequences. The code cites these records by number (`ADR-0014`); a citation must always resolve to
a file here.

`DECISIONS.md` (one level up) is the **curated index** — the distilled, load-bearing summary that
links into these ADRs. It is _not_ a 1:1 mirror of this directory (see "DECISIONS.md" below).

> Scope: these ADRs are **not published to npm** (`@beaket/paper` ships `files: ["dist"]`), but this
> repository is **public**. Write them for an outside reader — explain reasoning without disparaging
> named competitors (factual model-naming such as "an Obsidian-style live preview" is fine).

## When does a change need an ADR?

**ADRs are for decisions, not for changes.** The bar is high on purpose — a log diluted with
"fixed a bug" entries stops being a signal.

| Change                                                                                              | Record                                 |
| --------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Routine bug fix or perf tweak                                                                       | **Changeset only** (no ADR)            |
| A change that picks among alternatives, changes a load-bearing approach, or **revises a prior ADR** | **ADR** (new or amendment) + changeset |
| New public API / behavior that future work must honor                                               | **ADR** + changeset                    |

If you are unsure, you almost certainly need only a changeset.

### Every change still records _why_ — in the changeset

The ~90% of changes that don't clear the ADR bar still owe the reader a reason. **The changeset body
must state the root cause, not just the symptom** — "memoized the decoration build; it recomputed on
every selection change" beats "fixed lag". That is where the "why it changed" lives for routine work;
the ADR log is reserved for "why the design is shaped this way".

## Numbering

- Sequential, zero-padded, **append-only**. The next ADR is the highest existing number + 1.
- **Never renumber or delete** an ADR. A decision that no longer holds is _superseded_ or _amended_,
  not removed — the history is the point.
- Filenames: `NNNN-kebab-case-title.md`. Keep the slug stable once code cites it.

## Lifecycle

Every ADR starts with this header block, then a `---` divider, then `# Title` and the body:

```markdown
# NNNN — Title

- **Status:** Accepted
- **Date:** YYYY-MM-DD
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---
```

`Status` is one of: **Accepted**, **Amended** (still in force, but carries a later amendment),
**Superseded** (replaced by a newer ADR).

### Amend vs. supersede

- **Amend** — the decision still holds but a detail changed (a rename, a loosened invariant, a
  shipped deferral). Keep the historical body intact and **append a dated section** to the same file:

  ```markdown
  ## Amendment (YYYY-MM-DD, #PR) — short title

  What changed and why. The body above is historical.
  ```

  Set the header `Status: Amended`. Do **not** rewrite the original prose — the amendment is the diff.

- **Supersede** — the decision is replaced. Write a **new ADR** that records the new decision with
  `Supersedes: NNNN`, and flip the old ADR's header to `Status: Superseded` / `Superseded-by: MMMM`.
  Leave the old body in place.

## DECISIONS.md (the curated index)

`DECISIONS.md` summarizes only the **load-bearing** decisions — the ones that constrain future work —
and links to the full ADRs. Maintenance rule:

- A new ADR updates `DECISIONS.md` **only if** it establishes or changes a constraint future work
  must honor. A narrow decision-ADR (e.g. "chose library X") can stand alone.
- When an ADR is amended or superseded in a way that changes a load-bearing constraint, update the
  corresponding `DECISIONS.md` bullet and its link.

Keep it distilled. If `DECISIONS.md` grows one bullet per ADR, it has stopped being an index.

## Citing ADRs from code

- Cite by number: `ADR-0014`. For a sub-point of an ADR that enumerates decisions, `ADR-0014 decision 6`.
- Every `ADR-NNNN` mentioned in `packages/paper/src/**` must resolve to a file here. This is
  **enforced in CI** (`scripts/check-adr-refs.mjs`) — a dangling reference fails the build, which is
  what keeps this log from rotting back into the broken state it started in.

## Writing a new ADR

1. Pick the next number; create `NNNN-kebab-title.md` with the header block above (`Status: Accepted`,
   today's date, `#PR` once you have it).
2. Body, in prose: **Context** (the forces), **Decision** (what and why, alternatives weighed),
   **Consequences** (what this commits us to). Fidelity over brevity.
3. If it changes a load-bearing constraint, update `DECISIONS.md`.
4. Add the changeset for the code change that motivated it.
