import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { styleText } from "node:util";
import path from "path";
import prompts from "prompts";
import type { BeaketConfig } from "./config.ts";
import { backupFile } from "./files.ts";

const THEME_START = "/* beaket:theme:start */";
const THEME_END = "/* beaket:theme:end */";

export function wrapThemeCss(css: string): string {
  return `${THEME_START}\n${css}${THEME_END}\n`;
}

export function replaceThemeInCss(
  existingCss: string,
  newThemeCss: string,
): { css: string; replaced: boolean } {
  const wrapped = wrapThemeCss(newThemeCss);

  // Try marker-based replacement first
  const startIdx = existingCss.indexOf(THEME_START);
  const endIdx = existingCss.indexOf(THEME_END);

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const before = existingCss.substring(0, startIdx);
    const afterEnd = endIdx + THEME_END.length;
    // Skip trailing newline after end marker
    const after =
      existingCss[afterEnd] === "\n"
        ? existingCss.substring(afterEnd + 1)
        : existingCss.substring(afterEnd);
    return { css: before + wrapped + after, replaced: true };
  }

  // No existing theme — append
  const separator = existingCss.endsWith("\n") ? "\n" : "\n\n";
  return { css: existingCss + separator + wrapped, replaced: false };
}

export function extractThemeBlock(cssContent: string): string | null {
  const startIdx = cssContent.indexOf(THEME_START);
  const endIdx = cssContent.indexOf(THEME_END);

  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    const contentStart = startIdx + THEME_START.length;
    // Skip leading newline after start marker
    const adjustedStart = cssContent[contentStart] === "\n" ? contentStart + 1 : contentStart;
    return cssContent.substring(adjustedStart, endIdx);
  }

  return null;
}

interface SyncThemeOptions {
  overwrite?: boolean;
}

export async function syncTheme(
  config: BeaketConfig,
  themeCssMap: Record<string, string>,
  options: SyncThemeOptions = {},
): Promise<boolean> {
  const themeName = config.theme || "solace";
  const themeCss = themeCssMap[themeName];

  if (!themeCss) {
    console.log(styleText("yellow", "!"), `Unknown theme "${themeName}". Skipping theme sync.`);
    return false;
  }

  if (!config.css) {
    console.log(styleText("yellow", "!"), "No CSS path in config. Skipping theme sync.");
    console.log("  Run", styleText("cyan", "npx @beaket/ui init"), "to set CSS path.");
    return false;
  }

  const cssPath = path.join(process.cwd(), config.css);

  if (!existsSync(cssPath)) {
    console.log(
      styleText("yellow", "!"),
      `CSS file not found: ${config.css}. Skipping theme sync.`,
    );
    return false;
  }

  const existingCss = await readFile(cssPath, "utf-8");
  const existingTheme = extractThemeBlock(existingCss);

  // Check if theme is already up to date
  if (existingTheme !== null && existingTheme.trim() === themeCss.trim()) {
    console.log(styleText("green", "✔"), "Theme tokens are up to date.");
    return true;
  }

  if (existingTheme === null) {
    // No theme block found — always inject
    const { css } = replaceThemeInCss(existingCss, themeCss);
    await writeFile(cssPath, css);
    console.log(styleText("green", "✔"), `Added ${themeName} theme tokens to ${config.css}`);
    return true;
  }

  // Theme exists but is outdated
  if (!options.overwrite) {
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Replace theme tokens in ${config.css} with ${themeName}? Local token edits will be replaced (a backup is saved).`,
      initial: false,
    });
    if (!confirm) {
      console.log(styleText("yellow", "ℹ"), "Skipped theme update.");
      return false;
    }
  }

  const { css } = replaceThemeInCss(existingCss, themeCss);
  await backupFile(cssPath);
  await writeFile(cssPath, css);
  console.log(styleText("green", "✔"), `Updated ${themeName} theme tokens in ${config.css}`);
  return true;
}
