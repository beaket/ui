// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: "https://beaket.github.io",
  base: "/ui",
  output: "static",
  integrations: [
    react({
      include: [
        "**/src/components/*.tsx",
        "**/src/components/*.stories.tsx",
        "**/src/examples/**/*.tsx",
      ],
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          content: { type: "text", value: "#" },
          properties: { className: ["heading-anchor"] },
        },
      ],
    ],
  },
  vite: {
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
