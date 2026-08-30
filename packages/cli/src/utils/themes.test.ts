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
});
