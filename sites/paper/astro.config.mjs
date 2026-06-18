// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Standalone Paper docs site. Deploy target is not yet wired — when it is:
//  • separate `beaket/paper` repo on GitHub Pages → set base: "/paper"
//  • custom domain (e.g. paper.beaket.dev) → leave base: "/"
// Adjust `site`/`base` to match. Defaults below assume the GitHub Pages /paper path.
export default defineConfig({
  site: "https://beaket.github.io",
  base: "/paper",
  output: "static",
  integrations: [react()],
  vite: {
    esbuild: { jsx: "automatic" },
    optimizeDeps: { include: ["react/jsx-runtime", "react/jsx-dev-runtime"] },
  },
});
