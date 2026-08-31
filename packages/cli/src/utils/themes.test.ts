import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const themesDir = path.join(root, "src/themes");
const themeNames = ["solace", "porcelain", "tobacco", "marigold", "eucalyptus"];

const PALETTE_CONTRACT = [
  "--surface-0",
  "--surface-1",
  "--surface-2",
  ...Array.from({ length: 12 }, (_, index) => `--tone-${index}`),
  "--signal-danger",
  "--signal-warning",
  "--signal-success",
  "--signal-info",
  "--signal-info-alt",
  "--signal-accent",
  "--signal-danger-on",
  "--signal-success-on",
  "--signal-warning-on",
  "--signal-info-on",
  "--signal-info-alt-on",
  "--signal-accent-on",
  "--shadow-size",
  "--shadow-color",
  "--shadow-color-overlay",
].sort();

const RESERVED_PALETTE_TOKENS = ["--tone-8", "--tone-9", "--tone-10"];
const FUNCTIONAL_PALETTE_TOKENS = PALETTE_CONTRACT.filter(
  (token) => !RESERVED_PALETTE_TOKENS.includes(token),
);

function declarations(css: string): Map<string, string> {
  return new Map(
    [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2]]),
  );
}

function paletteVariants(css: string): {
  light: Map<string, string>;
  dark: Map<string, string> | null;
} {
  const beforeMedia = css.split("@media")[0];
  const lightMatch = beforeMedia.match(/:root\s*\{([\s\S]*?)\}/);
  const darkMatch = css.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([\s\S]*?)\}\s*\}/,
  );

  return {
    light: declarations(lightMatch?.[1] ?? ""),
    dark: darkMatch ? declarations(darkMatch[1]) : null,
  };
}

function variableReferences(value: string): string[] {
  return [...value.matchAll(/var\((--[\w-]+)\)/g)].map((match) => match[1]);
}

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

function parseHex(value: string): RgbColor {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  if (!match) throw new Error(`Expected a six-digit hex color, received ${value}`);

  return {
    red: Number.parseInt(match[1], 16),
    green: Number.parseInt(match[2], 16),
    blue: Number.parseInt(match[3], 16),
  };
}

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: RgbColor): number {
  return (
    0.2126 * linearize(color.red) + 0.7152 * linearize(color.green) + 0.0722 * linearize(color.blue)
  );
}

