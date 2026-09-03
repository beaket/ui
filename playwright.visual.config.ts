import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: /.*\.visual\.spec\.ts/,
  outputDir: "test-results/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
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
