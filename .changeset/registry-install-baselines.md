---
"@beaket/ui": minor
---

Pin registry downloads to the CLI release tag. Use --registry-ref to select a tag or commit, or --latest to explicitly resolve main to a commit. Missing release tags fail with explicit fallback guidance instead of silently fetching main.

Record the registry ref, SHA-256 hash and CLI version for each installed file in beaket.ui.json, preserving existing baselines when local changes are skipped. Diff compares the recorded baseline, local source and target release, verifies baseline hashes, and separates local customizations from upstream changes. Exit codes are 0 for clean/local-only, 1 for mergeable updates, 2 for conflicts, and 3 for unknown baselines or errors. Comparing changes on both sides requires Git. Overwrite remains an explicit replacement with backups; automatic merging is deferred.
