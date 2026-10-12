# Maintenance charter

How this repository is maintained with the help of Bunsen, the beaket organization's scheduled AI
maintenance agent, and where the line sits between what the agent does and what the maintainer
decides.

Scope: the whole repository (`@beaket/ui` registry, CLI, docs, and `@beaket/paper`). For
`area:paper` work, [`packages/paper/docs/MAINTENANCE.md`](../packages/paper/docs/MAINTENANCE.md)
adds package-specific rules and takes precedence where the two differ.

Bunsen works across the organization, but only in repositories that opt in. Each repository keeps
its own charter and run instructions, so what Bunsen may do here is decided by this file alone.

## The principle: the agent proposes, the maintainer decides

The product's identity lives in a small set of authored documents — [`DESIGN.md`](../DESIGN.md),
[`PRODUCT.md`](../PRODUCT.md), [`CLAUDE.md`](../CLAUDE.md), and [`git-rules.md`](./git-rules.md).
Ink & Instrument is a decided position with explicit refusals, not a configurable skin, and a
maintenance process must not erode it one reasonable-looking PR at a time.

So every action that commits the project to something — accepting work into the queue, changing
the public contract, changing the visual system, shipping a major or breaking change — stays with
the maintainer. Routine merges and releases follow a rule the maintainer set, applied by a script
rather than a model; see [Merging](#merging). The agent's job is to notice, investigate, propose,
and prepare. It is enforced by GitHub permissions and the `main` ruleset, not only by instructions.

## Roles

| Role                   | Owns                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Maintainer** (human) | The authored documents above, queue decisions (`agent:ready`, priority, `type:arch`), every major or breaking merge and release, `major` approval, every reply in the project's voice to outside contributors. |
| **Bunsen** (agent)     | Noticing, proposing, and preparing, through the desks below. Its pull requests take effect only through the [merge rule](#merging); everything else only when the maintainer acts on it.                       |

Bunsen runs in GitHub Actions ([`.github/workflows/bunsen.yml`](../.github/workflows/bunsen.yml)).
It acts through two GitHub Apps, neither a bypass actor on `main` and neither able to change
workflows or settings. **Beaket Bunsen** (`beaket-bunsen[bot]`) writes issues, branches, and pull
requests. **Beaket Bunsen Reviewer** (`beaket-bunsen-reviewer[bot]`) reviews them on a different
model and cannot push, so no pull request Bunsen writes is approved by the session that wrote it.
Its approval merges, under the [merge rule](#merging).
Every issue it files carries the `source:agent` label, and everything it writes ends with a footer
naming Bunsen.

## Desks

Bunsen is one agent with several lenses. Each desk has its own run instructions in
[`.github/agents/`](../.github/agents/) and its own label, so the maintainer can see — and the
weekly report can measure — which lens produces work worth keeping.

| Desk                | Looks at                                                                                    | Produces                                           |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Triage              | CI on `main`, the release flow, stuck dependencies, the philosophy guardrails               | Issues for what is broken                          |
| Security            | Dependabot, code scanning, and secret scanning alerts; workflow supply chain; policy files  | `desk:security` issues, within the disclosure rule |
| Developer proposals | A rotating set of components, as a developer: API consistency, edge cases, ecosystem, tests | `desk:dev` proposals                               |
| Designer proposals  | The same components, as the author of `DESIGN.md`: drift, missing states, contrast          | `desk:design` proposals, always `needs:maintainer` |
| Growth and docs     | The docs site, README, community files, how the project is described, release notes         | `desk:growth` issues; docs pull requests           |
| Review              | Bunsen's pull requests, as Beaket Bunsen Reviewer; any pull request on `@bunsen review`     | An approval or change request; advice on request   |
| Fix                 | The top `agent:ready` issue, or a change request on its own pull request                    | One pull request per issue                         |
| Release review      | The release pull request, weekly, as Beaket Bunsen Reviewer                                 | A verdict; an approval releases                    |
| Weekly report       | Everything above                                                                            | One Discussion, with a scorecard per desk          |

More activity is only useful if the maintainer can keep up with it. The proposal desks stop filing
when their backlog reaches 5 open issues, and slow to one proposal per run when fewer than 30% of
their recent proposals were accepted; see
[the desk throttle](../.github/agents/README.md#desk-throttle).

## Talking to Bunsen

Write `@bunsen` in an issue or pull request comment, followed by the request. On a pull request,
use the Conversation tab; inline review comments do not reach it. Only people with write access can
summon it; a mention from anyone else is ignored. Bunsen replies in the same thread, so the
question, the answer, and any decision stay on GitHub — no other channel is the record.

A maintainer can use this to ask questions, start an investigation, run a job early, ask for a
review of any pull request (`@bunsen review`), or record a
queue decision ("approve as `agent:ready`, p2"). The maintainer's comment is the decision; Bunsen
only carries it out and quotes it. How Bunsen handles each kind of request is in
[`.github/agents/respond.md`](../.github/agents/respond.md).

## What Bunsen may and may not do

| May                                                                                                                                               | Must never                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open issues (at most 3 per run), labeled `source:agent`, after searching for duplicates                                                           | Apply `agent:ready`, `p1`, `p2`, `p3`, `type:arch`, or `post-1.0` on its own judgment — it may _recommend_ them in the issue body, and apply them only when a maintainer's `@bunsen` comment says to |
| Apply descriptive labels to its own issues: `area:*`, `bug`, `perf`, `documentation`, `security`                                                  | Merge, push to `main`, or publish from a Claude session — only the merge step merges, under [the rule](#merging)                                                                                     |
| Comment on and close its own issues (for example, when a finding no longer reproduces)                                                            | Add a `major` changeset or set `ALLOW_MAJOR`                                                                                                                                                         |
| Post the weekly report, and reply where a maintainer writes `@bunsen` — including a review                                                        | Edit `DESIGN.md`, `PRODUCT.md`, `CLAUDE.md`, `.impeccable/`, this charter, ADRs, or `src/themes/*.css`                                                                                               |
| Open pull requests from `agent/*` branches: fixes for `agent:ready` issues, and security fixes                                                    | Edit `.github/workflows/`, `renovate.json`, repository settings, or secrets                                                                                                                          |
| Open documentation-only pull requests without an `agent:ready` issue — typos, broken links, examples or prop tables that no longer match the code | Comment on, label, or close issues and pull requests opened by people, except an `agent:ready` issue it is fixing                                                                                    |
| Correct a published release's notes — the GitHub release body and its `CHANGELOG.md` entry — for rendering errors, broken links, and typos        | Change what a release says shipped, or its version, tag, or assets                                                                                                                                   |
| As Beaket Bunsen Reviewer only: approve or request changes on Bunsen's pull requests, and review the release pull request — an approval merges    | Approve a pull request as the App that wrote it, or approve anything opened by a person                                                                                                              |
|                                                                                                                                                   | Publish the details of a vulnerability that is not yet fixed — see [`security.md`](../.github/agents/security.md#3-file)                                                                             |

The rule about issues and pull requests opened by people keeps the project's public voice human.
When an outside issue needs a response, the agent drafts one in the weekly report and the
maintainer posts it.

When a finding touches a judgment the authored documents reserve for the maintainer — a design rule,
the public contract, product scope — the agent files it with `needs:maintainer` and stops. It does
not pick a side.

## Labels

The existing queue labels keep their meaning (`agent:ready`, `type:arch`, `p1`–`p3`, `area:*`,
`bug`, `perf`, `security`, `post-1.0`). Three labels support the agent:

| Label              | Meaning                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `source:agent`     | Filed by Bunsen. Lets anyone filter agent output from human reports.            |
| `needs:maintainer` | Blocked on a decision only the maintainer can make. Listed first in the report. |
| `agent:pause`      | Kill switch — see below.                                                        |
| `desk:*`           | Which desk filed it: `desk:dev`, `desk:design`, `desk:growth`, `desk:security`. |

## Definition of Ready outside `@beaket/paper`

`agent:ready` on an `area:ui` or `area:cli` issue means the same as in the paper queue — patch-sized,
reproducible, cause identified, acceptance criteria and a regression test named, no open question —
plus two rules specific to the registry:

- **No change to the public contract** as defined in [`git-rules.md`](./git-rules.md): installed
  component source and types, the CLI interface, and documented exports. A fix that would need a
  `Breaking change:` changeset is not ready.
- **No intended visual change.** Anything that would move a visual-regression baseline or apply a
  `DESIGN.md` rule differently is maintainer work. A fix that restores documented `DESIGN.md`
  behavior is ready only when the issue quotes the rule it restores.

## Philosophy guardrails

The triage run checks the rules that can be checked mechanically and files a violation as an
issue. None of these are enforced in CI today; promoting a guardrail to a CI check is a maintainer
decision the report may recommend.

1. **Semantic names only.** No component source in `src/components/` (excluding stories and tests) reads a
   palette value (`--tone-*`, `--surface-*`, `--signal-*`) or a raw color (hex, `rgb()`, `hsl()`,
   `oklch()`).
2. **Required checklist.** Every component file has a `.stories.tsx` with `tags: ["autodocs"]` and a
   `play` function, a `registry/registry.json` entry whose `files` exist, a `data-slot`, and its own
   `cn`.
3. **Compound parts are exported by name**, not only attached as properties.
4. **Release hygiene.** No pending `major` changeset; every pending changeset that describes an API
   change starts with `Breaking change:`.

Rules that need judgment — the One Vivid Voice Rule, One Ink at Three Pressures, elevation, state
precedence — are not auto-fixed. A suspected drift is filed with `needs:maintainer` and the
`DESIGN.md` section it concerns.

## Cadence

All times are UTC+9.

| Job           | When                               | Output                                                   |
| ------------- | ---------------------------------- | -------------------------------------------------------- |
| Respond       | When a maintainer writes `@bunsen` | A reply in the same thread                               |
| Triage        | Tuesday and Friday, 09:07          | Up to 3 new issues per run; otherwise nothing            |
| Security      | Weekdays, 09:37                    | Issues for open alerts and supply-chain weaknesses       |
| Developer     | Wednesday, 09:07                   | Up to 2 proposals                                        |
| Designer      | Thursday, 09:07                    | Up to 2 proposals                                        |
| Growth        | Friday, 10:07                      | Up to 3 documentation issues                             |
| Weekly report | Monday, 09:07                      | One Discussion covering the previous Monday–Sunday       |
| Fix           | Weekdays, 11:07                    | Pull requests for `agent:ready` issues, one issue per PR |
| Release       | Thursday, 09:17                    | A release verdict; an approval merges, which publishes   |
| Merge         | When checks finish; weekdays 11:47 | Merges what the reviewer approved — no Claude involved   |

The times are when GitHub queues a run, not when it starts. Under load GitHub starts scheduled runs
late — in this organization four to six hours late in a typical week of 2026 — and may skip one. The
weekly report counts which desks ran and how late. A desk that keeps missing its slot is the signal
to move it or to start it some other way.

The scheduled jobs can also be started by hand from the Bunsen workflow's **Run workflow** button,
or by asking `@bunsen` in a comment.

Run instructions live in [`.github/agents/`](../.github/agents/). They are versioned with the code,
so changing how the agent behaves is a reviewed pull request, not a hidden prompt edit.

## Merging

The maintainer's rule, set on 2026-10-12: a Bunsen pull request, or the release pull request,
merges without the maintainer when

1. it is Beaket Bunsen's, on an `agent/*` branch, or it is the release pull request
   (`changeset-release/main`);
2. Beaket Bunsen Reviewer's latest review approves its current head commit — a push after the
   approval needs a new one;
3. every check on that commit has passed, not only the ones the ruleset requires; and
4. it carries no `major` bump and no `Breaking change:` — in a changeset, or in a changelog the
   release pull request generates.

[`.github/scripts/bunsen-merge.sh`](../.github/scripts/bunsen-merge.sh) applies the rule, as
Beaket Bunsen, after every review and again whenever a pull request's checks finish
([`bunsen-merge.yml`](../.github/workflows/bunsen-merge.yml)). It is a script, so no model decides
to merge; the reviewer's verdict is the only judgment in the loop. Anything the rule does not cover
— a major or breaking change, a pull request from a person, a Renovate update — merges the way it
did before.

## Releases

Releases are weekly: on Thursday the reviewer reviews the release pull request, and its approval
merges it, which publishes to npm. A security fix does not wait — the security desk gets it onto
`main` with a `Security:` changeset and escalates the release the same day; running the release
review early ships it. A release that carries a `major` or `Breaking change:` changeset is always
the maintainer's explicit decision: the reviewer comments instead of approving, and the merge rule
refuses it regardless.

## The weekly report

Posted in **Discussions › Maintenance** as `Weekly Report YYYY-Www` (ISO week). It opens with the
decisions waiting on the maintainer, and should take no more than two minutes to read. The format is
fixed in [`.github/agents/weekly-report.md`](../.github/agents/weekly-report.md) so that weeks can be
compared at a glance.

The report is also the agent's channel for proposing changes to its own process, including this
charter.

## Kill switch

Open any issue with the `agent:pause` label. Every run checks for one first and exits without acting
while it is open. Close the issue to resume. To stop runs entirely, disable the Bunsen workflow in
the repository's Actions tab.

## Rollout

**Phase 1 — observe, answer, report.** The Bunsen workflow answers `@bunsen`, runs triage, and posts
the weekly report. It authenticates through workload identity federation to the company's
Anthropic Console organization, billed to the Bunsen workspace, and makes no code changes. Goal:
tune the instructions until the reports are worth reading and triage issues are worth keeping.

**Phase 2 — act through the gate.** Give Bunsen its own identity and budget, and add the writing
desks and an independent reviewer. Started on 2026-10-11 by the maintainer's decision, with the
maintainer merging and releasing; since 2026-10-12 an approval merges under the
[merge rule](#merging). Prerequisites:

- [x] Beaket Bunsen GitHub App installed on this repository with contents, issues, pull requests,
      and discussions (write); Dependabot, code scanning, and secret scanning alerts (read); and
      no workflows or administration permission — passed to the workflow as `github_token`. Pull
      requests opened with the workflow's own token do not trigger CI, so the fix job and docs
      pull requests need the App.
- [x] Beaket Bunsen Reviewer GitHub App installed on this repository with pull requests (write)
      and contents, issues, checks, and actions (read) — no contents write
- [x] A private repository, `beaket/bunsen`, for what should not be public yet: announcement
      drafts, growth notes, and anything the security desk holds back
- [x] Neither App is a bypass actor on the `main` ruleset
- [x] Authentication that does not depend on one person's subscription: workload identity
      federation, with a federation rule that accepts only runs on `main` of this repository
- [ ] Four weeks of phase 1 reports reviewed — skipped: on 2026-10-11 the maintainer chose to
      start phase 2 without the observation period

## Changing this charter

Only the maintainer edits this file. Proposals arrive through the weekly report or a normal pull
request.
