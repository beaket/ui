import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = "http://127.0.0.1:4321/ui/";
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const server = spawn(
  "pnpm",
  ["--filter", "docs", "exec", "astro", "preview", "--host", "127.0.0.1", "--port", "4321"],
  {
    stdio: "ignore",
    detached: true,
  },
);
let browser;

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      if ((await fetch(baseURL, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Docs preview server did not start within 30 seconds.");
}

async function scan(page, name, selector) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(250);
  console.log(`Scanning ${name}`);
  const result = await new AxeBuilder({ page }).include(selector).withTags(tags).analyze();
  console.log(`Scanned ${name}`);
  return { name, url: page.url(), ...result };
}

try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  const results = [];

  await page.goto(`${baseURL}installation`);
  results.push(await scan(page, "documentation-navigation", ".sidebar"));

  await page.getByRole("link", { name: "Dialog", exact: true }).click();
  await page.getByRole("button", { name: "Open Dialog" }).click();
  await page.getByRole("dialog").waitFor();
  results.push(await scan(page, "dialog-open", '[role="dialog"]'));

  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/docs-a11y.json", `${JSON.stringify({ tags, results }, null, 2)}\n`);

  const violations = results.flatMap((result) =>
    result.violations.map((violation) => `${result.name}: ${violation.id}`),
  );
  if (violations.length) throw new Error(`Axe violations found:\n${violations.join("\n")}`);
} finally {
  await browser?.close();
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") console.warn("Could not stop docs preview server:", error);
  }
}
