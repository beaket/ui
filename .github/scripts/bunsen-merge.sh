#!/usr/bin/env bash
# Merge a Bunsen pull request, or the release pull request, that Beaket Bunsen Reviewer approved.
#
# The maintainer's rule (docs/MAINTENANCE.md § Merging): these pull requests merge without the
# maintainer once the reviewer has approved the exact head commit and the required checks pass. A
# `major` bump or a `Breaking change:` waits for the maintainer. GitHub enforces the required checks;
# this script enforces the rest. No model decides here, and running it again is harmless.
#
# Usage: bunsen-merge.sh <pull request number>, with GH_TOKEN from Beaket Bunsen (it can merge).
set -euo pipefail

pr=$1
repo=beaket/ui
reviewer="beaket-bunsen-reviewer[bot]"

say() { echo "#$pr: $*" | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"; }

read -r state draft head branch author < <(gh pr view "$pr" --repo "$repo" \
  --json state,isDraft,headRefOid,headRefName,author \
  --jq '"\(.state) \(.isDraft) \(.headRefOid) \(.headRefName) \(.author.login)"')

if [ "$state" != OPEN ] || [ "$draft" = true ]; then
  say "$state, draft: $draft. Nothing to merge."
  exit 0
fi
case "$author $branch" in
  "app/beaket-bunsen agent/"* | "app/github-actions changeset-release/main") ;;
  *)
    say "not a Bunsen or release pull request ($author, $branch). Left for the maintainer."
    exit 0
    ;;
esac

# Added lines in changesets, and in the changelogs the release pull request generates: a `major`
# bump in changeset front matter, a `### Major Changes` heading, or `Breaking change:` anywhere.
# A Bunsen pull request's changelog edits only correct past notes, which may quote an old breaking
# change, so they are not read. A file too large to diff counts as breaking: fail toward the
# maintainer.
files='^\\.changeset/.+\\.md$' # a regex inside a jq string, hence the doubled backslashes
if [ "$branch" = changeset-release/main ]; then files+='|(^|/)CHANGELOG\\.md$'; fi
breaking=$(gh api "repos/$repo/pulls/$pr/files" --paginate --jq '
  .[] | select(.filename | test("'"$files"'"))
  | select(.filename != ".changeset/README.md") | . as $f
  | if .patch == null then "\($f.filename): no diff to read"
    else .patch | split("\n")[] | select(startswith("+"))
      | select(test("breaking change|^\\+#+ *major changes|^\\+ *[\"'\'']?[@a-z0-9/._-]+[\"'\'']? *: *[\"'\'']?major[\"'\'']? *$"; "i"))
      | "\($f.filename): \(.)"
    end')
if [ -n "$breaking" ]; then
  say "carries a major or breaking change. Left for the maintainer:"
  echo "$breaking" | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"
  exit 0
fi

# The reviewer's latest review is its verdict. It must approve the commit being merged, so a push
# after the approval needs a new one.
verdict=$(gh api "repos/$repo/pulls/$pr/reviews" --paginate \
  --jq ".[] | select(.user.login == \"$reviewer\") | \"\(.state) \(.commit_id)\"" | tail -n 1)
if [ "$verdict" != "APPROVED $head" ]; then
  say "no reviewer approval of ${head:0:7} (latest review: ${verdict:-none}). Not merging."
  exit 0
fi

# Every check, not only the required ones: a docs pull request is judged by checks the ruleset does
# not require. Whatever finishes the last check runs this script again (.github/workflows/
# bunsen-merge.yml).
IFS=$'\t' read -r failed pending < <(gh pr view "$pr" --repo "$repo" --json statusCheckRollup --jq '
  [.statusCheckRollup[] | {name: (.name // .context), result: (.conclusion // .state // ""), status: (.status // "")}]
  | [ (map(select(.result | test("FAILURE|ERROR|CANCELLED|TIMED_OUT|ACTION_REQUIRED|STARTUP_FAILURE|STALE")))),
      (map(select(.status != "COMPLETED" and (.result | test("SUCCESS|NEUTRAL|SKIPPED") | not)))) ]
  | map(map(.name) | unique | join(", ") | if . == "" then "-" else . end) | join("\t")')
if [ "$failed" != - ]; then
  say "approved, but checks failed: $failed. Not merging."
  exit 0
fi
if [ "$pending" != - ]; then
  say "approved; waiting for checks: $pending."
  exit 0
fi

if out=$(gh pr merge "$pr" --repo "$repo" --squash --match-head-commit "$head" 2>&1); then
  say "merged ${head:0:7}."
else
  say "approved but not mergeable yet: $out"
fi
