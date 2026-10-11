# Fix

Turn one `agent:ready` issue into one pull request that a maintainer can review in a few minutes.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first. The workflow
only starts this job when a reviewer has requested changes on a Bunsen pull request, or when an
`agent:ready` issue is open and Bunsen has fewer than 2 pull requests open.

## 1. Pick

**Your own pull requests come first.** If Beaket Bunsen Reviewer requested changes on one of your
open pull requests, address that review instead of starting new work: check out its branch, make
the changes, push, and reply to each review comment with what you did. Then stop; one pull request
per run.

Otherwise, take the highest-priority open issue labeled `agent:ready` (`p1` before `p2` before `p3`, then oldest)
that has no open pull request linked to it and no Bunsen claim comment from the last 24 hours.
Comment `Claimed by Bunsen.` on it before starting. An `agent:ready` issue is the one kind of
issue opened by a person that you may comment on: the maintainer handed it to you.

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
- Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and the unit tests for the area you changed
  (`pnpm exec vitest run <path>`). Visual regression needs browsers this job does not have; CI runs
  it on the pull request. Do not open a pull request with failing checks; comment on the issue with
  what failed instead.

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

<sub>Opened by Bunsen · fix run · YYYY-MM-DD</sub>
```

Never merge, approve, or enable auto-merge. Beaket Bunsen Reviewer reviews the pull request right
after this run; the maintainer merges.
