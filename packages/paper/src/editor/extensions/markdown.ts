import { commonmarkLanguage, markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import type { Extension } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { GFM } from "@lezer/markdown";

// Dialect (CONTEXT.md): CommonMark + GFM core extensions only — Table, TaskList, Strikethrough, Autolink.
// markdownLanguage (the default) includes out-of-scope syntax like subscript/emoji, so we restrict to commonmark + GFM.
// Code block languages (codeLanguages) are lazy-loaded via dynamic import through language-data —
// the parser is fetched only when a fence of that language is first encountered, so there's no impact on the initial bundle or input responsiveness (lightweight).

// A restrained ramp (ADR-0009): doesn't shout with size, whispers with weight and whitespace. Colors are :root tokens.
const sourceHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.5em", fontWeight: "700", lineHeight: "1.3" },
  { tag: tags.heading2, fontSize: "1.3em", fontWeight: "700", lineHeight: "1.3" },
  { tag: tags.heading3, fontSize: "1.15em", fontWeight: "650", lineHeight: "1.3" },
  // h4–h6 are 1em/700 — barely distinguishable from bold body text, but a conscious acceptance (deep headings are rare, ADR-0009).
  { tag: tags.heading4, fontWeight: "700" },
  { tag: tags.heading5, fontWeight: "700" },
  { tag: tags.heading6, fontWeight: "700", color: "var(--steel)" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  // monospace attaches to both inline code (InlineCode) and fence content (CodeText).
  // Giving the chip background/size here would double-apply with the code block line background, so we specify only the font,
  // and the inline chip is handled by inlineSyntaxHiding's .cm-inline-code.
  {
    tag: tags.monospace,
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "D2Coding", monospace',
  },
  { tag: tags.link, color: "var(--accent)" },
  { tag: tags.url, color: "var(--accent)", textDecoration: "underline" },
  { tag: tags.quote, color: "var(--steel)" },
  // Structure marks (#, **, ~~, ```, etc.) are faint — later, in 1.3, they're hidden when outside the cursor.
  { tag: tags.processingInstruction, color: "var(--muted)" },
  { tag: tags.contentSeparator, color: "var(--muted)" },
  { tag: tags.labelName, color: "var(--accent)" },
  // Code block tokens (result of codeLanguages nested parsing) — keep GitHub Light (proven readability, ADR-0006/0009)
  { tag: tags.keyword, color: "var(--syn-kw)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--syn-str)" },
  { tag: [tags.comment, tags.meta], color: "var(--syn-cmt)" },
  { tag: [tags.number, tags.bool, tags.atom], color: "var(--syn-num)" },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: "var(--syn-fn)",
  },
  { tag: [tags.typeName, tags.className, tags.namespace], color: "var(--syn-type)" },
  { tag: tags.propertyName, color: "var(--syn-num)" },
  { tag: [tags.tagName, tags.regexp], color: "var(--syn-tag)" },
  { tag: tags.attributeName, color: "var(--syn-num)" },
]);

const support = markdown({
  base: commonmarkLanguage,
  extensions: [GFM],
  codeLanguages: languages,
});

/** The lezer parser with GFM configuration applied — reused for table cell inline rendering, etc. */
export const markdownParser = support.language.parser;

/** Source highlighting only (for sharing styles without a parser, e.g. subviews) */
export const sourceHighlighting = syntaxHighlighting(sourceHighlight);

export function markdownExtension(): Extension {
  return [support, sourceHighlighting];
}
