import { describe, expect, it } from "vitest";
import { tokens } from "./theme";

// Token reconciliation + public theming contract (ADR-0013 decision 6).
//
// These are jsdom-safe *wiring* assertions: jsdom's getComputedStyle does not resolve the var()
// cascade or evaluate color-mix(), so the actual computed colors (e.g. "override --beaket-editor-accent
// and the accent follows") are a browser/manual check (ADR-0005 carves visual concerns out for
// browser verification). What we lock here is that the mapping threads the variables through — which
// is what makes that cascade possible.

// The token names extensions read internally that are NOT a direct public override:
// - --color-ink is a deliberate local override of porcelain's ink (the default in the chain below).
// - --accent-sel/--accent-weak are derived from --accent, so they inherit a consumer accent override.
const NON_PUBLIC = new Set(["--color-ink", "--accent-sel", "--accent-weak"]);

describe("theme public override contract", () => {
  it("every theming token is overridable via a --beaket-editor-* public name", () => {
    for (const [name, value] of Object.entries(tokens)) {
      if (NON_PUBLIC.has(name)) continue;
      expect(value, `${name} should read a --beaket-editor-* override first`).toMatch(
        /^var\(--beaket-editor-[a-z-]+,/,
      );
    }
  });

  it("derived selection tints follow --accent (so an accent override flows in)", () => {
    expect(tokens["--accent-sel"]).toBe("color-mix(in srgb, var(--accent) 16%, transparent)");
    expect(tokens["--accent-weak"]).toBe("color-mix(in srgb, var(--accent) 8%, transparent)");
  });
});

describe("theme token reconciliation", () => {
  it("bridges the accent through 3 tiers: override → porcelain → default", () => {
    expect(tokens["--accent"]).toBe(
      "var(--beaket-editor-accent, var(--color-signal-blue, #0c6bae))",
    );
  });

  it("pins ink to the softened #232a35 as a deliberate local override (ADR-0009)", () => {
    // porcelain's --color-ink (#0a0d14) is too harsh on the near-white canvas; overridden locally.
    expect(tokens["--color-ink"]).toBe("#232a35");
    expect(tokens["--ink"]).toBe("var(--beaket-editor-ink, var(--color-ink, #232a35))");
  });

  it("bridges the neutral scale through porcelain --color-* (inheriting its dark-mode block)", () => {
    expect(tokens["--paper"]).toBe("var(--beaket-editor-paper, var(--color-paper, #ffffff))");
    expect(tokens["--frost"]).toBe("var(--beaket-editor-frost, var(--color-frost, #f3f4f6))");
    expect(tokens["--chrome"]).toBe("var(--beaket-editor-chrome, var(--color-chrome, #c0c4ca))");
    expect(tokens["--silver"]).toBe("var(--beaket-editor-silver, var(--color-silver, #d5d8dc))");
    expect(tokens["--slate"]).toBe("var(--beaket-editor-slate, var(--color-slate, #3e4145))");
  });

  it("keeps editor-owned colors as 2-tier (no porcelain equivalent)", () => {
    expect(tokens["--canvas"]).toBe("var(--beaket-editor-canvas, #fbfcfd)");
    expect(tokens["--surface"]).toBe("var(--beaket-editor-surface, #eceef2)");
    expect(tokens["--syn-kw"]).toBe("var(--beaket-editor-syntax-keyword, #cf222e)");
  });
});

describe("theme typography is variabilized (CJK-first defaults)", () => {
  it("exposes font, size, line-height, and measure as public tokens", () => {
    expect(tokens["--font"]).toMatch(/^var\(--beaket-editor-font, .*sans-serif\)$/);
    // The CJK-first font ordering trap is preserved in the default: Japanese before Korean.
    const fontDefault = tokens["--font"];
    expect(fontDefault.indexOf("Hiragino")).toBeLessThan(
      fontDefault.indexOf("Apple SD Gothic Neo"),
    );
    expect(tokens["--font-size"]).toBe("var(--beaket-editor-font-size, 17px)");
    expect(tokens["--line-height"]).toBe("var(--beaket-editor-line-height, 1.75)");
    expect(tokens["--measure"]).toBe("var(--beaket-editor-measure, none)");
  });
});
