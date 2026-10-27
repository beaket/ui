import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: /.*\.(visual|a11y)\.spec\.ts/,
  outputDir: "test-results/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    // pixelmatch tolerates a colour delta up to 35215 × threshold². The default 0.2
    // lets a flat grey move 52 levels unnoticed; 0.1 cuts that to 26 (#994).
    toHaveScreenshot: { threshold: 0.1 },
  },
  webServer: [
    {
      command: "python3 -m http.server 6006 --bind 127.0.0.1 --directory storybook-static",
      url: "http://127.0.0.1:6006/",
      reuseExistingServer: !process.env.CI,
    },
    {
      // Astro 7's preview command daemonizes itself, which Playwright treats as an early exit.
      command:
        "ln -sfn . docs/dist/ui && python3 -m http.server 4322 --bind 127.0.0.1 --directory docs/dist",
      url: "http://127.0.0.1:4322/ui/",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
