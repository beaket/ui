import { defineConfig } from "vitest/config";

// CodeMirror's decoration/transaction logic runs headless in jsdom; the CM6
// layout-measurement polyfills live in src/test/setup.ts (ADR-0005: coordinate
// and visual concerns are carved out for browser verification).
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
