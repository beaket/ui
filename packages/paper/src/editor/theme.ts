import type { Extension } from "@codemirror/state";
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
  "--canvas": "var(--beaket-paper-canvas, #fbfcfd)", // cool near-white for long-form writing (ADR-0009), not --color-paper (#fff)
  "--surface": "var(--beaket-paper-surface, #eceef2)",
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
  "--font-size": "var(--beaket-paper-font-size, 17px)",
  // Line height 1.75: synthesis of Korean/Japanese/English readability evidence (KRDS 150% floor and
  // up, JLREQ range, balancing CJK comfort + Latin). ADR-0009.
  "--line-height": "var(--beaket-paper-line-height, 1.75)",
  // Opt-in readable measure (max line width). Default `none` = full width, unchanged behavior.
  "--measure": "var(--beaket-paper-measure, none)",
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
  },
  ".cm-scroller": {
    fontFamily: "var(--font)",
    lineHeight: "var(--line-height)",
    // Letter spacing 0: JLREQ solid setting (beta-gumi) / KLREQ "Hangul letter spacing 0 by default".
    // Mixed-script content, so negative letter spacing is forbidden — intentionally not a public token.
    letterSpacing: "normal",
  },
  ".cm-content": {
    // CJK per-character line breaking: Hangul too breaks at characters instead of keeping words intact (keep-all).
    wordBreak: "normal",
    // Strict line-break prohibition (kinsoku) — small kana, the long-vowel mark (chonpu), closing brackets, and punctuation never start a line (JLREQ §3).
    lineBreak: "strict",
    overflowWrap: "break-word",
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
const DARK_SCOPE_CLASS = "cm-beaket-paper";
const DARK_STYLE_ID = "beaket-paper-dark-tokens";

/** Serializes `darkTokens` into the scoped dark-mode stylesheet text. Exported for the wiring test. */
export function darkThemeCss(): string {
  const decls = Object.entries(darkTokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  return `@media (prefers-color-scheme: dark){.cm-editor.${DARK_SCOPE_CLASS}{${decls}}}`;
}

/**
 * Dark mode. Stamps the scope class on the editor and injects the dark token stylesheet once per
 * document/shadow root (idempotent by id). Self-contained — the consumer flips automatically with the
 * OS color scheme; `--beaket-paper-*` overrides and the porcelain bridge keep working in both modes.
 */
export function darkThemeStyle(): Extension {
  return [
    EditorView.editorAttributes.of({ class: DARK_SCOPE_CLASS }),
    ViewPlugin.define((view) => {
      const root = view.dom.getRootNode() as Document | ShadowRoot;
      const host: ParentNode & Node =
        root instanceof ShadowRoot ? root : ((root as Document).head ?? document.head);
      if (!host.querySelector(`#${DARK_STYLE_ID}`)) {
        const style = (root.ownerDocument ?? document).createElement("style");
        style.id = DARK_STYLE_ID;
        style.textContent = darkThemeCss();
        host.appendChild(style);
      }
      return {};
    }),
  ];
}
