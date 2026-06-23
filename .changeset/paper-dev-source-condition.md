---
"@beaket/paper": patch
---

Add a `source` export condition so monorepo consumers can resolve the package to its TypeScript source during local dev.

`exports[".".|"./react"].source` now points at `src/index.ts` / `src/react/index.ts`, ordered before `types`/`import`. Default resolvers (npm, Node, a normal Vite/webpack install) never request `source`, so installs are unchanged — they keep resolving `import → dist`, and the published tarball still ships `dist` only. A dev server that opts into the condition (`resolve.conditions: ["source"]`) instead compiles the package from source via the workspace symlink, enabling Fast Refresh on `@beaket/paper` edits with no rebuild.

No runtime or API change for consumers.
