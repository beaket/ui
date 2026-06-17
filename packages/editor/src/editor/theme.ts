import { EditorView } from "@codemirror/view";

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
// `--beaket-editor-*` name — that is what a consumer sets to customize the editor, and it is stable
// and documented (see README). Extensions never read it directly; they use the short internal name
// (var(--ink)/var(--accent)/…) and the mapping lives here, in one place.
//
// ① Porcelain-bridged → 3-tier: `var(--beaket-editor-X, var(--color-Y, default))`.
//    1) explicit consumer override (editor-owned public name, no need to know porcelain's names)
//    2) porcelain bridge — when rendered inside @beaket/ui's porcelain theme it matches for free
//       (and inherits porcelain's dark-mode block)
//    3) built-in default — keeps the package self-sufficient standalone.
// ② Editor-owned → 2-tier: `var(--beaket-editor-X, default)` (no porcelain equivalent). These do
//    NOT inherit porcelain's dark block — each needs a dark value when dark mode (deferred) lands.
// ③ `--color-ink` is a deliberate local override of porcelain's harsh ink — documented divergence.
//    accent-sel/weak are derived from `--accent`, so a consumer accent override flows into them.
//    letter-spacing is intentionally NOT exposed (negative spacing breaks mixed CJK; CJK-first guard).
// Exported for the token-wiring contract test (not part of the package's JS public surface).
export const tokens = {
  // ③ Local override: porcelain --color-ink is #0a0d14 (≈18:1), too harsh on the near-white canvas
  //    (ADR-0009). Pin it softer, locally to the editor. Needs a dark-aware value for dark mode.
  "--color-ink": "#232a35",
  // ① Porcelain-bridged colors (3-tier)
  "--ink": "var(--beaket-editor-ink, var(--color-ink, #232a35))",
  "--paper": "var(--beaket-editor-paper, var(--color-paper, #ffffff))",
  "--frost": "var(--beaket-editor-frost, var(--color-frost, #f3f4f6))",
  "--accent": "var(--beaket-editor-accent, var(--color-signal-blue, #0c6bae))",
  "--shadow-overlay": "var(--beaket-editor-shadow, var(--shadow-offset, 1px 1px 0 0 #c0c4ca))",
  // ③ Derived from --accent so a consumer accent override flows into the selection tint.
  "--accent-sel": "color-mix(in srgb, var(--accent) 16%, transparent)",
  "--accent-weak": "color-mix(in srgb, var(--accent) 8%, transparent)",
  // ① Porcelain-bridged neutral scale (values verified identical to porcelain.css)
  "--platinum": "var(--beaket-editor-platinum, var(--color-platinum, #e8eaec))",
  "--silver": "var(--beaket-editor-silver, var(--color-silver, #d5d8dc))",
  "--chrome": "var(--beaket-editor-chrome, var(--color-chrome, #c0c4ca))",
  "--aluminum": "var(--beaket-editor-aluminum, var(--color-aluminum, #a0a3a7))",
  "--muted": "var(--beaket-editor-muted, var(--color-muted, #7a7d81))",
  "--steel": "var(--beaket-editor-steel, var(--color-steel, #686b6f))",
  "--slate": "var(--beaket-editor-slate, var(--color-slate, #3e4145))",
  // ② Editor-owned colors (2-tier; no porcelain equivalent)
  "--canvas": "var(--beaket-editor-canvas, #fbfcfd)", // cool near-white for long-form writing (ADR-0009), not --color-paper (#fff)
  "--surface": "var(--beaket-editor-surface, #eceef2)",
  // ② Editor-owned code syntax (GitHub Light, ADR-0006); porcelain has none
  "--syn-kw": "var(--beaket-editor-syntax-keyword, #cf222e)",
  "--syn-str": "var(--beaket-editor-syntax-string, #0a3069)",
  "--syn-num": "var(--beaket-editor-syntax-number, #0550ae)",
  "--syn-fn": "var(--beaket-editor-syntax-function, #6f42c1)",
  "--syn-type": "var(--beaket-editor-syntax-type, #953800)",
  "--syn-cmt": "var(--beaket-editor-syntax-comment, #57606a)",
  "--syn-tag": "var(--beaket-editor-syntax-tag, #116329)",
  // ② Editor-owned typography (2-tier). CJK-first defaults; consumers commonly tune these.
  "--font": `var(--beaket-editor-font, ${DEFAULT_FONT_STACK})`,
  "--font-size": "var(--beaket-editor-font-size, 17px)",
  // Line height 1.75: synthesis of Korean/Japanese/English readability evidence (KRDS 150% floor and
  // up, JLREQ range, balancing CJK comfort + Latin). ADR-0009.
  "--line-height": "var(--beaket-editor-line-height, 1.75)",
  // Opt-in readable measure (max line width). Default `none` = full width, unchanged behavior.
  "--measure": "var(--beaket-editor-measure, none)",
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
