import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { paletteVariants } from "../src/themes/theme-css.ts";

const root = resolve(import.meta.dirname, "..");
const directory = mkdtempSync(join(tmpdir(), "beaket-theme-consumer-"));
const cssPath = join(directory, "src/index.css");
const browser = await chromium.launch();
const page = await browser.newPage();
const themes = ["solace", "porcelain", "tobacco", "marigold", "eucalyptus"];
const cli = (...args) =>
  execFileSync(process.execPath, [join(root, "packages/cli/dist/index.js"), ...args], {
    cwd: directory,
    stdio: "pipe",
  });

async function checkSchemes(css, palette, overrides = false) {
  await page.setContent(
    `<style>${css}</style><div id="motion" style="animation: pulse 10s infinite; transition: opacity 3s"></div><style>@keyframes pulse { to { opacity: .5 } }</style>`,
  );
  for (const os of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: os, reducedMotion: "reduce" });
    for (const preference of ["system", "light", "dark"]) {
      await page.evaluate((value) => {
        if (value === "system") document.documentElement.removeAttribute("data-theme");
        else document.documentElement.dataset.theme = value;
      }, preference);
      const scheme = preference === "system" ? os : preference;
      const style = await page.evaluate(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        const motion = getComputedStyle(document.getElementById("motion"));
        return {
          surface: rootStyle.getPropertyValue("--surface-0").trim(),
          accent: rootStyle.getPropertyValue("--signal-accent").trim(),
          scheme: rootStyle.colorScheme,
          animation: motion.animationDuration,
          iterations: motion.animationIterationCount,
          transition: motion.transitionDuration,
        };
      });
      assert.equal(style.surface, palette[scheme].get("--surface-0"));
      assert.equal(style.scheme, scheme);
      assert.equal(
        style.accent,
        overrides
          ? scheme === "dark"
            ? "#aabbcc"
            : "#112233"
          : palette[scheme].get("--signal-accent"),
      );
      assert(Number.parseFloat(style.animation) <= 0.00001);
      assert(Number.parseFloat(style.transition) <= 0.00001);
      assert.equal(style.iterations, "1");
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  assert.equal(
    await page
      .locator("#motion")
      .evaluate((element) => getComputedStyle(element).animationDuration),
    "10s",
  );
}

try {
  mkdirSync(join(directory, "src"));
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({ name: "theme-consumer", devDependencies: { typescript: "6.0.3" } }),
  );
  writeFileSync(
    join(directory, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
  );
  writeFileSync(cssPath, '@import "tailwindcss";\n');
  cli("init", "--yes");
  for (const name of themes) {
    cli("theme", "--theme", name, "--overwrite");
    const css = readFileSync(cssPath, "utf8");
    assert(css.includes("DO NOT EDIT"));
    assert(!css.includes("--space-"));
    const palette = paletteVariants(readFileSync(join(root, `src/themes/${name}.css`), "utf8"));
    await checkSchemes(css, palette);
    const branded = css
      .replace("/* --signal-accent: your-light-brand-color; */", "--signal-accent: #112233;")
      .replaceAll("/* --signal-accent: your-dark-brand-color; */", "--signal-accent: #aabbcc;");
    await checkSchemes(branded, palette, true);
  }
  const original = readFileSync(cssPath, "utf8");
  const branded = original
    .replace("/* --signal-accent: your-light-brand-color; */", "--signal-accent: #112233;")
    .replaceAll("/* --signal-accent: your-dark-brand-color; */", "--signal-accent: #aabbcc;");
  writeFileSync(cssPath, branded);
  cli("theme", "--theme", "solace", "--overwrite");
  await checkSchemes(
    readFileSync(cssPath, "utf8"),
    paletteVariants(readFileSync(join(root, "src/themes/solace.css"), "utf8")),
    true,
  );
  console.log(
    "All five generated themes: 3 preferences × 2 OS schemes, override specificity, sync preservation and reduced motion passed.",
  );
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
