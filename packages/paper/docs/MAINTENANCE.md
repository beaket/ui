# `@beaket/paper` — contributing & the issue queue

How work on `@beaket/paper` is organized: a maintained **issue queue**, biased to performance and bug
fixes, where every change records _why_. This page is for anyone filing or picking up an issue.

See also: [`CONTEXT.md`](./CONTEXT.md) (what/where — read before editing),
[`DECISIONS.md`](./DECISIONS.md) (why), [`adr/README.md`](./adr/README.md) (the ADR rule).

## Roadmap: driving to 1.0.0

**1.0.0 is the deadline for interface/breaking work** — breaking changes are cheap on `0.x` minors
now, expensive deliberate `major`s after. So pre-1.0 the priority is getting the interface right;
routine perf/bug fixes run underneath. Tracked by the **`1.0.0` milestone** and its exit criteria
(all must-have): interface freeze + ADR; zero P1/P2 bugs (and every `DECISIONS.md` "Deferred" item
resolved or accepted-with-reason); perf targets met + measured; CJK/IME real-device verification.

## The queue (GitHub issues)

| Label              | Meaning                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `area:paper`       | Scopes the issue to this package.                                          |
| `bug` / `perf`     | The work type. Routine, patch-sized fixes are the bread and butter.        |
| `agent:ready`      | **The gate** — vetted and ready to be picked up (see Definition of Ready). |
| `p1` / `p2` / `p3` | Priority; highest-priority `agent:ready` is taken first.                   |
| `type:arch`        | Architectural/strategic — maintainer-driven, not routine queue work.       |

Anyone can open an issue. Marking it `agent:ready` is a **maintainer** action (GitHub restricts
labels to triage+), so the queue stays curated — filing a candidate is not the same as authorizing it.

## Definition of Ready (the `agent:ready` gate)

An issue may carry `agent:ready` only if **all** of these hold. Whoever picks it up re-checks this; if
an item fails, comment why, remove `agent:ready`, and move on — don't fix blind.

- [ ] **Scoped to `packages/paper`** and labeled `bug` or `perf` (not `type:arch`).
- [ ] **Patch-sized & non-breaking** — a focused fix, no public API/behavior change. (Anything that
      would change `EditorOptions`, exports, or user-visible rendered behavior is _not_ ready — it is
      strategic, maintainer work.)
- [ ] **Clear reproduction or evidence** — exact steps, input, or the code path; for perf, the hot
      path and why it's hot.
- [ ] **Suspected cause identified** — a concrete file/area and a hypothesis, not just a symptom.
- [ ] **Acceptance criteria** — what "fixed" looks like, and the regression test that will pin it
      (every bug is fixed red→green; visual/coordinate behavior isn't jsdom-testable — assert on
      structure/generated CSS, per [`CONTEXT.md`](./CONTEXT.md) invariant #4).
- [ ] **No open question** blocking the approach (if a decision is needed first, it's `type:arch`).

## Recording why

- **Every change** records its reason. Routine perf/bug fixes do this in the **changeset body, as a
  root cause** — "memoized the decoration build; it recomputed on every selection change", not
  "fixed lag". One changeset per logical change; `patch` for fixes.
- **Decisions** (alternatives weighed, a load-bearing approach changed, a prior ADR revised) also get
  an **ADR**. See [`adr/README.md`](./adr/README.md) for the bar and lifecycle.

## Releases

Releases ride [Changesets](https://github.com/changesets/changesets): merged PRs accumulate in the
open "Changes Included in the Next Release" PR, which is merged periodically to publish to npm and
deploy the docs. Add a changeset with every user-facing change (`pnpm changeset`).
