import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import type { BeaketConfig } from "./config.ts";

const THEME_START = "/* beaket:theme:start */";
const THEME_END = "/* beaket:theme:end */";
const LEGACY_MARKER = "Beaket UI Design System";
// All theme files end with the navigation-progress keyframe declaration
const LEGACY_END_MARKER = "@keyframes navigation-progress";

export function wrapThemeCss(css: string): string {
  return `${THEME_START}\n${css}${THEME_END}\n`;
}

/**
 * Find the end of a legacy theme block (no markers).
 * Themes end with `@keyframes navigation-progress { ... }`.
 * Returns the index just past the closing `}\n`, or -1 if not found.
 */
function findLegacyBlockEnd(css: string, searchFrom: number): number {
  const keyframeIdx = css.indexOf(LEGACY_END_MARKER, searchFrom);
  if (keyframeIdx === -1) {
    // No keyframe found — fall back to end of file
    return css.length;
  }
  // Find the closing `}` of the @keyframes block after the marker
  let depth = 0;
  let inBlock = false;
  for (let i = keyframeIdx; i < css.length; i++) {
    if (css[i] === "{") {
      depth++;
      inBlock = true;
    } else if (css[i] === "}") {
      depth--;
      if (inBlock && depth === 0) {
        // Skip trailing newline if present
        const end = css[i + 1] === "\n" ? i + 2 : i + 1;
        return end;
      }
    }
  }
  return css.length;
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

  // Try legacy marker (comment containing "Beaket UI Design System")
  const legacyIdx = existingCss.indexOf(LEGACY_MARKER);
  if (legacyIdx !== -1) {
    const commentStart = existingCss.lastIndexOf("/*", legacyIdx);
    if (commentStart !== -1) {
      const blockEnd = findLegacyBlockEnd(existingCss, commentStart);
      // Find preceding newline to avoid leaving a trailing blank line
      let cutPoint = commentStart;
      if (commentStart > 0 && existingCss[commentStart - 1] === "\n") {
        cutPoint = commentStart - 1;
      }
      const before = existingCss.substring(0, cutPoint);
      const after = existingCss.substring(blockEnd);
      return { css: before + "\n" + wrapped + after, replaced: true };
    }
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

  const legacyIdx = cssContent.indexOf(LEGACY_MARKER);
  if (legacyIdx !== -1) {
    const commentStart = cssContent.lastIndexOf("/*", legacyIdx);
    if (commentStart !== -1) {
      const blockEnd = findLegacyBlockEnd(cssContent, commentStart);
      return cssContent.substring(commentStart, blockEnd);
    }
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
  const themeName = config.theme || "porcelain";
  const themeCss = themeCssMap[themeName];

  if (!themeCss) {
    console.log(pc.yellow("!"), `Unknown theme "${themeName}". Skipping theme sync.`);
    return false;
  }

  if (!config.css) {
    console.log(pc.yellow("!"), "No CSS path in config. Skipping theme sync.");
    console.log("  Run", pc.cyan("npx @beaket/ui init"), "to set CSS path.");
    return false;
  }

  const cssPath = path.join(process.cwd(), config.css);

  if (!(await fs.pathExists(cssPath))) {
    console.log(pc.yellow("!"), `CSS file not found: ${config.css}. Skipping theme sync.`);
    return false;
  }

  const existingCss = await fs.readFile(cssPath, "utf-8");
  const existingTheme = extractThemeBlock(existingCss);

  // Check if theme is already up to date
  if (existingTheme !== null && existingTheme.trim() === themeCss.trim()) {
    console.log(pc.green("✔"), "Theme tokens are up to date.");
    return false;
  }

  if (existingTheme === null) {
    // No theme block found — always inject
    const { css } = replaceThemeInCss(existingCss, themeCss);
    await fs.writeFile(cssPath, css);
    console.log(pc.green("✔"), `Added ${themeName} theme tokens to ${config.css}`);
    return true;
  }

  // Theme exists but is outdated
  if (!options.overwrite) {
    const { confirm } = await prompts({
      type: "confirm",
      name: "confirm",
      message: `Theme tokens in ${config.css} are outdated. Update to latest ${themeName}?`,
      initial: true,
    });
    if (!confirm) {
      console.log(pc.yellow("ℹ"), "Skipped theme update.");
      return false;
    }
  }

  const { css } = replaceThemeInCss(existingCss, themeCss);
  await fs.writeFile(cssPath, css);
  console.log(pc.green("✔"), `Updated ${themeName} theme tokens in ${config.css}`);
  return true;
}
