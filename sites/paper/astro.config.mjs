// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Dev-only: resolve every `@beaket/*` workspace package to its TypeScript `source`
// (its package.json `exports[*].source` → `src/…`) instead of the built `dist/`.
// This puts the packages inside Vite's module graph, so editing e.g.
// `packages/paper/src/**` Fast-Refreshes the live demo with no rebuild.
//
// Why a `source` condition and not a hardcoded alias: it scales to the whole
// monorepo. Any present or future `@beaket/*` package that declares a `source`
// export is picked up automatically — this site config never changes as packages
// are added. `apply: "serve"` gates it to `astro dev`; the deploy build (docs.yml)
// omits the condition and falls through to `import` → `dist`, so the published
// site still exercises the real built artifact.
const beaketDevSource = {
  name: "beaket:dev-source-condition",
  apply: /** @type {const} */ ("serve"),
  config: () => ({ resolve: { conditions: ["source"] } }),
};

// Standalone Paper docs site, deployed as a sub-path of the existing beaket/ui
// GitHub Pages site → https://beaket.github.io/ui/paper. The Pages workflow builds
// this into docs/dist/paper (see .github/workflows/docs.yml). To move it later:
//  • custom domain (e.g. paper.beaket.dev) → set base: "/"
//  • separate beaket/paper repo → set base: "/"
export default defineConfig({
  site: "https://beaket.github.io",
  base: "/ui/paper",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [beaketDevSource],
    esbuild: { jsx: "automatic" },
    optimizeDeps: { include: ["react/jsx-runtime", "react/jsx-dev-runtime"] },
  },
});
