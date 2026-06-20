# `@beaket/paper` — maintenance & improvement queue

How `@beaket/paper` is kept improving: a managed **queue** drained at a steady cadence, biased to
performance and bug fixes, with every change recording _why_. This is the operating manual for both
human maintainers and the scheduled maintenance agent.

See also: [`CONTEXT.md`](./CONTEXT.md) (what/where), [`DECISIONS.md`](./DECISIONS.md) (why),
[`adr/README.md`](./adr/README.md) (the ADR rule).

## The goal: drive to 1.0.0, then steady-state

The queue has a finish line. **1.0.0 is the deadline for all interface/breaking work** — breaking
changes are cheap on `0.x` minors now, expensive deliberate `major`s after. So pre-1.0 the primary
work is getting the interface right (human-driven); routine perf/bug work runs underneath.

Tracked by the **`1.0.0` milestone** and its exit criteria (all must-have):

1. Interface freeze + ADR
2. Zero P1/P2 bugs (and every `DECISIONS.md` "Deferred" item resolved or accepted-with-reason)
3. Perf targets met + measured
4. CJK/IME real-device verification

When the milestone is empty and the criteria are met → ship `1.0.0` (deliberate major,
`ALLOW_MAJOR=1`). After that the system flips to open-ended periodic maintenance, version-agnostic.

## Two tracks, one queue

```
STRATEGIC (human-steered, ~weekly)        TACTICAL (agent, queue-drain)
  architecture review ─┐                    pull ONE agent:ready item
  CONTEXT/DECISIONS upkeep ─┼─> file/refine ──>  fix (patch perf/bug)
  ADR decisions ───────┘    queue items          PR + changeset (+ ADR if it
                                                  crosses the bar) → human merges
                            weekly: human merges the Release PR → npm
```

- **Strategic** work (architecture, deepening, interface shaping) is **human-driven** and may be
  breaking on `0.x` minors. It feeds the queue and keeps the map (`CONTEXT.md`/`DECISIONS.md`/ADRs)
  current.
- **Tactical** work is **patch-only perf/bug in `packages/paper`**, drained one item at a time. It
  never invents work: an empty queue means a discovery pass that _files_ candidates, not a forced fix.
- "~3 a week" is a healthy **drain rate**, not a quota.

## The queue (GitHub issues)

Labels:

| Label              | Meaning                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `area:paper`       | Scopes the issue to this package.                                           |
| `bug` / `perf`     | The work type.                                                              |
| `agent:ready`      | **The gate** — vetted and eligible for the tactical agent to pick up.       |
| `p1` / `p2` / `p3` | Priority; the agent takes the highest-priority `agent:ready` first.         |
| `type:arch`        | Architectural/strategic — human-driven, **never** for the autonomous agent. |

## Definition of Ready (the `agent:ready` gate)

An issue may carry `agent:ready` only if **all** of these hold. The agent re-checks this on pickup;
if an item fails, it comments, removes `agent:ready`, and moves on — it does not fix blind.

- [ ] **Scoped to `packages/paper`** and labeled `bug` or `perf` (not `type:arch`).
- [ ] **Patch-sized & non-breaking** — a focused fix, no public API/behavior change. (Anything that
      would change `EditorOptions`, exports, or rendered behavior in a user-visible way is _not_
      ready — it is strategic, human work.)
- [ ] **Clear reproduction or evidence** — exact steps, input, or the code path; for perf, the hot
      path and why it's hot.
- [ ] **Suspected cause identified** — a concrete file/area and a hypothesis, not just a symptom.
- [ ] **Acceptance criteria** — what "fixed" looks like, and the regression test that will pin it
      (every bug is fixed red→green).
- [ ] **No open question** blocking the approach (if a decision is needed first, it's `type:arch`).

Issues that don't yet meet this stay unlabeled (or `bug`/`perf` only) for human triage. **Only a
human applies `agent:ready`** — discovery (by anyone, including the agent) files candidates; it does
not self-authorize them.

## The tactical agent's contract (Phase 4)

Each run, the scheduled agent:

1. Reads `CONTEXT.md` first.
2. Picks the highest-priority open `agent:ready` issue; verifies the Definition of Ready.
3. Branches, fixes red→green, runs `pnpm check:adr` + `pnpm test:editor` locally.
4. Adds a **`patch` changeset whose body states the root cause** (see "Recording why"); writes an
   ADR only if the change crosses the [ADR bar](./adr/README.md).
5. Opens a PR linking the issue and **stops**. It never merges; the human is the merge gate.
6. If no `agent:ready` item exists, it runs a short discovery pass and _files_ candidate issues
   (left for human `agent:ready` triage) — it does not force a fix.

## Weekly publish

Releases ride the standard Changesets bot: merged PRs accumulate in the open "Changes Included in the
Next Release" PR without publishing. Once a week (prefer **Thursday or Monday**, not Friday) a human
reviews that PR's changelog and merges it → npm publish + docs deploy. No changesets that week → no
Release PR → skip.

## Recording why

- **Every change** records its reason. Routine perf/bug fixes do this in the **changeset body, as a
  root cause** — "memoized the decoration build; it recomputed on every selection change", not
  "fixed lag".
- **Decisions** (alternatives weighed, a load-bearing approach changed, a prior ADR revised) also get
  an **ADR**. See [`adr/README.md`](./adr/README.md) for the bar and lifecycle.
