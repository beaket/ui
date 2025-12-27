// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://beaket.github.io",
  base: "/ui",
  output: "static",
  integrations: [
    react({
      include: ["**/src/components/*.tsx", "**/src/components/*.stories.tsx"],
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "gruvbox-dark-soft",
    },
  },
  vite: {
    // @ts-expect-error - Vite version mismatch between root (7.x) and Astro (6.x)
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../src"),
      },
    },
    esbuild: {
      jsx: "automatic",
    },
    optimizeDeps: {
      include: ["react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  },
});
