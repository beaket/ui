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

So every action that commits the project to something — accepting work into the queue, merging,
releasing, changing the public contract, changing the visual system — stays with the maintainer.
The agent's job is to notice, investigate, propose, and (later) prepare. It is enforced by GitHub
permissions and the `main` ruleset, not only by instructions.

## Roles

| Role                   | Owns                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Maintainer** (human) | The authored documents above, queue decisions (`agent:ready`, priority, `type:arch`), merges, releases, `major` approval, every reply in the project's voice to outside contributors. |
| **Bunsen** (agent)     | Answering the maintainer, scheduled triage, weekly reporting, and — from phase 2 — fixes for `agent:ready` issues, delivered as pull requests.                                        |

Bunsen runs in GitHub Actions ([`.github/workflows/bunsen.yml`](../.github/workflows/bunsen.yml)).
In phase 1 its replies appear as `claude[bot]` and the issues and reports it files as
`github-actions[bot]`; phase 2 gives it its own GitHub App, "Beaket Bunsen" (`beaket-bunsen[bot]`).
Every issue it files carries the `source:agent` label, and everything it writes ends with a footer
naming Bunsen.

## Talking to Bunsen

Write `@bunsen` in an issue or pull request comment, followed by the request. Only people with
write access can summon it; a mention from anyone else is ignored. Bunsen replies in the same
thread, so the question, the answer, and any decision stay on GitHub — no other channel is the
record.

A maintainer can use this to ask questions, start an investigation, run a job early, or record a
queue decision ("approve as `agent:ready`, p2"). The maintainer's comment is the decision; Bunsen
only carries it out and quotes it. How Bunsen handles each kind of request is in
[`.github/agents/respond.md`](../.github/agents/respond.md).

## What Bunsen may and may not do

| May                                                                                              | Must never                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open issues (at most 3 per run), labeled `source:agent`, after searching for duplicates          | Apply `agent:ready`, `p1`, `p2`, `p3`, `type:arch`, or `post-1.0` on its own judgment — it may _recommend_ them in the issue body, and apply them only when a maintainer's `@bunsen` comment says to |
| Apply descriptive labels to its own issues: `area:*`, `bug`, `perf`, `documentation`, `security` | Merge, approve, or push to `main`; run or merge the release PR; publish to npm                                                                                                                       |
| Comment on and close its own issues (for example, when a finding no longer reproduces)           | Add a `major` changeset or set `ALLOW_MAJOR`                                                                                                                                                         |
| Post the weekly report, and reply where a maintainer writes `@bunsen`                            | Edit `DESIGN.md`, `PRODUCT.md`, `CLAUDE.md`, `.impeccable/`, this charter, ADRs, or `src/themes/*.css`                                                                                               |
| Phase 2: open pull requests from `agent/*` branches for `agent:ready` issues                     | Edit `.github/workflows/`, `renovate.json`, repository settings, or secrets                                                                                                                          |
|                                                                                                  | Comment on, label, or close issues and pull requests opened by people                                                                                                                                |

The last rule keeps the project's public voice human. When an outside issue needs a response, the
agent drafts one in the weekly report and the maintainer posts it.

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
| Weekly report | Monday, 09:07                      | One Discussion covering the previous Monday–Sunday       |
| Fix           | Phase 2                            | Pull requests for `agent:ready` issues, one issue per PR |

The scheduled jobs can also be started by hand from the Bunsen workflow's **Run workflow** button,
or by asking `@bunsen` in a comment.

Run instructions live in [`.github/agents/`](../.github/agents/). They are versioned with the code,
so changing how the agent behaves is a reviewed pull request, not a hidden prompt edit.

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
the weekly report. It authenticates with the maintainer's Claude subscription
(`CLAUDE_CODE_OAUTH_TOKEN`) and makes no code changes. Goal: tune the instructions until the reports
are worth reading and triage issues are worth keeping.

**Phase 2 — act through the gate.** Give Bunsen its own identity and budget, and add the fix job.
Prerequisites:

- [ ] Beaket Bunsen GitHub App installed on this repository with contents, issues, pull requests,
      and discussions (write) — and no administration permission — passed to the workflow as
      `github_token`
- [ ] The App is not a bypass actor on the `main` ruleset
- [ ] Authentication that does not depend on one person's subscription: a company Anthropic Console
      key or workload identity federation
- [ ] Four weeks of phase 1 reports reviewed

## Changing this charter

Only the maintainer edits this file. Proposals arrive through the weekly report or a normal pull
request.
