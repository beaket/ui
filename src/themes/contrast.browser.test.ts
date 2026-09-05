/// <reference types="vite/client" />

import { afterEach, describe, expect, test } from "vitest";

import "../styles.css";
import {
  auditContrast,
  contrastRatio,
  formatContrastFailures,
  relativeLuminance,
  resolveTokenColor,
  type ContrastPolicyEntry,
} from "./contrast";
import eucalyptus from "./eucalyptus.css?inline";
import marigold from "./marigold.css?inline";
import porcelain from "./porcelain.css?inline";
import {
  auditSignalDistances,
  formatSignalDistanceFailures,
  type SignalDistanceResult,
} from "./signal-distinguishability";
import solace from "./solace.css?inline";
import { forceScheme } from "./theme-css";
import tobacco from "./tobacco.css?inline";

const themes = { solace, porcelain, tobacco, marigold, eucalyptus } as const;
const variants = Object.entries(themes).flatMap(([theme, raw]) =>
  (["light", "dark"] as const).flatMap((scheme) => {
    const css = forceScheme(raw, scheme);
    return css === null ? [] : [{ name: `${theme}-${scheme}`, css }];
  }),
);

function applyPalette(css: string) {
  const style = document.createElement("style");
  style.id = "contrast-test-palette";
  style.textContent = css;
  document.head.appendChild(style);
}

afterEach(() => {
  document.getElementById("contrast-test-palette")?.remove();
  for (const token of [
    "--fixture-text-fg",
    "--fixture-text-bg",
    "--fixture-edge",
    "--fixture-edge-bg",
  ]) {
    document.documentElement.style.removeProperty(token);
  }
});

describe.each(variants)("$name semantic contrast", ({ name, css }) => {
  test("meets every required policy entry", () => {
    applyPalette(css);
    const results = auditContrast();
    const failures = results.filter(
      ({ enforcement = "required", minimum, ratio }) =>
        enforcement === "required" && ratio < minimum,
    );
    const disabledReports = results.filter(({ kind }) => kind === "disabled");

    console.info(
      `${name} disabled-only contrast (reported, not enforced): ${disabledReports
        .map(({ id, ratio }) => `${id}=${ratio.toFixed(2)}:1`)
        .join(", ")}`,
    );

    expect(failures, formatContrastFailures(name, failures)).toEqual([]);
  });
});

test("the audit catches deliberate text and non-text boundary regressions", () => {
  const root = document.documentElement;
  root.style.setProperty("--fixture-text-fg", "#777777");
  root.style.setProperty("--fixture-text-bg", "#777777");
  root.style.setProperty("--fixture-edge", "#eeeeee");
  root.style.setProperty("--fixture-edge-bg", "#eeeeee");

  const fixture: ContrastPolicyEntry[] = [
    {
      id: "failing-text-fixture",
      foreground: "--fixture-text-fg",
      background: "--fixture-text-bg",
      minimum: 4.5,
      kind: "text",
      usage: "proves normal-text regressions are detected",
    },
    {
      id: "failing-boundary-fixture",
      foreground: "--fixture-edge",
      background: "--fixture-edge-bg",
      minimum: 3,
      kind: "boundary",
      usage: "proves interactive-boundary regressions are detected",
    },
  ];

  const failures = auditContrast(fixture).filter(({ minimum, ratio }) => ratio < minimum);
  expect(failures.map(({ id }) => id)).toEqual([
    "failing-text-fixture",
    "failing-boundary-fixture",
  ]);
});

test("the WCAG math preserves the black-to-white reference ratio", () => {
  const black = { red: 0, green: 0, blue: 0 };
  const white = { red: 255, green: 255, blue: 255 };

  expect(relativeLuminance(black)).toBe(0);
  expect(relativeLuminance(white)).toBe(1);
  expect(contrastRatio(black, white)).toBe(21);
});

const SOLACE_BEFORE_770 = `
:root {
  --signal-danger: #af5340;
  --signal-warning: #ce8042;
  --signal-success: #00896c;
  --signal-info: #4c6bb6;
  --signal-info-alt: #008597;
  --signal-accent: #2b5bff;
  --signal-info-alt-on: var(--tone-11);
}`;

function minimumSignalDistances(results: readonly SignalDistanceResult[]) {
  const minima = new Map<string, SignalDistanceResult>();
  for (const result of results) {
    const key = `${result.form}/${result.vision}`;
    const current = minima.get(key);
    if (!current || result.distance < current.distance) minima.set(key, result);
  }
  return [...minima.values()];
}

function reviewedPairMinimum(
  results: readonly SignalDistanceResult[],
  first: SignalDistanceResult["first"],
  second: SignalDistanceResult["second"],
) {
  return Math.min(
    ...results
      .filter((result) => result.first === first && result.second === second)
      .map(({ distance }) => distance),
  );
}

describe("Solace semantic signal distinguishability", () => {
  test("separates every role pair in every supported form and vision simulation", () => {
    applyPalette(solace);
    const results = auditSignalDistances(resolveTokenColor);
    const failures = results.filter(({ distance, minimum }) => distance < minimum);

    expect(failures, formatSignalDistanceFailures(failures)).toEqual([]);
  });

  test("provides reproducible before/after evidence for the reviewed collisions", () => {
    applyPalette(`${solace}\n${SOLACE_BEFORE_770}`);
    const before = auditSignalDistances(resolveTokenColor);
    document.getElementById("contrast-test-palette")?.remove();
    applyPalette(solace);
    const after = auditSignalDistances(resolveTokenColor);

    const beforeFailures = before.filter(({ distance, minimum }) => distance < minimum);
    const afterFailures = after.filter(({ distance, minimum }) => distance < minimum);
    const summary = (label: string, results: readonly SignalDistanceResult[]) =>
      `${label}: ${minimumSignalDistances(results)
        .map(
          ({ first, second, form, vision, distance }) =>
            `${form}/${vision}=${first}:${second} ${distance.toFixed(3)}`,
        )
        .join(", ")}`;

    console.info(summary("Solace before #770", before));
    console.info(summary("Solace after #770", after));

    for (const [first, second] of [
      ["danger", "warning"],
      ["success", "info-alt"],
      ["info", "accent"],
    ] as const) {
      const previous = reviewedPairMinimum(before, first, second);
      const current = reviewedPairMinimum(after, first, second);
      console.info(`${first}/${second}: ${previous.toFixed(3)} → ${current.toFixed(3)}`);
      expect(current).toBeGreaterThan(previous);
    }

    expect(beforeFailures.length).toBeGreaterThan(0);
    expect(afterFailures, formatSignalDistanceFailures(afterFailures)).toEqual([]);
  });
});