function oklabLightness(color: RgbColor): number {
  const red = linearize(color.red);
  const green = linearize(color.green);
  const blue = linearize(color.blue);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

function contrastRatio(first: RgbColor, second: RgbColor): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("theme palette contract", () => {
  const semantic = declarations(fs.readFileSync(path.join(themesDir, "semantic.css"), "utf8"));

  it("documents the shipped OS-driven CSS contract separately from the docs preview", () => {
    const themesPage = fs.readFileSync(path.join(root, "docs/src/pages/themes.astro"), "utf8");
    const appMock = fs.readFileSync(
      path.join(root, "docs/src/components/theme-app-mock.tsx"),
      "utf8",
    );

    expect(themesPage).toContain('@import "@beaket/ui/themes/semantic.css"');
    expect(themesPage).toContain('@import "@beaket/ui/themes/solace.css"');
    expect(themesPage).toContain("@media (prefers-color-scheme: dark)");
    expect(themesPage).toContain("Docs preview controls");
    expect(themesPage).toContain("local preview implementation");
    expect(themesPage).toContain("beaket-theme");
    expect(themesPage).toContain("beaket-color-scheme");
    expect(themesPage).not.toContain("Manual control");
    expect(themesPage).not.toContain('localStorage.setItem("beaket-color-scheme"');
    expect(appMock).not.toMatch(/(?:bg|text|border)-(?:iron|aluminum)\b/);
  });

  it.each(themeNames)("keeps both %s schemes on the same 30-value contract", (themeName) => {
    const palettes = paletteVariants(
      fs.readFileSync(path.join(themesDir, `${themeName}.css`), "utf8"),
    );

    expect([...palettes.light.keys()].sort()).toEqual(PALETTE_CONTRACT);
    expect(palettes.dark, `${themeName} does not expose a dark palette`).not.toBeNull();
    expect([...(palettes.dark?.keys() ?? [])].sort()).toEqual(PALETTE_CONTRACT);
  });

  it("generates a complete Solace dark token set for the documentation", () => {
    const generated = JSON.parse(
      fs.readFileSync(path.join(root, "docs/src/data/theme-tokens.json"), "utf8"),
    ) as Record<string, Record<string, string>>;

    expect(generated["solace-dark"]).toBeDefined();
    expect(Object.keys(generated["solace-dark"]).sort()).toEqual(
      Object.keys(generated.solace).sort(),
    );
    for (const token of PALETTE_CONTRACT) {
      expect(
        generated["solace-dark"][token],
        `generated solace-dark is missing ${token}`,
      ).toBeDefined();
    }
  });

  it("locks the reviewed Solace signal palettes and knockouts", () => {
    const palettes = paletteVariants(fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"));
    if (!palettes.dark) throw new Error("Solace does not expose a dark palette");

    const signals = (palette: Map<string, string>) =>
      Object.fromEntries([...palette].filter(([token]) => token.startsWith("--signal-")));

    expect(signals(palettes.light)).toEqual({
      "--signal-danger": "#a44735",
      "--signal-warning": "#d18b3f",
      "--signal-success": "#3f8a55",
      "--signal-info": "#53628f",
      "--signal-info-alt": "#005f72",
      "--signal-accent": "#2b5bff",
      "--signal-danger-on": "var(--tone-0)",
      "--signal-success-on": "var(--tone-11)",
      "--signal-warning-on": "var(--tone-11)",
      "--signal-info-on": "var(--tone-0)",
      "--signal-info-alt-on": "var(--tone-0)",
      "--signal-accent-on": "var(--tone-0)",
    });
    expect(signals(palettes.dark)).toEqual({
      "--signal-danger": "#e47463",
      "--signal-warning": "#d99a50",
      "--signal-success": "#45aa88",
      "--signal-info": "#7190d6",
      "--signal-info-alt": "#48a4af",
      "--signal-accent": "#6f8fff",
      "--signal-danger-on": "var(--tone-0)",
      "--signal-success-on": "var(--tone-0)",
      "--signal-warning-on": "var(--tone-0)",
      "--signal-info-on": "var(--tone-0)",
      "--signal-info-alt-on": "var(--tone-0)",
      "--signal-accent-on": "var(--tone-0)",
    });
  });

  it("makes every functional palette value reachable from the semantic layer", () => {
    const palette = paletteVariants(
      fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"),
    ).light;
    const graph = new Map([...palette, ...semantic]);
    const reachable = new Set<string>();
    const pending = [...semantic.keys()];

    while (pending.length > 0) {
      const token = pending.pop();
      if (!token || reachable.has(token)) continue;
      reachable.add(token);

      for (const dependency of variableReferences(graph.get(token) ?? "")) {
        pending.push(dependency);
      }
    }

    const unreachable = FUNCTIONAL_PALETTE_TOKENS.filter((token) => !reachable.has(token));
    expect(unreachable).toEqual([]);
  });

  it("keeps only the documented neutral-ramp slots reserved", () => {
    const palette = paletteVariants(
      fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"),
    ).light;
    const graph = new Map([...palette, ...semantic]);
    const reachable = new Set<string>();
    const pending = [...semantic.keys()];

    while (pending.length > 0) {
      const token = pending.pop();
      if (!token || reachable.has(token)) continue;
      reachable.add(token);
      pending.push(...variableReferences(graph.get(token) ?? ""));
    }

    expect(PALETTE_CONTRACT.filter((token) => !reachable.has(token))).toEqual(
      [...RESERVED_PALETTE_TOKENS].sort(),
    );
  });

  it("does not advertise the removed dead tokens", () => {
    for (const themeName of themeNames) {
      const css = fs.readFileSync(path.join(themesDir, `${themeName}.css`), "utf8");
      expect(css).not.toContain("--surface-brand");
      expect(css).not.toContain("--shadow-size-active");
    }
  });

  it("keeps Solace light surfaces ordered and visibly separated", () => {
    const palette = paletteVariants(
      fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"),
    ).light;
    const surfaces = ["--surface-0", "--surface-1", "--surface-2"].map((token) => {
      const value = palette.get(token);
      if (!value) throw new Error(`Solace does not define ${token}`);
      return parseHex(value);
    });
    const lightness = surfaces.map(relativeLuminance);

    expect(lightness[1]).toBeGreaterThan(lightness[0]);
    expect(lightness[2]).toBeGreaterThan(lightness[1]);
    expect(contrastRatio(surfaces[0], surfaces[1])).toBeGreaterThanOrEqual(1.05);
    expect(contrastRatio(surfaces[1], surfaces[2])).toBeGreaterThanOrEqual(1.05);
    expect(contrastRatio(surfaces[0], surfaces[2])).toBeGreaterThanOrEqual(1.1);
    expect(palette.get("--tone-0")).toBe(palette.get("--surface-0"));
  });

  it("keeps the Solace neutral ramp perceptually progressive", () => {
    const palette = paletteVariants(
      fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"),
    ).light;
    const lightness = Array.from({ length: 12 }, (_, index) => {
      const token = `--tone-${index}`;
      const value = palette.get(token);
      if (!value) throw new Error(`Solace does not define ${token}`);
      return oklabLightness(parseHex(value));
    });
    const steps = lightness.slice(1).map((value, index) => lightness[index] - value);

    // The full ramp allows 0.04–0.12 OKLab L per step. That range leaves the
    // paper-end states quiet and gives the deepest ink enough room, without
    // permitting either duplicate stops or the old middle-ramp cliffs.
    for (const step of steps) {
      expect(step).toBeGreaterThanOrEqual(0.04);
      expect(step).toBeLessThanOrEqual(0.12);
    }

    // tone-3..7 directly serve borders and secondary/disabled text. Their
    // narrower ceiling prevents an abrupt semantic jump, while the floor
    // keeps neighboring roles visibly distinct.
    for (const step of steps.slice(3, 7)) {
      expect(step).toBeGreaterThanOrEqual(0.05);
      expect(step).toBeLessThanOrEqual(0.1);
    }
  });

  it("keeps Solace dark surfaces and tones ordered from page to paper", () => {
    const palette = paletteVariants(
      fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"),
    ).dark;
    if (!palette) throw new Error("Solace does not expose a dark palette");

    const surfaces = ["--surface-0", "--surface-1", "--surface-2"].map((token) => {
      const value = palette.get(token);
      if (!value) throw new Error(`Solace dark does not define ${token}`);
      return parseHex(value);
    });
    const surfaceLightness = surfaces.map(relativeLuminance);

    expect(surfaceLightness[1]).toBeGreaterThan(surfaceLightness[0]);
    expect(surfaceLightness[2]).toBeGreaterThan(surfaceLightness[1]);
    expect(contrastRatio(surfaces[0], surfaces[1])).toBeGreaterThanOrEqual(1.05);
    expect(contrastRatio(surfaces[1], surfaces[2])).toBeGreaterThanOrEqual(1.05);
    expect(palette.get("--tone-0")).toBe(palette.get("--surface-0"));

    const toneLightness = Array.from({ length: 12 }, (_, index) => {
      const token = `--tone-${index}`;
      const value = palette.get(token);
      if (!value) throw new Error(`Solace dark does not define ${token}`);
      return oklabLightness(parseHex(value));
    });
    for (let index = 1; index < toneLightness.length; index++) {
      expect(toneLightness[index]).toBeGreaterThan(toneLightness[index - 1]);
    }
  });

  it("keeps every Solace dark signal knockout readable", () => {
    const palette = paletteVariants(
      fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"),
    ).dark;
    if (!palette) throw new Error("Solace does not expose a dark palette");

    for (const role of ["danger", "warning", "success", "info", "info-alt", "accent"]) {
      const signal = palette.get(`--signal-${role}`);
      const knockout = palette.get(`--signal-${role}-on`);
      if (!signal || !knockout) throw new Error(`Solace dark does not define the ${role} pair`);
      const knockoutToken = /^var\((--[\w-]+)\)$/.exec(knockout)?.[1];
      const knockoutValue = knockoutToken ? palette.get(knockoutToken) : knockout;
      if (!knockoutValue) throw new Error(`Solace dark cannot resolve ${knockout}`);

      expect(contrastRatio(parseHex(signal), parseHex(knockoutValue))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
