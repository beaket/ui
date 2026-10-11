# Security

Check the repository's security signals and its supply chain, and make sure nothing sits unnoticed.
This is a public repository: what you write is public too, so you report that something needs
attention without publishing how to exploit it.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first. The desk
throttle does not apply here; a real security finding is always filed. This desk runs every weekday
and may open pull requests, but only for the security fixes in step 4.

## 1. Alerts

Read each of these. A `403` or `404` means the workflow's token cannot see that list; write `n/a`
for it and name it in the run summary.

- `gh api 'repos/beaket/ui/dependabot/alerts?state=open'`
- `gh api 'repos/beaket/ui/code-scanning/alerts?state=open'`
- `gh api 'repos/beaket/ui/secret-scanning/alerts?state=open'`

A finding is any open alert. For each, record its number, severity, age, and whether Renovate has
an open pull request that fixes it.

## 2. Supply chain

Read every file in `.github/workflows/` and check:

- Each workflow sets a top-level `permissions` block, and no job asks for more than it uses.
- No `pull_request_target` or `workflow_run` job checks out and runs pull request code.
- No `run:` step interpolates untrusted text directly (`${{ github.event.issue.title }}`,
  `...comment.body`, `...head_ref`); it should pass through `env:`.
- Third-party actions are pinned. Note which are pinned to a tag rather than a commit SHA; that is
  a policy question for the maintainer, so raise it once and then only for newly added actions.
- The npm publish in `release.yml` still produces provenance.

Then check the repository's policy files: `SECURITY.md` exists and says how to report a
vulnerability privately, and private vulnerability reporting is enabled
(`gh api repos/beaket/ui/private-vulnerability-reporting`).

## 3. File

Deduplicate exactly as [`triage.md`](./triage.md#2-deduplicate) does. Labels: `source:agent`,
`desk:security`, `security`, and `needs:maintainer` when a decision is needed. Fingerprint prefix:
`security:`.

What may go in a public issue depends on the finding:

| Finding                                                          | Public issue says                                                                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Dependabot alert (a published advisory in a dependency)          | The package, advisory ID, severity, fixed version, and whether a Renovate PR exists                              |
| Code scanning or secret scanning alert (may be undisclosed)      | Only "Alert #N needs review", its severity and age, and the alert link. Details go to `beaket/bunsen`.           |
| Workflow or policy weakness that is not exploitable on its own   | The full finding with the proposed diff                                                                          |
| Anything you believe is exploitable in this repository right now | Nothing public. File the details as an issue in the private `beaket/bunsen`, labeled `beaket/ui` and `security`. |

Never paste a secret, even a revoked one, and never describe an exploit path.

## 4. Ship security fixes

Security fixes do not wait for the weekly release. For a Dependabot alert in a dependency that a
published package ships to users — a `dependencies` entry in `packages/cli/package.json` or
`packages/paper/package.json`, not a dev dependency and not the docs site:

1. **Get the fix onto `main`.** If Renovate has an open pull request for it, leave it to Renovate
   and note it. If there is none, open one yourself on `agent/security-<package>`: the smallest
   version bump that clears the advisory, the updated lockfile from `pnpm install`, and a `patch`
   changeset whose description starts with `Security:` and names the advisory ID. Only patch and
   minor bumps; a major bump of the dependency is a `needs:maintainer` issue instead.
2. **Make sure it releases.** Once the fix is on `main`, check that a pending changeset covers it
   (Renovate's pull requests carry none). If none does, open a pull request that adds only the
   `Security:` changeset.
3. **Escalate the release.** When a `Security:` changeset is pending on `main`, file one issue —
   title `Release the security fix for <advisory ID>`, labels `source:agent`, `desk:security`,
   `security`, `needs:maintainer`, `p1` recommended in the body — linking the release pull request.
   If the release pull request also carries a breaking change, say so in the issue: the maintainer
   must either ship both or release the fix separately.

## 5. Summarize

End with the run summary described in [`README.md`](./README.md#rules-for-every-job), including the
open-alert count per list.
