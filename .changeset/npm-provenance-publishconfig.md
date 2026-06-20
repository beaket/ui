---
"@beaket/paper": patch
"@beaket/ui": patch
---

Attach npm provenance attestations on publish. Root cause of the missing attestations across 0.2.0–0.4.0: the repo-root `.npmrc` carried `provenance=true`, but `changeset publish` runs the publish from each package's own directory, and npm/pnpm only read the `.npmrc` in the current working directory (plus user/global) — they don't walk up to the workspace-root file, so the flag was never seen. The fix moves it to `publishConfig.provenance: true` in each published package's `package.json`, which is read at publish time wherever the command runs (combined with the existing `id-token: write` in the release workflow).
