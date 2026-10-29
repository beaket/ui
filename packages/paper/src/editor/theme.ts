import { Compartment, type Extension, StateEffect } from "@codemirror/state";
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

// Single source of token truth (ADR-0013 decision 6, ADR-0025). Every visual token is defined on the
// `.cm-editor` scope (`&`), so the package is self-sufficient and depends on no consumer `:root`. Every
// overlay (slash menu, imageDrop indicator, copy buttons) attaches to view.dom (= .cm-editor), so these
// definitions cascade to all of them.
//
// The PUBLIC theming contract is the `--beaket-paper-*` name, named by role (ADR-0025). Extensions never
// read it directly; they use the short internal name (var(--ink)/var(--accent)/…) and the mapping lives
// here, in one place.
//
// ① Bridged colors resolve 3 tiers deep: `var(--beaket-paper-ROLE, var(--color-ROLE, default))`.
//    1) the consumer's explicit override
//    2) the host's @beaket/ui semantic token of the same role, so inside a @beaket/ui app the editor
//       inherits the theme (and its dark mode) for free
//    3) the built-in default, which keeps the package self-sufficient standalone.
//    During 0.x the pre-ADR-0025 name is read between 1) and 2) as a deprecated alias.
// ② Editor-owned tokens are 2-tier: `var(--beaket-paper-X, default)` (syntax colors, typography). They
//    carry their own dark default in `darkTokens`.
// ③ accent-sel/weak derive from `--accent`, so an accent override flows into them. letter-spacing is
//    intentionally NOT exposed (negative spacing breaks mixed CJK; CJK-first guard).

interface BridgedToken {
  /** Public role name, after `--beaket-paper-`. */
  role: string;
  /** The pre-ADR-0025 public name, read as a deprecated alias during 0.x. */
  alias?: string;
  /** The @beaket/ui semantic token of the same role. */
  bridge: string;
  light: string;
  dark: string;
}

// Keyed by the internal name extensions read. Roles follow the @beaket/ui semantic layer and DESIGN.md:
// the writing surface is `bg-input`, menus and popovers are `bg-overlay`, code is the raised sheet.
const BRIDGED: Record<string, BridgedToken> = {
  "--ink": { role: "fg", alias: "ink", bridge: "--color-fg", light: "#232a35", dark: "#e6eaee" },
  "--steel": {
    role: "fg-muted",
    alias: "steel",
    bridge: "--color-fg-muted",
    light: "#686b6f",
    dark: "#6c7486",
  },
  "--muted": {
    role: "fg-subtle",
    alias: "muted",
    bridge: "--color-fg-subtle",
    light: "#7a7d81",
    dark: "#586070",
  },
  "--canvas": {
    role: "bg",
    alias: "canvas",
    bridge: "--color-bg-input",
    light: "#ffffff",
    dark: "#14171c",
  },
  "--surface": {
    role: "bg-raised",
    alias: "surface",
    bridge: "--color-bg-raised",
    light: "#eceef2",
    dark: "#1c1f27",
  },
  "--paper": {
    role: "bg-overlay",
    alias: "paper",
    bridge: "--color-bg-overlay",
    light: "#ffffff",
    dark: "#0d1117",
  },
  "--frost": {
    role: "bg-hover",
    alias: "frost",
    bridge: "--color-bg-hover",
    light: "#f3f4f6",
    dark: "#0e1016",
  },
  "--chrome": {
    role: "bg-active",
    alias: "chrome",
    bridge: "--color-bg-active",
    light: "#c0c4ca",
    dark: "#2a303e",
  },
  "--platinum": {
    role: "border-subtle",
    alias: "platinum",
    bridge: "--color-border-subtle",
    light: "#e8eaec",
    dark: "#161a22",
  },
  "--silver": {
    role: "border",
    alias: "silver",
    bridge: "--color-border",
    light: "#d5d8dc",
    dark: "#1e242e",
  },
  "--slate": {
    role: "border-strong",
    alias: "slate",
    bridge: "--color-border-strong",
    light: "#3e4145",
    dark: "#9ca4b2",
  },
  "--accent": { role: "accent", bridge: "--color-accent-solid", light: "#0c6bae", dark: "#1a8ed8" },
  "--shadow-overlay": {
    role: "shadow",
    bridge: "--shadow-offset-overlay",
    light: "1px 1px 0 0 #c0c4ca",
    dark: "1px 1px 0 0 #000000",
  },
};

function bridgedChain(t: BridgedToken, fallback: string): string {
  const host = `var(${t.bridge}, ${fallback})`;
  const inner = t.alias ? `var(--beaket-paper-${t.alias}, ${host})` : host;
  return `var(--beaket-paper-${t.role}, ${inner})`;
}

function bridgedTokens(scheme: "light" | "dark"): Record<string, string> {
  return Object.fromEntries(
    Object.entries(BRIDGED).map(([internal, t]) => [internal, bridgedChain(t, t[scheme])]),
  );
}

