import { Compartment, type Extension } from "@codemirror/state";
import { EditorView, ViewPlugin } from "@codemirror/view";

// CJK tier-1 typography default. Japanese fonts are placed BEFORE Korean fonts (key): Apple SD
// Gothic Neo includes kana/kanji glyphs, so if a Korean font came first, Japanese would render in
// the Korean font (measured: zenn/note use Hiragino, we were on SD Gothic). Hangul is absent from
// Japanese fonts, so it falls back to Apple SD Gothic Neo automatically → Korean is preserved.
// Trade-off: shared Han characters (kanji) unify to Japanese glyph forms (not Korean Han forms).
// Mac=Hiragino, Win=BIZ UDPGothic (UD design)→Meiryo. Yu Gothic avoided for body text (kasure).
const DEFAULT_FONT_STACK = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  '"Hiragino Kaku Gothic ProN"',
  '"Hiragino Sans"',
  '"BIZ UDPGothic"',
  "Meiryo",
  '"Apple SD Gothic Neo"',
  '"Noto Sans KR"',
  '"Microsoft JhengHei"',
  '"PingFang TC"',
  "sans-serif",
].join(", ");

// Single source of token truth (ADR-0013 decision 6 = porcelain reconciliation). Every visual token
// is defined on the `.cm-editor` scope (`&`), so the package is self-sufficient and depends on no
// consumer `:root`. Every overlay (slash menu, imageDrop indicator, copy buttons) attaches to
// view.dom (= .cm-editor), so these definitions cascade to all of them.
//
// Each token resolves through a deliberate fallback chain. The PUBLIC theming contract is the
// `--beaket-paper-*` name — that is what a consumer sets to customize the editor, and it is stable
// and documented (see README). Extensions never read it directly; they use the short internal name
// (var(--ink)/var(--accent)/…) and the mapping lives here, in one place.
//
// ① Porcelain-bridged → 3-tier: `var(--beaket-paper-X, var(--color-Y, default))`.
//    1) explicit consumer override (editor-owned public name, no need to know porcelain's names)
//    2) porcelain bridge — when rendered inside @beaket/ui's porcelain theme it matches for free
//       (and inherits porcelain's dark-mode block)
//    3) built-in default — keeps the package self-sufficient standalone.
// ② Editor-owned → 2-tier: `var(--beaket-paper-X, default)` (no porcelain equivalent). These do
//    NOT inherit porcelain's dark block, so they carry their own dark default in `darkTokens` below.
// ③ `--color-ink` is a deliberate local override of porcelain's harsh ink — documented divergence.
//    accent-sel/weak are derived from `--accent`, so a consumer accent override flows into them.
//    letter-spacing is intentionally NOT exposed (negative spacing breaks mixed CJK; CJK-first guard).
// Exported for the token-wiring contract test (not part of the package's JS public surface).
export const tokens = {
  // ③ Local override: porcelain --color-ink is #0a0d14 (≈18:1), too harsh on the near-white canvas
  //    (ADR-0009). Pin it softer, locally to the editor. Dark-aware counterpart in `darkTokens`.
  "--color-ink": "#232a35",
  // ① Porcelain-bridged colors (3-tier)
  "--ink": "var(--beaket-paper-ink, var(--color-ink, #232a35))",
  "--paper": "var(--beaket-paper-paper, var(--color-paper, #ffffff))",
  "--frost": "var(--beaket-paper-frost, var(--color-frost, #f3f4f6))",
  "--accent": "var(--beaket-paper-accent, var(--color-signal-blue, #0c6bae))",
  "--shadow-overlay": "var(--beaket-paper-shadow, var(--shadow-offset, 1px 1px 0 0 #c0c4ca))",
  // ③ Derived from --accent so a consumer accent override flows into the selection tint.
  "--accent-sel": "color-mix(in srgb, var(--accent) 16%, transparent)",
  "--accent-weak": "color-mix(in srgb, var(--accent) 8%, transparent)",
  // ① Porcelain-bridged neutral scale (values verified identical to porcelain.css)
  "--platinum": "var(--beaket-paper-platinum, var(--color-platinum, #e8eaec))",
  "--silver": "var(--beaket-paper-silver, var(--color-silver, #d5d8dc))",
  "--chrome": "var(--beaket-paper-chrome, var(--color-chrome, #c0c4ca))",
  "--aluminum": "var(--beaket-paper-aluminum, var(--color-aluminum, #a0a3a7))",
  "--muted": "var(--beaket-paper-muted, var(--color-muted, #7a7d81))",
  "--steel": "var(--beaket-paper-steel, var(--color-steel, #686b6f))",
  "--slate": "var(--beaket-paper-slate, var(--color-slate, #3e4145))",
  // ② Editor-owned colors (2-tier; no porcelain equivalent)
  "--canvas": "var(--beaket-paper-canvas, #ffffff)", // white writing surface by default (paper-md grill 2026-06-22), overridable via --beaket-paper-canvas (e.g. beaket's #fffefc)
  "--surface": "var(--beaket-paper-surface, #eceef2)",
  // ② Task-checkbox checkmark image. Light = white stroke (stamped on the dark --ink fill). The dark
  //    variant lives in `darkTokens`, so the checkmark follows a forced `colorScheme` via the scope
  //    class — not a bare `prefers-color-scheme` query (which ignored forced schemes). Consumed by
  //    `list-rendering.ts` as `var(--cm-check-mark)`; inherits to the checkbox from the editor root.
  "--cm-check-mark":
    "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='%23ffffff'%20stroke-width='2.25'%3E%3Cpath%20d='M3.5%208.5l3%203%206-6'/%3E%3C/svg%3E\")",
  // ② Editor-owned code syntax (GitHub Light, ADR-0006); porcelain has none
  "--syn-kw": "var(--beaket-paper-syntax-keyword, #cf222e)",
  "--syn-str": "var(--beaket-paper-syntax-string, #0a3069)",
  "--syn-num": "var(--beaket-paper-syntax-number, #0550ae)",
  "--syn-fn": "var(--beaket-paper-syntax-function, #6f42c1)",
  "--syn-type": "var(--beaket-paper-syntax-type, #953800)",
  "--syn-cmt": "var(--beaket-paper-syntax-comment, #57606a)",
  "--syn-tag": "var(--beaket-paper-syntax-tag, #116329)",
  // ② Editor-owned typography (2-tier). CJK-first defaults; consumers commonly tune these.
  "--font": `var(--beaket-paper-font, ${DEFAULT_FONT_STACK})`,
  "--font-size": "var(--beaket-paper-font-size, 16.5px)",
  // Line height 1.75: synthesis of Korean/Japanese/English readability evidence (KRDS 150% floor and
  // up, JLREQ range, balancing CJK comfort + Latin). ADR-0009.
  "--line-height": "var(--beaket-paper-line-height, 1.75)",
  // Opt-in readable measure (max line width). Default `none` = full width, unchanged behavior.
  "--measure": "var(--beaket-paper-measure, none)",
  // Opt-in word-break knob (#554). Default `normal` = CJK per-character breaking, unchanged behavior.
  // A host opts into `keep-all` (break Korean at spaces, not mid-word) from the outside without fighting
  // the cascade against the internal .cm-* rules; pairs with overflow-wrap so long tokens still wrap.
  "--word-break": "var(--beaket-paper-word-break, normal)",
};

