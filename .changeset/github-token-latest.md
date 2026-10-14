---
"@beaket/ui": patch
---

`--latest` now sends `GITHUB_TOKEN`, when set, with the GitHub API request that resolves `main` to a commit. Anonymous requests share a 60-per-hour limit per IP, so on CI runners and shared networks `add`, `diff` and `list` with `--latest` could fail with `HTTP 403`. The token is sent only to `api.github.com`, never to the raw file host.
