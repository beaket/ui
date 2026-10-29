# Queue

Keep work moving while the maintainer is away: decide which of Bunsen's own proposals are ready to
fix, make sure every Bunsen pull request has a current review, and clear pull requests that have
stopped moving. You run as **Beaket Bunsen Reviewer**, the App that did not file the proposals or
write the pull requests.

The authority for this job is [Delegated queue decisions](../../docs/MAINTENANCE.md#delegated-queue-decisions)
in the charter. Anything it does not hand you stays with the maintainer, and the weekly report puts
it in front of them.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first.

## 1. Clear stalled pull requests

List Beaket Bunsen's open pull requests on `agent/*` branches. For each, read your latest review
(`gh api repos/beaket/ui/pulls/<n>/reviews --paginate`, filtered on `beaket-bunsen-reviewer[bot]`)
and the commits since it.

| State                                                                                                     | Action                                                                              |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Latest review is **Needs a decision** (`COMMENTED`), more than 7 days old, with no maintainer reply since | Close it, as below                                                                  |
| You have requested changes **three times** and it is still not approved                                   | Close it, as below                                                                  |
| You requested changes on its current head commit more than 5 days ago, and nothing has been pushed since  | Close it, as below                                                                  |
| No review of its current head commit, and the head was pushed more than 2 hours ago                       | Review it now, exactly as [`review.md`](./review.md) describes for the Reviewer App |
| Anything else                                                                                             | Leave it                                                                            |

To close one: comment with the verdict that stopped it and a link to that review, then
`gh pr close <n> --delete-branch`. If it closes an issue (`Closes #<issue>`), comment on that issue
with the same link, remove `agent:ready`, and add `needs:maintainer`. If the linked issue was opened
by a person, comment only; do not relabel it.

Bunsen merge picks up any approval you give here on its next sweep. Never merge.

## 2. Grant `agent:ready`

Candidates are open issues that carry `source:agent` and **none** of `agent:ready`,
`needs:maintainer`, `desk:design`, `desk:security`, `security`, `type:arch`, `post-1.0`, or
`area:paper`, and carry `area:ui` or `area:cli`. Issues opened by people are never candidates.
Oldest first, at most **3** grants per run.

For each candidate, re-check the issue against the code on `main`, not only its body:

1. **It still reproduces.** If the problem is gone, comment with the evidence and close the issue.
2. **Definition of Ready.** Every item in
   [`docs/MAINTENANCE.md` § Definition of Ready](../../docs/MAINTENANCE.md#definition-of-ready-outside-beaketpaper)
   holds: patch-sized, reproducible, cause identified, acceptance criteria and a regression test
   named, no open question, no change to the public contract, no intended visual change.
3. **No reserved judgment.** It does not touch a file the charter reserves for the maintainer,
   change what a component looks like, add a prop or an export, or decide product scope.

If all three hold, apply `agent:ready` and one priority: `p2` for a bug users can hit, `p3` for
anything else. Never `p1`. Comment:

```markdown
Ready under the delegated queue rule (docs/MAINTENANCE.md § Delegated queue decisions), as `p<n>`.

- Reproduces on `main`: <evidence>
- Cause: <file:line>
- Regression test: <what it asserts>

<sub>Queued by Bunsen Reviewer · YYYY-MM-DD</sub>
```

If item 2 or 3 fails because of a decision only the maintainer can make, add `needs:maintainer` and
comment with that one decision, stated as a question with options. If it fails because the issue is
incomplete — no cause, no named test — comment with what is missing and leave it; triage or the
desk that filed it can complete it. Do not comment twice for the same gap: skip an issue whose last
comment is already yours and nothing has changed since.

## 3. Summarize

End with the run summary described in [`README.md`](./README.md#rules-for-every-job): pull requests
reviewed or closed, issues granted, escalated, or skipped and why, with links. The weekly report
collects them.