// Dark mode (ADR-0009 dark canvas). Same architecture as `tokens`: each entry keeps its var() chain
// so the public `--beaket-paper-*` override and the porcelain `--color-*` bridge still win — ONLY the
// built-in fallback default is swapped to a dark-aware value. That makes the package self-sufficient in
// dark mode standalone, while still inheriting porcelain's dark block (or a host's dark `--color-*`)
// when present. These values are emitted into the scoped `@media` stylesheet by `darkThemeStyle()`
// below (it can't live in baseTheme — see that comment for why).
//
// `--color-ink`: in LIGHT we pin it softer than porcelain's harsh #0a0d14 (ADR-0009). In DARK porcelain's
// ink (#e6eaee) is already soft, so the pin just carries a dark-aware value of its own — same role,
// dark-aware. The PUBLIC `--beaket-paper-ink` still overrides first.
//
// Neutral scale + accent defaults mirror porcelain's dark block (so standalone == porcelain dark).
// Code syntax swaps GitHub Light → GitHub Dark Default. Derived `--accent-sel`/`--accent-weak` are NOT
// re-declared: they read `var(--accent)` at use time, which is the dark accent here, so they follow.
export const darkTokens = {
  // ③ Local override, dark-aware (no longer shadows the host with a light value in dark mode).
  "--color-ink": "#e6eaee",
  // ① Porcelain-bridged colors (3-tier), dark defaults mirror porcelain's dark block
  "--ink": "var(--beaket-paper-ink, var(--color-ink, #e6eaee))",
  "--paper": "var(--beaket-paper-paper, var(--color-paper, #0d1117))",
  "--frost": "var(--beaket-paper-frost, var(--color-frost, #0e1016))",
  "--accent": "var(--beaket-paper-accent, var(--color-signal-blue, #1a8ed8))",
  "--shadow-overlay": "var(--beaket-paper-shadow, var(--shadow-offset, 1px 1px 0 0 #000000))",
  // ① Porcelain-bridged neutral scale (dark, inverted ramp — values verified identical to porcelain.css)
  "--platinum": "var(--beaket-paper-platinum, var(--color-platinum, #161a22))",
  "--silver": "var(--beaket-paper-silver, var(--color-silver, #1e242e))",
  "--chrome": "var(--beaket-paper-chrome, var(--color-chrome, #2a303e))",
  "--aluminum": "var(--beaket-paper-aluminum, var(--color-aluminum, #3e4454))",
  "--muted": "var(--beaket-paper-muted, var(--color-muted, #586070))",
  "--steel": "var(--beaket-paper-steel, var(--color-steel, #6c7486))",
  "--slate": "var(--beaket-paper-slate, var(--color-slate, #9ca4b2))",
  // ② Editor-owned colors (2-tier; no porcelain equivalent). Cool near-black writing canvas + raised fill.
  "--canvas": "var(--beaket-paper-canvas, #14171c)",
  "--surface": "var(--beaket-paper-surface, #1c1f27)",
  // ② Dark task-checkbox checkmark: dark stroke, because --ink fills light in dark mode (the white
  //    light variant would vanish). Rides both dark blocks via colorSchemeCss, so it flips with the
  //    active scope class for forced "dark" and OS-dark "system" alike.
  "--cm-check-mark":
    "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='%230d1117'%20stroke-width='2.25'%3E%3Cpath%20d='M3.5%208.5l3%203%206-6'/%3E%3C/svg%3E\")",
  // ② Editor-owned code syntax — GitHub Dark Default (mirrors the GitHub Light ramp above)
  "--syn-kw": "var(--beaket-paper-syntax-keyword, #ff7b72)",
  "--syn-str": "var(--beaket-paper-syntax-string, #a5d6ff)",
  "--syn-num": "var(--beaket-paper-syntax-number, #79c0ff)",
  "--syn-fn": "var(--beaket-paper-syntax-function, #d2a8ff)",
  "--syn-type": "var(--beaket-paper-syntax-type, #ffa657)",
  "--syn-cmt": "var(--beaket-paper-syntax-comment, #8b949e)",
  "--syn-tag": "var(--beaket-paper-syntax-tag, #7ee787)",
};

