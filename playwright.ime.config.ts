import { defineConfig, devices } from "@playwright/test";

// @beaket/paper IME e2e (#1176): drives Chromium's real composition pipeline through CDP
// Input.imeSetComposition, the step past jsdom that ADR-0005 names. Chromium only — WebKit and
// Firefox expose no CDP IME API; the OS-IME layer is #483's manual Korean spot-check.
export default defineConfig({
  testDir: "packages/paper/e2e",
  testMatch: /.*\.e2e\.ts/,
  outputDir: "test-results/paper-ime",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:5179/" },
  webServer: {
    command: "pnpm exec vite --config packages/paper/e2e/vite.config.ts",
    url: "http://127.0.0.1:5179/",
    reuseExistingServer: !process.env.CI,
  },
});
