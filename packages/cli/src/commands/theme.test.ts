import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import prompts from "prompts";
import { afterEach, expect, it, vi } from "vitest";
import { contentHash } from "../utils/config.ts";
import { extractThemeBlock, wrapThemeCss } from "../utils/theme.ts";
import { init } from "./init.ts";
import { theme } from "./theme.ts";

vi.mock("../utils/themes.ts", () => ({
  THEME_CSS: { solace: ":root { color: blue; }\n", tobacco: ":root { color: brown; }\n" },
  VALID_THEMES: ["solace", "tobacco"],
}));

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = 0;
});

it("keeps config and CSS together when theme replacement is refused or accepted", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-theme-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const config = JSON.stringify({ components: "ui", css: "style.css", theme: "solace" });
  const original = wrapThemeCss(":root { color: custom; }\n") + "body { margin: 0; }\n";
  try {
    await writeFile(path.join(directory, "beaket.ui.json"), config);
    await writeFile(path.join(directory, "style.css"), original);
    for (const options of [{ diff: true }, { dryRun: true }]) {
      await theme({ ...options, theme: "tobacco", overwrite: true });
      expect(await readFile(path.join(directory, "style.css"), "utf8")).toBe(original);
      expect(await readFile(path.join(directory, "beaket.ui.json"), "utf8")).toBe(config);
      expect(await readdir(directory)).toEqual(["beaket.ui.json", "style.css"]);
    }
    prompts.inject([false]);
    await theme({ theme: "tobacco" });
    expect(await readFile(path.join(directory, "beaket.ui.json"), "utf8")).toBe(config);
    expect(await readFile(path.join(directory, "style.css"), "utf8")).toBe(original);
    await init({ yes: true, theme: "tobacco" });
    expect(process.exitCode).toBe(1);
    expect(await readFile(path.join(directory, "beaket.ui.json"), "utf8")).toBe(config);
    await theme({ theme: "tobacco", overwrite: true });
    expect(JSON.parse(await readFile(path.join(directory, "beaket.ui.json"), "utf8")).theme).toBe(
      "tobacco",
    );
    expect(await readFile(path.join(directory, "style.css.bak"), "utf8")).toBe(original);
    expect(await readFile(path.join(directory, "style.css"), "utf8")).toContain(
      "body { margin: 0; }",
    );
    const savedConfig = await readFile(path.join(directory, "beaket.ui.json"), "utf8");
    const savedCss = await readFile(path.join(directory, "style.css"), "utf8");
    expect(JSON.parse(savedConfig).themeHash).toBe(contentHash(extractThemeBlock(savedCss)!));
    await writeFile(path.join(directory, "style.css"), savedCss.replace("brown", "custom"));
    prompts.inject([false]);
    await theme({});
    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      "Managed theme block has local edits.",
    );
    expect(await readFile(path.join(directory, "beaket.ui.json"), "utf8")).toBe(savedConfig);
    expect(await readFile(path.join(directory, "style.css"), "utf8")).toContain("custom");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