export const baseTheme = EditorView.theme({
  "&": {
    ...tokens,
    fontSize: "var(--font-size)",
    color: "var(--ink)",
    // Writing surface. The package paints its own background (white by default via --canvas, ADR-0009
    // revision / paper-md grill) so it is self-sufficient standalone — overridable with --beaket-paper-canvas.
    // Dark mode swaps the --canvas default in darkTokens; "system"/forced schemes ride the same scope class.
    backgroundColor: "var(--canvas)",
  },
  ".cm-scroller": {
    fontFamily: "var(--font)",
    lineHeight: "var(--line-height)",
    // Letter spacing 0: JLREQ solid setting (beta-gumi) / KLREQ "Hangul letter spacing 0 by default".
    // Mixed-script content, so negative letter spacing is forbidden — intentionally not a public token.
    letterSpacing: "normal",
    // Sizing chain (ADR-0018). Unconditional, so the editable surface fills the editor's height
    // however the editor got tall — our `height`/`minHeight` options OR a host sizing `.cm-editor`
    // directly (the `.cm-content` min-height: 100% CM6 default then fills the scroller, removing the
    // click-target dead zone). `flexGrow` claims the editor's spare vertical space (the editor is a
    // flex column); `overflowY: auto` only shows a scrollbar when content exceeds a fixed height, so
    // it is inert in the default grow-with-content mode. Geometry is browser-verified (invariant #4).
    flexGrow: 1,
    overflowY: "auto",
  },
  ".cm-content": {
    // CJK per-character line breaking by default (Hangul too breaks at characters, not keeping words
    // intact). Exposed as a knob (#554) so a host can opt into `keep-all` for Korean readability.
    wordBreak: "var(--word-break)",
    // Strict line-break prohibition (kinsoku) — small kana, the long-vowel mark (chonpu), closing brackets, and punctuation never start a line (JLREQ §3).
    lineBreak: "strict",
    overflowWrap: "break-word",
    // Render only real bold/italic faces, never browser-synthesized ones (#554). Faux-bold / faux-oblique
    // smear CJK strokes badly; rich text here is body weight + real Markdown bold, so the regression risk is low.
    fontSynthesis: "none",
    // Half-width spacing for punctuation (yakumono nibun aki) + spacing between Japanese/Western and Japanese/Korean (JLREQ §3). Chrome applies this by default;
    // made explicit to guarantee JLREQ behavior in Safari/Firefox etc. No effect on CM6 coordinate measurement (verified).
    textSpacingTrim: "normal",
    textAutospace: "normal",
    caretColor: "var(--ink)",
    // Opt-in readable measure; `none` by default so the layout is unchanged unless a consumer sets it.
    maxWidth: "var(--measure)",
    padding: "0",
  },
  ".cm-line": {
    padding: "0",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--accent-sel)",
  },
});