// Exported for the token-wiring contract test (not part of the package's JS public surface).
export const tokens: Record<string, string> = {
  // ① Bridged colors (3-tier, plus the 0.x alias)
  ...bridgedTokens("light"),
  // ③ Derived from --accent so a consumer accent override flows into the selection tint.
  "--accent-sel": "color-mix(in srgb, var(--accent) 16%, transparent)",
  "--accent-weak": "color-mix(in srgb, var(--accent) 8%, transparent)",
  // Task-checkbox checkmark image. Light = white stroke (stamped on the dark --ink fill). The dark
  // variant lives in `darkTokens`, so the checkmark follows a forced `colorScheme` via the scope class —
  // not a bare `prefers-color-scheme` query (which ignored forced schemes). Consumed by
  // `list-rendering.ts` as `var(--cm-check-mark)`; inherits to the checkbox from the editor root.
  "--cm-check-mark":
    "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%20fill='none'%20stroke='%23ffffff'%20stroke-width='2.25'%3E%3Cpath%20d='M3.5%208.5l3%203%206-6'/%3E%3C/svg%3E\")",
  // ② Editor-owned code syntax (GitHub Light, ADR-0006)
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

// Dark mode (ADR-0009 dark canvas). Same chains as `tokens` — the public override and the host bridge
// still win — and ONLY the built-in default is swapped to a dark-aware value. That keeps the package
// self-sufficient in dark mode standalone, while a host's dark semantic tokens still apply when present.
// These values are emitted into the scoped `@media` stylesheet by `darkThemeStyle()` below (it can't
// live in baseTheme — see that comment for why). Derived `--accent-sel`/`--accent-weak` are NOT
// re-declared: they read `var(--accent)` at use time, which is the dark accent here, so they follow.
export const darkTokens: Record<string, string> = {
  ...bridgedTokens("dark"),
  // Dark task-checkbox checkmark: dark stroke, because --ink fills light in dark mode (the white
  // light variant would vanish). Rides both dark blocks via colorSchemeCss, so it flips with the
  // active scope class for forced "dark" and OS-dark "system" alike.
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
  // Dormant for 1.0: no `drawSelection()` is installed, so CM6 keeps browser-native selection and never
  // emits `.cm-selectionBackground` — this rule never matches. Kept as the already-wired token path; a
  // porcelain selection tint is a one-line `drawSelection()` add, deliberately declined (IME risk vs. the
  // composing guard, and lightness). See DECISIONS.md "Deferred (not bugs) — adjudicated for 1.0" (#481).
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
// `--beaket-paper-*` override and the host `--color-*` bridge inside each var() chain still apply.
// Color scheme as a public prop (`colorScheme` on EditorOptions/PaperProps):
// - "system" (default) → follow the OS via `prefers-color-scheme` (the original behavior).
// - "dark"            → force dark regardless of OS.
// - "light"           → force light regardless of OS (suppress the OS dark block).
// The injected stylesheet carries a media-gated block (keyed on DARK_SCOPE_CLASS) plus an
// unconditional forced-dark and forced-light block (keyed on DARK_FORCE_CLASS / LIGHT_FORCE_CLASS).
// The scheme only decides which scope class the editor root wears — so flipping it is a single live
// class swap (`setColorScheme`), no recreation.
//
// Forcing is AUTHORITATIVE over the host bridge (#472, ADR-0020). A host whose semantic
// `--color-bg-overlay`/`--color-bg-hover`/… track the OS would otherwise leak the OS scheme
// into the editor's surfaces when a scheme is forced: the forced block only swaps the tier-3 *defaults*
// inside each var() chain, never beating a consumer-provided tier-2 `--color-*`. So each forced block
// also PINS every bridged `--color-*` to its scheme's value (a concrete `--color-*` declared on
// `.cm-editor` overrides the value inherited from the host's `:root`, sidestepping the
// once-resolved-against-the-OS stickiness). "system" is left unpinned, so it keeps deferring to the
// bridge (the inherit-the-host-theme contract). The tier-1
// public `--beaket-paper-*` override still wins within a forced scheme — it is the escape hatch.
export type ColorScheme = "light" | "dark" | "system";

/**
 * Broadcasts a color-scheme change to fields that bake colors at render time (code-block-render's
 * diagram widgets — CSS tokens follow the scope class on their own and don't need this). Dispatched by
 * `setColorScheme` alongside the compartment reconfigure, and re-dispatched on an OS flip while in
 * "system" (carrying "system" again — the resolved value is recomputed downstream). A StateField has no
 * clean way to detect a compartment reconfigure, so this explicit effect is the observation seam.
 */
export const colorSchemeChangeEffect = StateEffect.define<ColorScheme>();

/** Resolve a (possibly "system") scheme to the concrete light/dark currently in effect. */
export function resolveColorScheme(scheme: ColorScheme): "light" | "dark" {
  if (scheme === "light" || scheme === "dark") return scheme;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

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

/**
 * The bridged host tokens pinned to a scheme's built-in default — the `--color-*`/`--shadow-offset-*`
 * names of `BRIDGED` mapped to their light or dark value. Exported for the wiring test. NOT merged into
 * `tokens`/`darkTokens` themselves — those stay pure var() chains so the public-override contract holds
 * and `system` keeps deferring to the bridge; the pins exist ONLY in the forced blocks emitted by
 * `colorSchemeCss()` (ADR-0020).
 */
export function surfacePins(scheme: "light" | "dark"): Record<string, string> {
  return Object.fromEntries(Object.values(BRIDGED).map((t) => [t.bridge, t[scheme]]));
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
  const lightPins = pinDecls(surfacePins("light"));
  const darkPins = pinDecls(surfacePins("dark"));
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
 * stamps the scope class for `scheme`. Self-contained — `--beaket-paper-*` overrides and the host
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
  view.dispatch({
    effects: [
      colorSchemeCompartment.reconfigure(colorSchemeAttr(scheme)),
      // Notify render-time color consumers (code-block diagrams) so they re-render in the new scheme.
      colorSchemeChangeEffect.of(scheme),
    ],
  });
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
