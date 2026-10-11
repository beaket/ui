# Growth and docs

Keep the public face of the project accurate and easy to find: the docs site, the README, the
community files, and how the project is described on GitHub and npm. Nobody adopts a library whose
docs are wrong.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first, then the
[desk throttle](./README.md#desk-throttle).

## 1. Docs accuracy

Use the component rotation from [`propose-dev.md`](./propose-dev.md#1-pick-this-weeks-components)
and add every component whose source changed on `main` in the last 14 days. For each:

- Compare the props, parts, and variants in the source with what its docs page under `docs/src/`
  and its `registry/registry.json` docs sections describe. A documented prop that does not exist,
  or an exported part the docs never mention, is a finding.
- Check that each example in the docs still compiles against the current API — read it, do not
  guess.
- Check internal links in the pages you read resolve to an existing route or heading.

Also read `README.md`, `docs/README.md`, and the installation page once per run, and check every
command and version in them against `packages/cli/package.json` and the CLI source.

## 2. Discoverability

- `gh api repos/beaket/ui/community/profile` — list what is missing (code of conduct, issue
  templates, pull request template). `SECURITY.md` belongs to the security desk; leave it.
- The repository description and topics (`gh api repos/beaket/ui --jq '{description, topics}'`)
  against `npm view @beaket/ui description keywords` and the opening of `PRODUCT.md`. They should
  describe the same product in the same words.
- Trend: `curl -s https://api.npmjs.org/downloads/range/last-month/@beaket/ui` (and
  `@beaket/paper`), stars, and forks. These go in the run summary for the weekly report, not in an
  issue.

## 3. Releases

If a release was published in the last 7 days, check that its notes read well to someone outside
the project: what changed, who should upgrade, and the migration for any `Breaking change:`. A
release with unreadable notes is a finding against the changesets that produced it.

## 4. File

Deduplicate exactly as [`triage.md`](./triage.md#2-deduplicate) does. File **at most 3** issues per
run; mention the rest in the run summary.

Labels: `source:agent`, `desk:growth`, `documentation`, and one `area:*`. Fingerprint prefix:
`growth:` (for example `growth:docs:select:prop-placeholder-undocumented`). Use the issue body from
[`triage.md`](./triage.md#3-rank-and-file).

## 5. Documentation pull request

A documentation-only fix — a typo, a broken link, an example or prop table that no longer matches
the code — goes straight to a pull request instead of an issue; the charter allows it without
`agent:ready`. Open **at most one** per run, bundling this run's fixes on a branch named
`agent/docs-YYYY-MM-DD`.

- Only files under `docs/`, `sites/`, `README.md`, and `packages/*/README.md`. Never the files the
  charter reserves for the maintainer, and never component source, even to fix a doc comment.
- Run `npx prettier --check` on the files you changed, and `pnpm --filter docs build` when you
  touched `docs/`.
- No changeset; docs are not a published package.
- Title `docs: …`; body lists each fix with the evidence that it was wrong, and ends with
  `<sub>Opened by Bunsen · growth run · YYYY-MM-DD</sub>`.

Anything that needs judgment — rewording the pitch, restructuring a page — is an issue, not a pull
request.

## 6. Drafts for the maintainer

If a release was published in the last 7 days, write an announcement draft as an issue in
`beaket/bunsen`: title `Draft: @beaket/ui <version> announcement`, labeled `beaket/ui` and `draft`.
Give a short post (under 280 characters) and a longer one (three short paragraphs), both in the
project's voice from `PRODUCT.md`, with the release link. The maintainer edits and posts it, or
closes the issue.

End with the run summary described in [`README.md`](./README.md#rules-for-every-job), including the
download and star figures.
