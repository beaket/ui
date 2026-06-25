import { describe, expect, it } from "vitest";
import {
  colorSchemeClass,
  colorSchemeCss,
  darkTokens,
  sizeRules,
  surfacePins,
  tokens,
} from "./theme";

// Token reconciliation + public theming contract (ADR-0013 decision 6).
//
// These are jsdom-safe *wiring* assertions: jsdom's getComputedStyle does not resolve the var()
// cascade or evaluate color-mix(), so the actual computed colors (e.g. "override --beaket-paper-accent
// and the accent follows") are a browser/manual check (ADR-0005 carves visual concerns out for
// browser verification). What we lock here is that the mapping threads the variables through — which
// is what makes that cascade possible.

// The token names extensions read internally that are NOT a direct public override:
// - --color-ink is a deliberate local override of porcelain's ink (the default in the chain below).
// - --accent-sel/--accent-weak are derived from --accent, so they inherit a consumer accent override.
// - --cm-check-mark is an internal SVG image (the task-checkbox checkmark), not a public theming knob;
//   it carries a light value here and a dark value in darkTokens so it flips with the scope class (#487).
const NON_PUBLIC = new Set(["--color-ink", "--accent-sel", "--accent-weak", "--cm-check-mark"]);

describe("theme public override contract", () => {
  it("every theming token is overridable via a --beaket-paper-* public name", () => {
    for (const [name, value] of Object.entries(tokens)) {
      if (NON_PUBLIC.has(name)) continue;
      expect(value, `${name} should read a --beaket-paper-* override first`).toMatch(
        /^var\(--beaket-paper-[a-z-]+,/,
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
      "var(--beaket-paper-accent, var(--color-signal-blue, #0c6bae))",
    );
  });

  it("pins ink to the softened #232a35 as a deliberate local override (ADR-0009)", () => {
    // porcelain's --color-ink (#0a0d14) is too harsh on the near-white canvas; overridden locally.
    expect(tokens["--color-ink"]).toBe("#232a35");
    expect(tokens["--ink"]).toBe("var(--beaket-paper-ink, var(--color-ink, #232a35))");
  });

  it("bridges the neutral scale through porcelain --color-* (inheriting its dark-mode block)", () => {
    expect(tokens["--paper"]).toBe("var(--beaket-paper-paper, var(--color-paper, #ffffff))");
    expect(tokens["--frost"]).toBe("var(--beaket-paper-frost, var(--color-frost, #f3f4f6))");
    expect(tokens["--chrome"]).toBe("var(--beaket-paper-chrome, var(--color-chrome, #c0c4ca))");
    expect(tokens["--silver"]).toBe("var(--beaket-paper-silver, var(--color-silver, #d5d8dc))");
    expect(tokens["--slate"]).toBe("var(--beaket-paper-slate, var(--color-slate, #3e4145))");
  });

  it("keeps editor-owned colors as 2-tier (no porcelain equivalent)", () => {
    expect(tokens["--canvas"]).toBe("var(--beaket-paper-canvas, #ffffff)");
    expect(tokens["--surface"]).toBe("var(--beaket-paper-surface, #eceef2)");
    expect(tokens["--syn-kw"]).toBe("var(--beaket-paper-syntax-keyword, #cf222e)");
  });
});

describe("theme typography is variabilized (CJK-first defaults)", () => {
  it("exposes font, size, line-height, and measure as public tokens", () => {
    expect(tokens["--font"]).toMatch(/^var\(--beaket-paper-font, .*sans-serif\)$/);
    // The CJK-first font ordering trap is preserved in the default: Japanese before Korean.
    const fontDefault = tokens["--font"];
    expect(fontDefault.indexOf("Hiragino")).toBeLessThan(
      fontDefault.indexOf("Apple SD Gothic Neo"),
    );
    expect(tokens["--font-size"]).toBe("var(--beaket-paper-font-size, 16.5px)");
    expect(tokens["--line-height"]).toBe("var(--beaket-paper-line-height, 1.75)");
    expect(tokens["--measure"]).toBe("var(--beaket-paper-measure, none)");
    // #554: word-break is opt-in (default `normal`), so a host can set keep-all from the outside.
    expect(tokens["--word-break"]).toBe("var(--beaket-paper-word-break, normal)");
  });
});

// Dark mode wiring (jsdom-safe: locks the var() chains, not rendered color — the rendered dark colors
// are a browser/manual check, same carve-out as the light tokens above).
describe("dark theme keeps the override + bridge chains, swapping only the built-in default", () => {
  // Every color/shadow token a consumer can override stays publicly overridable in dark mode too.
  // --cm-check-mark is the internal checkbox checkmark image (not a public knob), same as in light.
  const NON_PUBLIC = new Set(["--color-ink", "--cm-check-mark"]);
  it("every dark token still reads a --beaket-paper-* override first", () => {
    for (const [name, value] of Object.entries(darkTokens)) {
      if (NON_PUBLIC.has(name)) continue;
      expect(value, `${name} should read a --beaket-paper-* override first`).toMatch(
        /^var\(--beaket-paper-[a-z-]+,/,
      );
    }
  });

  it("flips the locally-pinned ink to a dark-aware light value (no longer shadows the host with #232a35)", () => {
    expect(tokens["--color-ink"]).toBe("#232a35");
    expect(darkTokens["--color-ink"]).toBe("#e6eaee");
    expect(darkTokens["--ink"]).toBe("var(--beaket-paper-ink, var(--color-ink, #e6eaee))");
  });

  it("preserves the porcelain bridge while swapping defaults to porcelain's dark block", () => {
    expect(darkTokens["--paper"]).toBe("var(--beaket-paper-paper, var(--color-paper, #0d1117))");
    expect(darkTokens["--frost"]).toBe("var(--beaket-paper-frost, var(--color-frost, #0e1016))");
    expect(darkTokens["--chrome"]).toBe("var(--beaket-paper-chrome, var(--color-chrome, #2a303e))");
    expect(darkTokens["--accent"]).toBe(
      "var(--beaket-paper-accent, var(--color-signal-blue, #1a8ed8))",
    );
  });

  it("swaps editor-owned canvas/surface and syntax to dark-aware defaults", () => {
    expect(darkTokens["--canvas"]).toBe("var(--beaket-paper-canvas, #14171c)");
    expect(darkTokens["--surface"]).toBe("var(--beaket-paper-surface, #1c1f27)");
    expect(darkTokens["--syn-kw"]).toBe("var(--beaket-paper-syntax-keyword, #ff7b72)");
  });

  it("covers exactly the light tokens that don't bridge to porcelain's dark block", () => {
    // Typography/measure carry no color, so they need no dark variant; everything else must.
    const LIGHT_ONLY = new Set([
      "--font",
      "--font-size",
      "--line-height",
      "--measure",
      "--word-break",
      // Derived at use time from --accent (which is dark here), so they follow without re-declaration.
      "--accent-sel",
      "--accent-weak",
    ]);
    const expected = Object.keys(tokens).filter((k) => !LIGHT_ONLY.has(k));
    expect(Object.keys(darkTokens).sort()).toEqual(expected.sort());
  });
});

// The dark block can't go through baseTheme (style-mod can't emit `@media { & { … } }` for the root —
// nested `&` produces bare declarations under the at-rule), so it ships as a scoped stylesheet. This
// locks the structure that makes it apply: an @media wrapper + a two-class root selector that outranks
// baseTheme's single generated class without disturbing the var() override/bridge chains.
describe("colorSchemeCss emits a scoped prefers-color-scheme block", () => {
  const css = colorSchemeCss();

  it("wraps the tokens in a prefers-color-scheme: dark media query", () => {
    expect(css).toMatch(/^@media \(prefers-color-scheme: dark\)\{/);
  });

  it("scopes to .cm-editor + the beaket class (specificity 0,2,0 > baseTheme's 0,1,0)", () => {
    expect(css).toContain(".cm-editor.cm-beaket-paper{");
  });

  it("contains every dark token declaration (including the readable light ink fix)", () => {
    for (const [name, value] of Object.entries(darkTokens)) {
      expect(css).toContain(`${name}: ${value};`);
    }
    expect(css).toContain("--ink: var(--beaket-paper-ink, var(--color-ink, #e6eaee));");
  });

  // colorScheme "dark" forces dark regardless of OS, so the same tokens also ship in an
  // unconditional block keyed on a second class — the only thing the scheme flips is which class
  // the editor root wears (a live compartment swap), not the stylesheet.
  it("also emits an unconditional forced-dark block (outside the media query)", () => {
    const forced = css.slice(css.indexOf("}}") + 2); // everything after the media block closes
    expect(forced).toContain(".cm-editor.cm-beaket-paper-dark{");
    expect(forced).not.toContain("@media");
    for (const [name, value] of Object.entries(darkTokens)) {
      expect(forced).toContain(`${name}: ${value};`);
    }
  });

  // #487: the task-checkbox checkmark must follow the active scheme via the scope class, not a bare
  // `prefers-color-scheme` query (which ignored forced colorScheme — invisible checkmark when forced
  // opposite the OS). It ships as the editor token `--cm-check-mark`, so it rides BOTH dark blocks
  // (media-gated + forced) exactly like every other dark token and inherits down to the checkbox.
  it("ships the dark task-checkbox checkmark as a scope-scoped token in both dark blocks (#487)", () => {
    expect(darkTokens).toHaveProperty("--cm-check-mark");
    // the dark variant uses a dark stroke (#0d1117, URL-encoded %230d1117), not the light/white one
    expect(darkTokens["--cm-check-mark"]).toContain("%230d1117");
    const media = css.slice(0, css.indexOf("}}") + 2); // the @media (...) { .cm-editor.cm-beaket-paper { ... } } block
    const forced = css.slice(css.indexOf("}}") + 2); // the unconditional .cm-editor.cm-beaket-paper-dark block
    expect(media).toContain("--cm-check-mark:");
    expect(forced).toContain("--cm-check-mark:");
  });
});

// Sizing (ADR-0018). `sizeRules` is the pure wiring seam — it maps the two options to CM6's documented
// recipes: `height` → a fixed height on `.cm-editor` (`&`); `minHeight` → a minimum on `.cm-content`
// (the editable surface itself, so clicking the reserved height places a cursor). The rendered grow vs
// fixed-scroll geometry and the click-to-focus are browser-verified (invariant #4), not asserted here.
describe("sizeRules maps height/minHeight to the CM6 recipes", () => {
  it("height sizes the editor root (& = .cm-editor)", () => {
    expect(sizeRules("25rem")).toEqual({ "&": { height: "25rem" } });
  });

  it("minHeight sizes the top-level editable only (child combinator, never the cell subview)", () => {
    // A bare `.cm-content` descendant selector would also match the nested table-cell subview's
    // content and balloon it; the direct `& > .cm-scroller > .cm-content` pins it to the top level.
    expect(sizeRules(undefined, "10rem")).toEqual({
      "& > .cm-scroller > .cm-content": { minHeight: "10rem" },
    });
  });

  it("supports both at once (a floor that scrolls past a fixed height)", () => {
    expect(sizeRules("40rem", "20rem")).toEqual({
      "&": { height: "40rem" },
      "& > .cm-scroller > .cm-content": { minHeight: "20rem" },
    });
  });

  it("contributes nothing when neither is set (pure grow-with-content default)", () => {
    expect(sizeRules()).toEqual({});
  });
});

// colorScheme → root class is the branch that decides which token block each mode wears (the
// stylesheet above is static). "system" follows the OS (media-gated class), "dark" forces the
// unconditional block, "light" wears no class so even the OS media block can't darken it.
describe("colorSchemeClass selects the editor-root class per scheme", () => {
  it("maps system → OS-follow class, dark → forced-dark class, light → forced-light class", () => {
    expect(colorSchemeClass("system")).toBe("cm-beaket-paper");
    expect(colorSchemeClass("dark")).toBe("cm-beaket-paper-dark");
    // #472: forced light now wears its own class (was none) so it can pin the bridged surfaces light.
    expect(colorSchemeClass("light")).toBe("cm-beaket-paper-light");
  });
});

// #472: forcing a scheme must be authoritative over a consumer's porcelain `--color-*` bridge (ADR-0020).
// The forced blocks pin the bridged tier-2 surface names to their scheme value so the editor wins over a
// bridge that tracks the OS; `system` stays unpinned so it keeps deferring to the bridge. The pins are
// derived off the var() chains (single source of truth), so these lock the derivation + placement.
describe("surfacePins derives the bridged tier-2 surfaces from the token chains", () => {
  it("pins the 3-tier porcelain surfaces to their tier-3 default, per scheme", () => {
    const light = surfacePins(tokens);
    expect(light["--color-paper"]).toBe("#ffffff");
    expect(light["--color-frost"]).toBe("#f3f4f6");
    expect(light["--color-signal-blue"]).toBe("#0c6bae"); // the accent bridges --color-signal-blue
    expect(light["--color-ink"]).toBe("#232a35");
    expect(light["--shadow-offset"]).toBe("1px 1px 0 0 #c0c4ca"); // the shadow bridges --shadow-offset

    const dark = surfacePins(darkTokens);
    expect(dark["--color-paper"]).toBe("#0d1117");
    expect(dark["--color-frost"]).toBe("#0e1016");
    expect(dark["--color-signal-blue"]).toBe("#1a8ed8");
  });

  it("excludes 2-tier editor-owned tokens (no porcelain bridge to override)", () => {
    const light = surfacePins(tokens);
    expect(light).not.toHaveProperty("--canvas"); // editor-owned: var(--beaket-paper-canvas, #ffffff)
    expect(light).not.toHaveProperty("--surface");
    expect(light).not.toHaveProperty("--font");
  });
});

describe("colorSchemeCss makes forcing authoritative over the consumer bridge (#472)", () => {
  const css = colorSchemeCss();
  const forced = css.slice(css.indexOf("}}") + 2); // everything after the media block closes
  const media = css.slice(0, css.indexOf("}}") + 2); // the @media (...) { .cm-editor.cm-beaket-paper { … } }

  it("emits an unconditional forced-light block keyed on the forced-light class", () => {
    expect(forced).toContain(".cm-editor.cm-beaket-paper-light{");
  });

  it("pins the bridged surfaces light in the forced-light block (was leaking the OS scheme)", () => {
    const light = forced.slice(forced.indexOf(".cm-editor.cm-beaket-paper-light{"));
    expect(light).toContain("--color-paper: #ffffff;");
    expect(light).toContain("--color-frost: #f3f4f6;");
  });

  it("pins the bridged surfaces dark in the forced-dark block", () => {
    expect(forced).toContain("--color-paper: #0d1117;");
    expect(forced).toContain("--color-frost: #0e1016;");
  });

  // The OS-follow block must NOT pin the surfaces — it defers to the consumer bridge. The `:` (vs the
  // `,` in the `--paper`/`--frost` var() chains) makes this a precise pin assertion, no false positive.
  it("leaves the system/media block deferring to the bridge (no surface pins)", () => {
    expect(media).not.toContain("--color-paper:");
    expect(media).not.toContain("--color-frost:");
  });
});
