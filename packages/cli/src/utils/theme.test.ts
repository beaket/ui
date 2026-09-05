import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { extractThemeBlock, replaceThemeInCss, wrapThemeCss } from "./theme.ts";

const THEME_START = "/* beaket:theme:start */";
const THEME_END = "/* beaket:theme:end */";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const currentTheme = ["foundation.css", "semantic.css", "solace.css"]
  .map((file) => fs.readFileSync(path.join(root, "src/themes", file), "utf8"))
  .join("\n");

const sampleTheme = `/*
 * Beaket UI Design System - Porcelain Theme
 */

@theme {
  --color-ink: #080b10;
  --color-paper: #ffffff;
}

@keyframes navigation-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
`;

const updatedTheme = `/*
 * Beaket UI Design System - Porcelain Theme
 */

@theme {
  --color-ink: #0a0d12;
  --color-paper: #fefefe;
}

@keyframes navigation-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
`;

// Realistic multi-block theme matching actual file structure:
// @theme with navigation-progress property, @media dark mode, @keyframes
describe("wrapThemeCss", () => {
  it("wraps CSS with start/end markers", () => {
    const result = wrapThemeCss(sampleTheme);
    expect(result).toContain(THEME_START);
    expect(result).toContain(THEME_END);
    expect(result.indexOf(THEME_START)).toBeLessThan(result.indexOf("@theme"));
    expect(result.indexOf("@theme")).toBeLessThan(result.indexOf(THEME_END));
  });

  it("injects the foundation, semantic layer, and both palette schemes", () => {
    const result = wrapThemeCss(currentTheme);

    expect(result.match(/--surface-[0-2]\s*:/g)).toHaveLength(6);
    expect(result).toContain("--surface-0: #f3f3ef");
    expect(result).toContain("--surface-1: #f9f9f5");
    expect(result).toContain("--surface-2: #fffffb");
    expect(result).toContain("--tone-0: #f3f3ef");
    expect(result).toContain("--tone-3: #a7a8a7");
    expect(result).toContain("--tone-6: #686b6e");
    expect(result).toContain("@media (prefers-color-scheme: dark)");
    expect(result).toContain("--surface-0: #0b0e14");
    expect(result).toContain("--tone-11: #f3f1e8");
    expect(result).toContain("--signal-success: #3f8a55");
    expect(result).toContain("--signal-info-alt: #005f72");
    expect(result).toContain("--signal-info-alt-on: var(--tone-0)");
    expect(result).toContain("--text-sm: 0.8125rem");
    expect(result).toContain("--font-sans:");
    expect(result).toContain("--space-8: 3.5rem");
    expect(result).toContain("--radius-full: 9999px");
    expect(result).not.toContain("--surface-brand");
    expect(result).not.toContain("--shadow-size-active");
  });
});

describe("replaceThemeInCss", () => {
  it("replaces marker-wrapped theme block", () => {
    const existing = `@import "tailwindcss";\n\n${THEME_START}\n${sampleTheme}${THEME_END}\n`;

    const { css, replaced } = replaceThemeInCss(existing, updatedTheme);

    expect(replaced).toBe(true);
    expect(css).toContain("--color-ink: #0a0d12");
    expect(css).not.toContain("--color-ink: #080b10");
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain(THEME_START);
    expect(css).toContain(THEME_END);
  });

  it("replaces a legacy dead-token palette with the current contract", () => {
    const legacy = `${sampleTheme}\n:root {\n  --surface-brand: hotpink;\n  --shadow-size-active: 9px;\n}\n`;
    const existing = `@import "tailwindcss";\n\n${THEME_START}\n${legacy}${THEME_END}\n`;

    const { css, replaced } = replaceThemeInCss(existing, currentTheme);

    expect(replaced).toBe(true);
    expect(css).toContain("--surface-0: #f3f3ef");
    expect(css).toContain("--tone-3: #a7a8a7");
    expect(css).toContain("--tone-6: #686b6e");
    expect(css).not.toContain("--surface-brand");
    expect(css).not.toContain("--shadow-size-active");
  });

  it("appends theme when none exists", () => {
    const existing = '@import "tailwindcss";\n\nbody { margin: 0; }\n';

    const { css, replaced } = replaceThemeInCss(existing, sampleTheme);

    expect(replaced).toBe(false);
    expect(css).toContain("body { margin: 0; }");
    expect(css).toContain("--color-ink: #080b10");
    expect(css).toContain(THEME_START);
    expect(css).toContain(THEME_END);
  });

  it("preserves content after marker-wrapped block", () => {
    const existing = `@import "tailwindcss";\n\n${THEME_START}\n${sampleTheme}${THEME_END}\n\n.custom { color: red; }\n`;

    const { css, replaced } = replaceThemeInCss(existing, updatedTheme);

    expect(replaced).toBe(true);
    expect(css).toContain(".custom { color: red; }");
    expect(css).toContain("--color-ink: #0a0d12");
  });

  it("preserves content before theme block", () => {
    const existing = `@import "tailwindcss";\n\n@layer base {\n  html { font-size: 16px; }\n}\n\n${THEME_START}\n${sampleTheme}${THEME_END}\n`;

    const { css, replaced } = replaceThemeInCss(existing, updatedTheme);

    expect(replaced).toBe(true);
    expect(css).toContain("font-size: 16px");
    expect(css).toContain("--color-ink: #0a0d12");
  });

  it("handles reversed markers gracefully (treats as no markers)", () => {
    const existing = `@import "tailwindcss";\n\n${THEME_END}\nstuff\n${THEME_START}\n`;

    const { css, replaced } = replaceThemeInCss(existing, sampleTheme);

    // Should treat as no existing theme and append
    expect(replaced).toBe(false);
    expect(css).toContain("--color-ink: #080b10");
  });
});

describe("extractThemeBlock", () => {
  it("extracts from marker-wrapped block", () => {
    const cssContent = `@import "tailwindcss";\n\n${THEME_START}\n${sampleTheme}${THEME_END}\n`;

    const result = extractThemeBlock(cssContent);

    expect(result).not.toBeNull();
    expect(result).toContain("--color-ink: #080b10");
  });

  it("returns null when no theme exists", () => {
    const cssContent = '@import "tailwindcss";\n\nbody { margin: 0; }\n';

    const result = extractThemeBlock(cssContent);

    expect(result).toBeNull();
  });

  it("handles reversed markers gracefully", () => {
    const cssContent = `${THEME_END}\nstuff\n${THEME_START}\n`;

    const result = extractThemeBlock(cssContent);

    expect(result).toBeNull();
  });
});
