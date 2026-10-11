# Weekly report

Write one report the maintainer can read in two minutes and act on. The maintainer's attention is
the scarcest resource in this process; the report spends it only on what needs them.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first.

## 1. Window and title

The window is the previous ISO week: Monday 00:00 to Sunday 23:59, UTC+9. The title is
`Weekly Report YYYY-Www` for that week (`TZ=Asia/Seoul date -d 'last monday' +%G-W%V` on a Monday
run). Convert the window to UTC to compare against GitHub timestamps.

## 2. Gather

Use only the endpoints described in
[`README.md` § GitHub access](./README.md#github-access-in-the-scheduled-environment).

- **Merged pull requests** in the window (`pulls?state=closed&sort=updated&direction=desc`, filtered
  on `merged_at`), grouped as maintainer, Renovate, `beaket-ai`, and outside contributors.
- **Releases** published in the window (`releases`), with versions.
- **Issues** opened and closed in the window; current open counts for all issues, `needs:maintainer`,
  `agent:ready`, `security`, and `source:agent`. Exclude `report:weekly` issues from every count.
- **CI on `main`**: runs and failures in the window, per workflow.
- **Renovate backlog**: open Renovate pull requests and the oldest one's age.
- **Release pull request**: whether `changeset-release/main` is open, and how many changesets it
  carries.
- **Downloads**: `curl -s https://api.npmjs.org/downloads/point/last-week/@beaket/ui` and the same for
  `@beaket/paper`. The scheduled environment currently blocks this host; write `n/a` if unreachable.
- **Waiting on a human**: issues and pull requests opened by outside contributors with no maintainer
  reply for more than 3 days. Read each one and draft a short reply in the project's voice — factual,
  warm, no promises about dates. These are drafts for the maintainer to post; do not post them.
- **Decisions**: open `needs:maintainer` issues, `source:agent` issues that recommend `agent:ready`
  but have not been labeled, and pull requests awaiting maintainer review for more than 3 days.
- **Last week's report**: find the previous `report:weekly` issue and read its Health table, to
  compute changes. If there is none, leave the change column empty.

## 3. Write

Follow this template exactly; consistent shape is what makes weeks comparable. Omit a section only
where the template says so. Keep each item to one line, with a link.

```markdown
**TL;DR** — Three sentences at most: the state of the project, the most important change since last
week, and how many decisions are waiting.

## Decisions for you

The most important first, five at most. Each item: what to decide, the options, and the agent's
recommendation with a one-line reason. If there are more than five, say how many are left over.
Write "Nothing needs you this week." when empty.

- [ ] #123 — Approve as `agent:ready`? Recommend **yes, p2**: patch-sized, cause identified, test named.

## Health

| Signal                        | This week | Change |
| ----------------------------- | --------- | ------ |
| CI runs on `main` (failed)    |           |        |
| Open issues                   |           |        |
| `needs:maintainer`            |           |        |
| `agent:ready` (unclaimed)     |           |        |
| Open `security`               |           |        |
| Renovate backlog (oldest)     |           |        |
| Pending changesets            |           |        |
| npm downloads `@beaket/ui`    |           |        |
| npm downloads `@beaket/paper` |           |        |

## Shipped

Releases and merged pull requests worth a line, grouped by who authored them. Collapse Renovate into
a single count.

## Waiting on a human

Omit this section when empty. Each item: the link, who has been waiting and for how long, then the
draft reply in a quote block.

## Philosophy watch

What triage checked this week against the guardrails in `docs/MAINTENANCE.md`, and what it found.
"All guardrails held." is a complete answer.

## Process notes

Omit this section when empty. Proposed changes to the agent's instructions or the charter, problems
the agent hit (access errors, unreachable services), and guardrails worth promoting to CI.

<sub>Filed by beaket-ai · weekly report · YYYY-MM-DD</sub>
```

## 4. Publish

Post the report as an issue labeled `report:weekly` (not `source:agent`, so triage leaves it alone). (Discussions would suit a
report better, but they need GraphQL, which the scheduled environment cannot reach. Phase 2 may move
the report there.)

1. If an issue with the same title already exists, update its body with `-X PATCH` instead of
   creating a duplicate.
2. Close every other open `report:weekly` issue with a one-line comment linking the new report, so
   exactly one report is open at a time.
3. Send a push notification to the maintainer containing the TL;DR, the number of decisions waiting,
   and the issue URL. In phase 1 the report is filed under the maintainer's own account, so GitHub
   will not notify them; the push notification is how they learn it is ready.

End with the run summary described in [`README.md`](./README.md#rules-for-every-job), including the
issue URL.
