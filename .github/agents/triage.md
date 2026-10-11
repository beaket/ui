# Triage

Find problems worth a maintainer's attention, and file the best of them as issues. A quiet run that
files nothing is a good outcome when nothing is wrong.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first.

## 1. Gather signals

Look back 7 days unless a step says otherwise. Record each finding with its evidence and a
**fingerprint**: a short, stable key such as `ci-failing:visual-regression` or
`guardrail-semantic:src/components/select.tsx`. The same problem must produce the same fingerprint
on every run.

Use only the endpoints described in
[`README.md` § GitHub access](./README.md#github-access-in-the-scheduled-environment).

**CI on `main`.** `gh api 'repos/beaket/ui/actions/runs?branch=main&per_page=100'`. A finding is a
workflow whose most recent run on `main` failed, or that failed more than once in the window. Use
`actions/runs/<id>/jobs` to name the failing job and step. Job logs cannot be downloaded here, so
form a hypothesis from the step name, the commits in the failing range, and the workflow file, and
say plainly that you have not seen the log.

**Release flow.** Compare the published versions (`npm view @beaket/ui version`,
`npm view @beaket/paper version`) with `packages/cli/package.json` and
`packages/paper/package.json` on `main`. A version on `main` that never reached npm is a finding.
Note the age of the open `changeset-release/main` pull request, if any; older than 14 days is a
finding.

**Dependencies.** Renovate automerges minor and patch updates, so an open Renovate pull request older
than 7 days, or one with failing checks, is a finding — say why it is stuck. Any open issue or pull
request labeled `security` is always a finding unless an open `source:agent` issue already tracks it.

**Philosophy guardrails.** Run each check in `docs/MAINTENANCE.md` § Philosophy guardrails against
the checkout:

1. Semantic names only — search component sources (`src/components/*.tsx`, excluding `*.stories.tsx` and `*.test.tsx`) for
   `--tone-`, `--surface-`, `--signal-`, hex colors, and `rgb(`, `hsl(`, `oklch(`. Read each hit in
   context; a match inside a comment or a semantic name that merely contains the text is not a
   violation.
2. Required checklist — for every component source `src/components/<name>.tsx` (not stories or tests), confirm `<name>.stories.tsx` exists
   with `tags: ["autodocs"]` and at least one `play`, that `registry/registry.json` has an entry whose
   `files` all exist, that the component sets `data-slot`, and that it defines its own `cn`.
3. Compound parts — where a component attaches parts (`Dialog.Title = …`), each part is also
   exported by name.
4. Release hygiene — read pending `.changeset/*.md`. Flag any `major`, and any changeset that
   describes an API change without starting with `Breaking change:`.

**Open agent issues.** List open `source:agent` issues. For each, re-run the check that produced it.
If the problem is gone, comment with the evidence and close the issue.

Do not file anything about issues or pull requests opened by people. The weekly report covers those.

## 2. Deduplicate

Fetch every `source:agent` issue, open and closed
(`gh api 'repos/beaket/ui/issues?state=all&labels=source:agent&per_page=100'`), and match each
finding against the `Fingerprint:` line in their bodies.

- An **open** match means the finding is already tracked. If there is materially new evidence (a
  new failing run, a new file), add one comment with it; otherwise do nothing.
- A match **closed in the last 30 days** means the maintainer may have decided against it. Do not
  reopen or refile; mention it in your run summary instead.
- **No match** means it is a candidate for a new issue.

## 3. Rank and file

Rank candidates: security, then a broken release flow, then failing CI on `main`, then guardrail
violations, then stuck dependencies. File **at most 3** new issues per run; mention the rest in the
run summary, and they will come up again next run.

Use the labels `source:agent`, one `area:*` (`area:ui`, `area:cli`, or `area:paper`), and a type
(`bug`, `perf`, `documentation`, or `security`) when one fits. Add `needs:maintainer` when the
finding needs a judgment the charter reserves for the maintainer. Never apply `agent:ready`,
`p1`–`p3`, `type:arch`, or `post-1.0`.

Issue title: imperative and specific — `Restore semantic token in Select trigger border`, not
`Guardrail violation found`.

Issue body:

```markdown
## What

One or two sentences: what is wrong and where.

## Evidence

Links to runs, `file:line` references, and short command output.

## Suspected cause

A concrete hypothesis naming the file or area, or "Unknown" with what you ruled out.

## Proposed fix

What a fix would change, and the regression test that would pin it. If the fix needs a decision,
say which decision, and quote the governing rule from DESIGN.md, PRODUCT.md, or git-rules.md.

## Readiness

Recommended labels: `p2`, `agent:ready` — or why this is not ready (for example: changes the public
contract; needs a design decision).

Fingerprint: <fingerprint>

<sub>Filed by Bunsen · triage run · YYYY-MM-DD</sub>
```

## 4. Summarize

End with the run summary described in [`README.md`](./README.md#rules-for-every-job): checks run,
findings, issues filed or updated or closed (with links), and candidates held back.
