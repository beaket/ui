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

| Role                                                          | Owns                                                                                                                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Maintainer** (human)                                        | The authored documents above, `agent:ready` and priority labels, merges, releases, `major` approval, every reply in the project's voice to outside contributors. |
| **Bunsen** (GitHub App "Beaket Bunsen", `beaket-bunsen[bot]`) | Scheduled triage, weekly reporting, and — from phase 2 — fixes for `agent:ready` issues, delivered as pull requests.                                             |

During phase 1 (see [Rollout](#rollout)) the agent runs as Claude Code routines authenticated as the
maintainer, so its GitHub activity appears under the maintainer's account. Every issue it files
therefore carries the `source:agent` or `report:weekly` label, and everything it writes ends with a
footer line identifying it as Bunsen.

## What Bunsen may and may not do

| May                                                                                              | Must never                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Open issues (at most 3 per run), labeled `source:agent`, after searching for duplicates          | Apply `agent:ready`, `p1`, `p2`, `p3`, `type:arch`, or `post-1.0` — it may _recommend_ them in the issue body |
| Apply descriptive labels to its own issues: `area:*`, `bug`, `perf`, `documentation`, `security` | Merge, approve, or push to `main`; run or merge the release PR; publish to npm                                |
| Comment on and close its own issues (for example, when a finding no longer reproduces)           | Add a `major` changeset or set `ALLOW_MAJOR`                                                                  |
| Post the weekly report                                                                           | Edit `DESIGN.md`, `PRODUCT.md`, `CLAUDE.md`, `.impeccable/`, this charter, ADRs, or `src/themes/*.css`        |
| Phase 2: open pull requests from `agent/*` branches for `agent:ready` issues                     | Edit `.github/workflows/`, `renovate.json`, repository settings, or secrets                                   |
|                                                                                                  | Comment on, label, or close issues and pull requests opened by people                                         |

The last rule keeps the project's public voice human. When an outside issue needs a response, the
agent drafts one in the weekly report and the maintainer posts it.

When a finding touches a judgment the authored documents reserve for the maintainer — a design rule,
the public contract, product scope — the agent files it with `needs:maintainer` and stops. It does
not pick a side.

## Labels

The existing queue labels keep their meaning (`agent:ready`, `type:arch`, `p1`–`p3`, `area:*`,
`bug`, `perf`, `security`, `post-1.0`). Four labels support the agent:

| Label              | Meaning                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `source:agent`     | Filed by Bunsen. Lets anyone filter agent output from human reports.            |
| `needs:maintainer` | Blocked on a decision only the maintainer can make. Listed first in the report. |
| `agent:pause`      | Kill switch — see below.                                                        |
| `report:weekly`    | The weekly report. Exactly one is open at a time.                               |

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

| Job           | When                      | Output                                                   |
| ------------- | ------------------------- | -------------------------------------------------------- |
| Triage        | Tuesday and Friday, 09:00 | Up to 3 new issues per run; otherwise nothing            |
| Weekly report | Monday, 09:00             | One report issue covering the previous Monday–Sunday     |
| Fix           | Phase 2                   | Pull requests for `agent:ready` issues, one issue per PR |

Run instructions live in [`.github/agents/`](../.github/agents/). They are versioned with the code,
so changing how the agent behaves is a reviewed pull request, not a hidden prompt edit.

## The weekly report

Filed as an issue labeled `report:weekly`, titled `Weekly Report YYYY-Www` (ISO week); the previous
week's report is closed when the new one is filed, and the maintainer gets a push notification. It
opens with the decisions waiting on the maintainer, and should take no more than two minutes to
read. The format is
fixed in [`.github/agents/weekly-report.md`](../.github/agents/weekly-report.md) so that weeks can be
compared at a glance.

A GitHub Discussion would suit the report better than an issue, but Discussions need GraphQL, which
the phase 1 environment cannot reach. Phase 2 can move the report there.

The report is also the agent's channel for proposing changes to its own process, including this
charter.

## Kill switch

Open any issue with the `agent:pause` label. Every run checks for one first and exits without acting
while it is open. Close the issue to resume. To stop runs entirely, disable the routines (phase 1)
or the workflows (phase 2).

## Rollout

**Phase 1 — observe and report.** Claude Code routines run triage and the weekly report. No code
changes. Goal: tune the instructions until the reports are worth reading and triage issues are
worth keeping.

**Phase 2 — act through the gate.** Move the runs to GitHub Actions authenticated as the
Beaket Bunsen GitHub App with a company-billed Anthropic API key, and add the fix job. Prerequisites:

- [ ] Beaket Bunsen GitHub App installed on this repository with issues, pull requests, discussions,
      and contents (write) — and no administration permission
- [ ] The App is not a bypass actor on the `main` ruleset
- [ ] `ANTHROPIC_API_KEY` repository secret from the company Anthropic Console organization
- [ ] Four weeks of phase 1 reports reviewed

## Changing this charter

Only the maintainer edits this file. Proposals arrive through the weekly report or a normal pull
request.
