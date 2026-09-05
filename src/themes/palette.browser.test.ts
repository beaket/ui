/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";

import appMock from "../../docs/src/components/theme-app-mock.tsx?raw";
import generated from "../../docs/src/data/theme-tokens.json";
import themesPage from "../../docs/src/pages/themes.astro?raw";
import { contrastRatio, relativeLuminance, type RgbColor } from "./contrast";
import eucalyptus from "./eucalyptus.css?inline";
import marigold from "./marigold.css?inline";
import porcelain from "./porcelain.css?inline";
import semanticCss from "./semantic.css?inline";
import solace from "./solace.css?inline";
import { declarations, paletteVariants } from "./theme-css";
import tobacco from "./tobacco.css?inline";

const themes = { solace, porcelain, tobacco, marigold, eucalyptus } as const;
const themeNames = Object.keys(themes) as (keyof typeof themes)[];

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

function variableReferences(value: string): string[] {
  return [...value.matchAll(/var\((--[\w-]+)\)/g)].map((match) => match[1]);
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

function oklabLightness(color: RgbColor): number {
  const linearize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const red = linearize(color.red);
  const green = linearize(color.green);
  const blue = linearize(color.blue);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

const solaceLight = paletteVariants(solace).light;
const solaceDark = paletteVariants(solace).dark;
if (!solaceDark) throw new Error("Solace does not expose a dark palette");

describe("theme palette contract", () => {
  const semantic = declarations(semanticCss);

  it("documents the shipped OS-driven CSS contract separately from the docs preview", () => {
    // The shipped contract is that the CLI writes the tokens into the consumer's
    // own CSS file. It stopped being a pair of `@import` lines in 2e9f99a, when
    // `init` began installing the foundation inline — this assertion followed
    // the page rather than pinning a spelling the product had left behind.
    expect(themesPage).toContain("writes the foundation, semantic layer, and selected palette");
    expect(themesPage).toContain("npx @beaket/ui init --theme");
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
    const palettes = paletteVariants(themes[themeName]);

    expect([...palettes.light.keys()].sort()).toEqual(PALETTE_CONTRACT);
    expect(palettes.dark, `${themeName} does not expose a dark palette`).not.toBeNull();
    expect([...(palettes.dark?.keys() ?? [])].sort()).toEqual(PALETTE_CONTRACT);
  });

  it("generates a complete Solace dark token set for the documentation", () => {
    const tokens = generated as Record<string, Record<string, string>>;

    expect(tokens["solace-dark"]).toBeDefined();
    expect(Object.keys(tokens["solace-dark"]).sort()).toEqual(Object.keys(tokens.solace).sort());
    for (const token of PALETTE_CONTRACT) {
      expect(
        tokens["solace-dark"][token],
        `generated solace-dark is missing ${token}`,
      ).toBeDefined();
    }
  });

  it("locks the reviewed Solace signal palettes and knockouts", () => {
    const signals = (palette: Map<string, string>) =>
      Object.fromEntries([...palette].filter(([token]) => token.startsWith("--signal-")));

    expect(signals(solaceLight)).toEqual({
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
    expect(signals(solaceDark)).toEqual({
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
    expect(
      FUNCTIONAL_PALETTE_TOKENS.filter((token) => !reachableTokens(semantic).has(token)),
    ).toEqual([]);
  });

  it("keeps only the documented neutral-ramp slots reserved", () => {
    expect(PALETTE_CONTRACT.filter((token) => !reachableTokens(semantic).has(token))).toEqual(
      [...RESERVED_PALETTE_TOKENS].sort(),
    );
  });

  it("does not advertise the removed dead tokens", () => {
    for (const themeName of themeNames) {
      expect(themes[themeName]).not.toContain("--surface-brand");
      expect(themes[themeName]).not.toContain("--shadow-size-active");
    }
  });

  it("keeps Solace light surfaces ordered and visibly separated", () => {
    const surfaces = surfaceColors(solaceLight);
    const lightness = surfaces.map(relativeLuminance);

    expect(lightness[1]).toBeGreaterThan(lightness[0]);
    expect(lightness[2]).toBeGreaterThan(lightness[1]);
    expect(contrastRatio(surfaces[0], surfaces[1])).toBeGreaterThanOrEqual(1.05);
    expect(contrastRatio(surfaces[1], surfaces[2])).toBeGreaterThanOrEqual(1.05);
    expect(contrastRatio(surfaces[0], surfaces[2])).toBeGreaterThanOrEqual(1.1);
    expect(solaceLight.get("--tone-0")).toBe(solaceLight.get("--surface-0"));
  });

  it("keeps the Solace neutral ramp perceptually progressive", () => {
    const lightness = toneLightness(solaceLight);
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
    const surfaces = surfaceColors(solaceDark);
    const surfaceLightness = surfaces.map(relativeLuminance);

    expect(surfaceLightness[1]).toBeGreaterThan(surfaceLightness[0]);
    expect(surfaceLightness[2]).toBeGreaterThan(surfaceLightness[1]);
    expect(contrastRatio(surfaces[0], surfaces[1])).toBeGreaterThanOrEqual(1.05);
    expect(contrastRatio(surfaces[1], surfaces[2])).toBeGreaterThanOrEqual(1.05);
    expect(solaceDark.get("--tone-0")).toBe(solaceDark.get("--surface-0"));

    const lightness = toneLightness(solaceDark);
    for (let index = 1; index < lightness.length; index++) {
      expect(lightness[index]).toBeGreaterThan(lightness[index - 1]);
    }
  });

  it("keeps every Solace dark signal knockout readable", () => {
    for (const role of ["danger", "warning", "success", "info", "info-alt", "accent"]) {
      const signal = solaceDark.get(`--signal-${role}`);
      const knockout = solaceDark.get(`--signal-${role}-on`);
      if (!signal || !knockout) throw new Error(`Solace dark does not define the ${role} pair`);
      const knockoutToken = /^var\((--[\w-]+)\)$/.exec(knockout)?.[1];
      const knockoutValue = knockoutToken ? solaceDark.get(knockoutToken) : knockout;
      if (!knockoutValue) throw new Error(`Solace dark cannot resolve ${knockout}`);

      expect(contrastRatio(parseHex(signal), parseHex(knockoutValue))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

/** Every token the semantic layer can reach, following var() references. */
function reachableTokens(semantic: Map<string, string>): Set<string> {
  const graph = new Map([...solaceLight, ...semantic]);
  const reachable = new Set<string>();
  const pending = [...semantic.keys()];

  while (pending.length > 0) {
    const token = pending.pop();
    if (!token || reachable.has(token)) continue;
    reachable.add(token);
    pending.push(...variableReferences(graph.get(token) ?? ""));
  }

  return reachable;
}

function surfaceColors(palette: Map<string, string>): RgbColor[] {
  return ["--surface-0", "--surface-1", "--surface-2"].map((token) => {
    const value = palette.get(token);
    if (!value) throw new Error(`Solace does not define ${token}`);
    return parseHex(value);
  });
}

function toneLightness(palette: Map<string, string>): number[] {
  return Array.from({ length: 12 }, (_, index) => {
    const value = palette.get(`--tone-${index}`);
    if (!value) throw new Error(`Solace does not define --tone-${index}`);
    return oklabLightness(parseHex(value));
  });
}