// Dark mode can't be expressed through baseTheme: CodeMirror's theme builder (style-mod) maps the
// editor root to `&`, but a nested `&` inside an `@media` block hits style-mod's selector-replacement
// path and emits bare declarations directly under the at-rule (invalid CSS the browser discards). So
// the dark token block is shipped as a separate, scoped stylesheet injected by `darkThemeStyle()`.
//
// Scoping: `EditorView.editorAttributes` stamps DARK_SCOPE_CLASS on the editor root, and the stylesheet
// targets `.cm-editor.<scope>`. Two classes = specificity (0,2,0), which outranks baseTheme's single
// generated class (0,1,0) — so in dark mode these tokens win regardless of source order, while the
// `--beaket-paper-*` override and `--color-*` porcelain bridge inside each var() chain still apply.
// Color scheme as a public prop (`colorScheme` on EditorOptions/PaperProps):
// - "system" (default) → follow the OS via `prefers-color-scheme` (the original behavior).
// - "dark"            → force dark regardless of OS.
// - "light"           → force light regardless of OS (suppress the OS dark block).
// The injected stylesheet carries a media-gated block (keyed on DARK_SCOPE_CLASS) plus an
// unconditional forced-dark and forced-light block (keyed on DARK_FORCE_CLASS / LIGHT_FORCE_CLASS).
// The scheme only decides which scope class the editor root wears — so flipping it is a single live
// class swap (`setColorScheme`), no recreation.
//
// Forcing is AUTHORITATIVE over the porcelain bridge (#472, ADR-0020). A consumer who bridges
// `--color-paper`/`--color-frost`/… to a palette that tracks the OS would otherwise leak the OS scheme
// into the editor's surfaces when a scheme is forced: the forced block only swaps the tier-3 *defaults*
// inside each var() chain, never beating a consumer-provided tier-2 `--color-*`. So each forced block
// also PINS the bridged surface `--color-*` to its scheme's value (the same mechanism `--color-ink`
// already uses — a concrete `--color-*` declared on `.cm-editor` overrides the value inherited from the
// consumer's `:root`, sidestepping the once-resolved-against-the-OS stickiness). "system" is left
// unpinned, so it keeps deferring to the bridge (the porcelain-match-for-free contract). The tier-1
// public `--beaket-paper-*` override still wins within a forced scheme — it is the escape hatch.
export type ColorScheme = "light" | "dark" | "system";

