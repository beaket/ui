/**
 * Extracts design tokens from src/themes/*.css and generates
 * docs/src/data/theme-tokens.json — the single derived artifact
 * consumed by the docs site (theme-switcher, tokens page, theme-demo).
 *
 * Source of truth: src/themes/*.css (@theme blocks + dark-mode overrides).
 * Code-highlight tokens (--astro-code-*) are docs-specific and defined here.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = path.resolve(__dirname, "../../src/themes");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/theme-tokens.json");

// ---------------------------------------------------------------------------
// Code-highlight tokens (docs-specific, not in theme CSS)
// ---------------------------------------------------------------------------
const codeHighlightTokens: Record<string, Record<string, string>> = {
  porcelain: {
    "--astro-code-foreground": "#080b10",
    "--astro-code-background": "#f3f4f6",
    "--astro-code-token-keyword": "#0858a8",
    "--astro-code-token-string": "#067060",
    "--astro-code-token-string-expression": "#067060",
    "--astro-code-token-comment": "#686b70",
    "--astro-code-token-function": "#6a1b9a",
    "--astro-code-token-constant": "#006d76",
    "--astro-code-token-parameter": "#080b12",
    "--astro-code-token-punctuation": "#686b70",
    "--astro-code-token-link": "#0858a8",
  },
  "porcelain-dark": {
    "--astro-code-foreground": "#dce0e6",
    "--astro-code-background": "#0e1016",
    "--astro-code-token-keyword": "#40b0ff",
    "--astro-code-token-string": "#00e088",
    "--astro-code-token-string-expression": "#00e088",
    "--astro-code-token-comment": "#6c7488",
    "--astro-code-token-function": "#b070ff",
    "--astro-code-token-constant": "#00d4e8",
    "--astro-code-token-parameter": "#dce0e6",
    "--astro-code-token-punctuation": "#6c7486",
    "--astro-code-token-link": "#40b0ff",
  },
  tobacco: {
    "--astro-code-foreground": "#1a1a18",
    "--astro-code-background": "#edece6",
    "--astro-code-token-keyword": "#2e4a8c",
    "--astro-code-token-string": "#a84020",
    "--astro-code-token-string-expression": "#a84020",
    "--astro-code-token-comment": "#5e5d54",
    "--astro-code-token-function": "#6a3898",
    "--astro-code-token-constant": "#186058",
    "--astro-code-token-parameter": "#1a1a18",
    "--astro-code-token-punctuation": "#5e5d54",
    "--astro-code-token-link": "#2e4a8c",
  },
  "tobacco-dark": {
    "--astro-code-foreground": "#e2e0d6",
    "--astro-code-background": "#141312",
    "--astro-code-token-keyword": "#7090ee",
    "--astro-code-token-string": "#f06040",
    "--astro-code-token-string-expression": "#f06040",
    "--astro-code-token-comment": "#787468",
    "--astro-code-token-function": "#d070b8",
    "--astro-code-token-constant": "#40d8b0",
    "--astro-code-token-parameter": "#e2e0d6",
    "--astro-code-token-punctuation": "#787468",
    "--astro-code-token-link": "#7090ee",
  },
  marigold: {
    "--astro-code-foreground": "#121212",
    "--astro-code-background": "#f0f0f0",
    "--astro-code-token-keyword": "#0044ee",
    "--astro-code-token-string": "#c03010",
    "--astro-code-token-string-expression": "#c03010",
    "--astro-code-token-comment": "#5a5a5a",
    "--astro-code-token-function": "#6820b8",
    "--astro-code-token-constant": "#007a88",
    "--astro-code-token-parameter": "#121212",
    "--astro-code-token-punctuation": "#5a5a5a",
    "--astro-code-token-link": "#0044ee",
  },
  "marigold-dark": {
    "--astro-code-foreground": "#ececec",
    "--astro-code-background": "#161616",
    "--astro-code-token-keyword": "#4488ff",
    "--astro-code-token-string": "#ff4838",
    "--astro-code-token-string-expression": "#ff4838",
    "--astro-code-token-comment": "#999999",
    "--astro-code-token-function": "#bb55ff",
    "--astro-code-token-constant": "#00ccdd",
    "--astro-code-token-parameter": "#ececec",
    "--astro-code-token-punctuation": "#999999",
    "--astro-code-token-link": "#4488ff",
  },
  eucalyptus: {
    "--astro-code-foreground": "#162036",
    "--astro-code-background": "#eff2f8",
    "--astro-code-token-keyword": "#1240cc",
    "--astro-code-token-string": "#047857",
    "--astro-code-token-string-expression": "#047857",
    "--astro-code-token-comment": "#5a6d88",
    "--astro-code-token-function": "#6828e0",
    "--astro-code-token-constant": "#9a5c00",
    "--astro-code-token-parameter": "#162036",
    "--astro-code-token-punctuation": "#5a6d88",
    "--astro-code-token-link": "#1240cc",
  },
  "eucalyptus-dark": {
    "--astro-code-foreground": "#dce2ec",
    "--astro-code-background": "#0c1020",
    "--astro-code-token-keyword": "#5080ff",
    "--astro-code-token-string": "#20e0a0",
    "--astro-code-token-string-expression": "#20e0a0",
    "--astro-code-token-comment": "#687288",
    "--astro-code-token-function": "#b878ff",
    "--astro-code-token-constant": "#ffb830",
    "--astro-code-token-parameter": "#dce2ec",
    "--astro-code-token-punctuation": "#687288",
    "--astro-code-token-link": "#5080ff",
  },
};

// ---------------------------------------------------------------------------
// CSS parsing
// ---------------------------------------------------------------------------
function parseDeclarations(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const key = `--${m[1]}`;
    // Skip animation tokens — not needed for docs
    if (key.startsWith("--animate-")) continue;
    tokens[key] = m[2].trim();
  }
  return tokens;
}

function resolveVars(tokens: Record<string, string>): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    resolved[key] = value.replace(/var\(([^)]+)\)/g, (_, ref: string) => {
      const refKey = ref.trim();
      return tokens[refKey] ?? resolved[refKey] ?? `var(${ref})`;
    });
  }
  return resolved;
}

function parseCSSFile(filePath: string): {
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract @theme { ... } block
  const themeMatch = content.match(/@theme\s*\{([\s\S]*?)\n\}/);
  const lightRaw = themeMatch ? parseDeclarations(themeMatch[1]) : {};

  // Extract @media (prefers-color-scheme: dark) { :root { ... } }
  const darkMatch = content.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([\s\S]*?)\}\s*\}/,
  );
  const darkOverrides = darkMatch ? parseDeclarations(darkMatch[1]) : {};

  return {
    light: resolveVars(lightRaw),
    dark: resolveVars({ ...lightRaw, ...darkOverrides }),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const cssFiles = fs
    .readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith(".css"))
    .sort();

  const output: Record<string, Record<string, string>> = {};

  for (const file of cssFiles) {
    const themeName = path.basename(file, ".css");
    const { light, dark } = parseCSSFile(path.join(THEMES_DIR, file));

    output[themeName] = {
      ...light,
      ...codeHighlightTokens[themeName],
    };

    output[`${themeName}-dark`] = {
      ...dark,
      ...codeHighlightTokens[`${themeName}-dark`],
    };
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + "\n");

  const themeCount = cssFiles.length;
  const variantCount = Object.keys(output).length;
  console.log(
    `Generated ${variantCount} theme variants (${themeCount} themes × light/dark) → ${path.relative(process.cwd(), OUTPUT_FILE)}`,
  );
}

main();
