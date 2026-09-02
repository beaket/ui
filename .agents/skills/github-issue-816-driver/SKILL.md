---
name: github-issue-816-driver
description: Execute exactly one implementation-ready child of GitHub epic #816 through implementation, PR review, CI, merge, and issue closure. Use when asked to advance, run, babysit, or complete issue 816.
---

# GitHub issue 816 driver

GitHub is the source of truth; do not rely on a previous session. Read epic #816, its linked child issues, their comments, linked pull requests, reviews, and checks at the start of every run.

## Select work

1. If every linked child is closed, close #816 with a concise completion comment. After GitHub confirms it is closed, delete this skill directory and report completion.
2. Otherwise, select exactly one open linked child, in the epic's listed order, only when it has the `agent:ready` label and no active PR owned by this workflow.
3. Stop and report if no child is eligible, requirements conflict, or a human decision is needed. Do not start `type:arch` work merely because it is first.

## Execute one child

1. Read the issue, related code, existing tests, and every caller of code that will change. Work on `codex/issue-<number>-<slug>`.
2. Implement the smallest complete change. Run the relevant local checks, then review the diff for correctness, regressions, security, and scope before opening a PR.
3. Open a PR that contains `Fixes #<number>`, a concise test record, and any deliberate limitation. Do not start another child issue in this run.
4. Re-check CI, reviews, and unresolved review threads. Fix actionable findings, push, and repeat until required checks pass and no unresolved review remains.
5. Merge only when the PR is mergeable and every required check is green. Squash merge, verify GitHub reports it merged, switch local checkout to `main`, run `git pull --ff-only origin main`, and confirm the working tree is clean. Confirm the linked issue closed. If it was the final child, perform the completion cleanup in “Select work” before reporting.

## Boundaries

- Never claim WCAG certification from the automated checks created under this epic.
- Preserve unrelated local changes; do not switch branches or merge if that would overwrite them.
- Do not bypass branch protection, dismiss reviews, force-push, or merge with failing/pending required checks.