const DARK_SCOPE_CLASS = "cm-beaket-paper"; // OS-follow: only goes dark inside the media query
const DARK_FORCE_CLASS = "cm-beaket-paper-dark"; // forced dark: unconditional
const LIGHT_FORCE_CLASS = "cm-beaket-paper-light"; // forced light: unconditional (pins surfaces light)
const DARK_STYLE_ID = "beaket-paper-dark-tokens";

/** Maps a color scheme to the editor-root class that selects its token block. */
export function colorSchemeClass(scheme: ColorScheme): string {
  if (scheme === "dark") return DARK_FORCE_CLASS;
  if (scheme === "light") return LIGHT_FORCE_CLASS;
  return DARK_SCOPE_CLASS;
}

// A 3-tier porcelain bridge: `var(--beaket-paper-X, var(--color-Y, DEFAULT))`. Captures the tier-2
// porcelain name (`--color-Y`, or `--shadow-offset` for the shadow) and its tier-3 DEFAULT. 2-tier
// editor-owned tokens (canvas/surface/syntax/typography) have no inner `var(` and never match, so they
// are correctly excluded from the surface pins.
const BRIDGE_CHAIN = /^var\(--beaket-paper-[\w-]+, var\((--[\w-]+), (.+)\)\)$/;

/**
 * Derives the bridged surface pins for a token set — the tier-2 `--color-*`/`--shadow-offset` names
 * mapped to their scheme-specific tier-3 default. Single source of truth: read straight off the var()
 * chains in `tokens`/`darkTokens`, so a new 3-tier token auto-pins under forcing for free. Exported for
 * the wiring test. NOT merged into `tokens`/`darkTokens` themselves — those stay pure var() chains so
 * the public-override contract holds and `system` keeps deferring to the bridge; the pins exist ONLY in
 * the forced blocks emitted by `colorSchemeCss()`.
 */
export function surfacePins(tokenSet: Record<string, string>): Record<string, string> {
  const pins: Record<string, string> = {};
  for (const value of Object.values(tokenSet)) {
    const match = BRIDGE_CHAIN.exec(value);
    if (match) pins[match[1]] = match[2];
  }
  return pins;
}

/**
 * Serializes the scheme stylesheet text. Exported for the wiring test. Emits three blocks from one
 * source: the OS-follow dark block (media-gated), the forced-dark block, and the forced-light block.
 * The forced blocks additionally carry the per-scheme surface pins (#472) so forcing beats the bridge.
 */
