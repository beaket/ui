// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

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
    esbuild: { jsx: "automatic" },
    optimizeDeps: { include: ["react/jsx-runtime", "react/jsx-dev-runtime"] },
  },
});
