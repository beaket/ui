# Fix

> **Phase 2 — not scheduled.** This job runs only after the phase 2 prerequisites in
> [`docs/MAINTENANCE.md`](../../docs/MAINTENANCE.md#rollout) are met. Until then, do not act on it.

Turn one `agent:ready` issue into one pull request that a maintainer can review in a few minutes.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first. In this job
the phase 1 "no repository writes" rule is replaced by the rules below.

## 1. Pick

Take the highest-priority open issue labeled `agent:ready` (`p1` before `p2` before `p3`, then oldest)
that has no open pull request linked to it and no `beaket-ai` claim comment from the last 24 hours.
Comment `Claimed by beaket-ai.` on it before starting.

Re-check the Definition of Ready in `docs/MAINTENANCE.md` (and, for `area:paper`, in
`packages/paper/docs/MAINTENANCE.md`). If any item fails, comment which one and why, remove
`agent:ready`, and stop. Do not fix blind.

## 2. Fix

- Work on a branch named `agent/<issue-number>-<short-slug>`.
- Read the files the issue names and the guidance `CLAUDE.md` points to for that area before
  editing. For `area:paper`, read `packages/paper/docs/CONTEXT.md` first.
- Write the regression test first and confirm it fails, then make it pass.
- Keep the change to what the issue describes. Note anything else you notice in the pull request
  body instead of fixing it.
- Add a `patch` changeset for the package you changed, whose body states the root cause.
- Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and the tests for the area you changed.
  Do not open a pull request with failing checks; comment on the issue with what failed instead.

Never edit the files the charter reserves for the maintainer, never change the public contract, and
never add a `major` changeset — if the fix seems to require any of these, the issue was not ready.

## 3. Open the pull request

Title in Conventional Commits form, for example `fix(select): restore semantic border token`. Body:

```markdown
Closes #<issue>

## Root cause

## Change

## Test

How the regression test pins the fix, and the command that runs it.

## Not changed

Anything noticed but left alone.

<sub>Opened by beaket-ai · fix run · YYYY-MM-DD</sub>
```

Request review from the maintainer. Never merge, approve, or enable auto-merge.
