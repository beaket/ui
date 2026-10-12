# Release review

Once a week, decide whether the release pull request is ready to ship. You run as Beaket Bunsen
Reviewer. You never merge, but your approval releases: the merge step merges an approved release
pull request once its checks pass, and merging publishes to npm. A release with a `major` bump or a
`Breaking change:` is the maintainer's decision, so it gets a comment, never an approval.

Releases are weekly: the **Release** workflow rebuilds the release pull request on Thursday and
starts this review. The one exception is a security fix, which the security desk escalates the day
it lands (see [`security.md`](./security.md#4-ship-security-fixes)); the maintainer then runs the
Release workflow by hand, which rebuilds the pull request and starts this review the same way.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first.

## 1. Find it

`gh pr list --repo beaket/ui --head changeset-release/main --state open`. If there is none, there is
nothing to release; end the run saying so.

## 2. Read

- Every pending changeset on `main` (`.changeset/*.md`, not `README.md` or `config.json`). For each:
  the package, the bump, whether it starts with `Breaking change:`, and whether it is a security
  fix (starts with `Security:`).
- The release pull request's diff: version bumps and generated changelog entries.
- Its check results. The release pull request gets a synthetic `check`; `screenshots` must pass.
  You run minutes after the rebuild, so most checks are still running or waiting for the
  maintainer to approve the run. The merge step waits for every check, so judge the content and
  hold back only for a check that has failed.
- The previous release (`gh release list --repo beaket/ui --limit 1`) and its date.

## 3. Verdict

| Situation                                                 | Verdict                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `major` bump or any `Breaking change:` changeset        | **Needs a decision.** List each breaking change with its migration note; flag any whose migration is missing or unclear. Comment, do not approve. |
| No breaking change, no failed check, changelog reads well | **Ready to release.** Approve with a summary: what ships, who should upgrade, and anything worth announcing.                                      |
| No breaking change, but checks fail or notes are unclear  | **Needs changes.** Name the failing check or the changeset to rewrite. Request changes.                                                           |

Post it on the release pull request with `gh pr review <number> --body-file <file>` and the flag
from [`review.md`](./review.md#3-verdict). Write for someone deciding in thirty seconds: lead with the
verdict and the version numbers.

End with the footer `<sub>Release review by Bunsen · YYYY-MM-DD</sub>` and the run summary
described in [`README.md`](./README.md#rules-for-every-job).
