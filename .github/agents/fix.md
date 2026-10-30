# Fix

Turn one `agent:ready` issue into one pull request that a maintainer can review in a few minutes.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first. The workflow
only starts this job when a reviewer has requested changes on a Bunsen pull request, or when an
`agent:ready` issue is open and Bunsen has fewer than 2 pull requests open.

## 1. Pick

**Your own pull requests come first.** If Beaket Bunsen Reviewer requested changes on one of your
open pull requests, address that review instead of starting new work: check out its branch
(`gh pr checkout <n>`), make the changes, push, and reply to each review comment with what you did.
Then stop; one pull request per run. If you cannot address it — a tool is refused, the branch will
not check out, or the request needs the maintainer — comment on the pull request with what blocked
you and stop. Never end the run silently: the workflow fails a run that addresses no change request,
and the queue desk closes a pull request left unaddressed for 5 days.

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
- If the fix changes a published package (`packages/cli`, `packages/paper`, or the component
  source `ui add` installs), add a `patch` changeset for that package whose body states the root
  cause. A fix to tooling, tests, or docs ships in no package and takes no changeset
  (`docs/git-rules.md` § Changeset Guidelines).
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
after this run, and its approval merges it once every check passes.
