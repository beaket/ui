import { defineConfig } from "@playwright/test";
import ime from "./playwright.ime.config";

// @beaket/paper perf harness (#482): keystroke latency on generated 1k/10k-line documents, against the
// same fixture and dev server as the IME suite. A separate config so latency sampling runs serially on
// its own command (`pnpm test:editor:perf`) and never shares a CPU with parallel IME workers.
export default defineConfig({
  ...ime,
  testMatch: /.*\.perf\.ts/,
  outputDir: "test-results/paper-perf",
  workers: 1,
  fullyParallel: false,
  timeout: 300_000,
});
