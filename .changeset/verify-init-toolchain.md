---
"@beaket/ui": patch
---

Check bundler aliases and Tailwind v4/plugin setup during init instead of reporting
an unverified project as ready. Offer a backed-up, confirmed Vite 8 native paths
edit for simple configs; preserve toolchain files under --yes and print manual
instructions for unsupported or conflicting configurations.
