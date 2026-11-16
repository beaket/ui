---
"@beaket/ui": patch
---

Fix `add` re-installing dependencies the project already declares. The command passed every component dependency to the package manager by bare name without reading `package.json`, so pinned ranges such as `clsx@2.0.0` were re-resolved to `latest` on every run. It now skips names present in `dependencies`, `devDependencies` or `peerDependencies`, and skips the install entirely when none are left.