export function colorSchemeCss(): string {
  const darkDecls = Object.entries(darkTokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  const pinDecls = (pins: Record<string, string>) =>
    Object.entries(pins)
      .map(([name, value]) => `${name}: ${value};`)
      .join(" ");
  const lightPins = pinDecls(surfacePins(tokens));
  const darkPins = pinDecls(surfacePins(darkTokens));
  return (
    `@media (prefers-color-scheme: dark){.cm-editor.${DARK_SCOPE_CLASS}{${darkDecls}}}` +
    `.cm-editor.${DARK_FORCE_CLASS}{${darkDecls} ${darkPins}}` +
    `.cm-editor.${LIGHT_FORCE_CLASS}{${lightPins}}`
  );
}

// The scope class lives in a compartment so `colorScheme` can flip live (no editor recreation, which
// would wipe the user's document). Module-level: a Compartment is just an identity key, and a
// reconfigure dispatched to a specific view only touches that view's slot — safe across many editors.
const colorSchemeCompartment = new Compartment();

function colorSchemeAttr(scheme: ColorScheme): Extension {
  const cls = colorSchemeClass(scheme);
  // Drive native `color-scheme` too, so scrollbars/inputs inside the editor match the active scheme
  // (a forced-light editor on a dark OS would otherwise get dark native scrollbars, and vice versa).
  // "system" → "light dark" follows the OS, matching the media-gated token block.
  const attrs: Record<string, string> = {
    style: `color-scheme: ${scheme === "system" ? "light dark" : scheme};`,
  };
  if (cls) attrs.class = cls;
  return EditorView.editorAttributes.of(attrs);
}

/**
 * Dark mode. Injects the dark token stylesheet once per document/shadow root (idempotent by id) and
 * stamps the scope class for `scheme`. Self-contained — `--beaket-paper-*` overrides and the porcelain
 * bridge keep working in every mode. Default "system" reproduces the original OS-follow behavior.
 */
export function darkThemeStyle(scheme: ColorScheme = "system"): Extension {
  return [
    ViewPlugin.define((view) => {
      const root = view.dom.getRootNode() as Document | ShadowRoot;
      const host: ParentNode & Node =
        root instanceof ShadowRoot ? root : ((root as Document).head ?? document.head);
      if (!host.querySelector(`#${DARK_STYLE_ID}`)) {
        const style = (root.ownerDocument ?? document).createElement("style");
        style.id = DARK_STYLE_ID;
        style.textContent = colorSchemeCss();
        host.appendChild(style);
      }
      return {};
    }),
    colorSchemeCompartment.of(colorSchemeAttr(scheme)),
  ];
}

/** Live-flips the editor's color scheme without recreating it (so the document is preserved). */
export function setColorScheme(view: EditorView, scheme: ColorScheme): void {
  view.dispatch({ effects: colorSchemeCompartment.reconfigure(colorSchemeAttr(scheme)) });
}

// Sizing (ADR-0018). Two independent, optional CSS lengths, each the CM6-documented recipe:
// - `height`    → a FIXED height with internal scroll. Sized on `.cm-editor` (`&`): the editor owns
//                 its sizing; the React wrapper div is just a mount point. The scroll comes from the
//                 unconditional `.cm-scroller { overflowY: auto }` in baseTheme.
// - `minHeight` → a MINIMUM editable height that GROWS with content. Sized on `.cm-content` — the
//                 *editable surface* itself, not just the outer wrapper — so clicking anywhere in the
//                 reserved height places a cursor (the dead-zone fix, #501). Targeting `.cm-content`
//                 rather than `.cm-editor` sidesteps the percentage-min-height flex gotcha.
//                 IMPORTANT: the selector is the *direct* `& > .cm-scroller > .cm-content`, not a bare
//                 `.cm-content`. A CM theme rule is a descendant selector off the editor root, so a
//                 bare `.cm-content` would also match the nested table-cell subview (a separate
//                 EditorView mounted inside `.cm-content`) and balloon every focused cell to the full
//                 min-height. The child combinator pins the rule to the top-level editable only.
// Both unset (default) = pure grow-with-content, layout unchanged. Fixed at creation (not live) —
// per the lightness principle, only `readOnly`/`colorScheme` earn a live compartment.
// `sizeRules` is the pure, jsdom-asserted wiring seam (the rendered geometry is browser-verified).
export function sizeRules(
  height?: string,
  minHeight?: string,
): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {};
  if (height) rules["&"] = { height };
  if (minHeight) rules["& > .cm-scroller > .cm-content"] = { minHeight };
  return rules;
}

/** Theme contributing the `height`/`minHeight` sizing rules; empty when neither is set. */
export function sizeTheme(height?: string, minHeight?: string): Extension {
  const rules = sizeRules(height, minHeight);
  return Object.keys(rules).length ? EditorView.theme(rules) : [];
}
