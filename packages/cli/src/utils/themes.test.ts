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

  it.each(themeNames)("keeps %s on the same 30-value contract", (themeName) => {
    const palette = declarations(fs.readFileSync(path.join(themesDir, `${themeName}.css`), "utf8"));

    expect([...palette.keys()].sort()).toEqual(PALETTE_CONTRACT);
  });

  it("makes every functional palette value reachable from the semantic layer", () => {
    const palette = declarations(fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"));
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
    const palette = declarations(fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"));
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
    const palette = declarations(fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"));
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
    const palette = declarations(fs.readFileSync(path.join(themesDir, "solace.css"), "utf8"));
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
});
