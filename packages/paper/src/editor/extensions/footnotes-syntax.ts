import { tags as t } from "@lezer/highlight";
import type { BlockContext, InlineContext, Line, MarkdownConfig } from "@lezer/markdown";

// Footnote syntax (GitHub-flavored). GFM in @lezer/markdown ships Table/TaskList/Strikethrough/Autolink
// but *not* footnotes, so we add real parser nodes here rather than detect with regex — real nodes drive
// marker hiding, definition detection, and a clean round-trip to plain markdown (single source of truth).
//
//   reference  : `[^label]`         — inline, lives in the sentence (rendered as a superscript number)
//   definition : `[^label]: text`   — block, authored anywhere (collected into a footnotes section)
//
// v1 scope: single-line definitions only (no indented continuation lines); labels carry no whitespace
// or nested bracket. Both cuts are intentional — see footnote-render.ts for where they surface.

const BRACKET_OPEN = 91; // [
const CARET = 94; // ^
const BRACKET_CLOSE = 93; // ]
const COLON = 58; // :
const SPACE = 32;
const TAB = 9;
const NEWLINE = 10;

/**
 * Scan a footnote label starting just past `[^`. Returns the index of the closing `]`, or -1 when the
 * run isn't a valid label (empty, or contains whitespace / a nested `[`) so the text stays literal.
 */
function scanLabelEnd(charAt: (i: number) => number, start: number, end: number): number {
  for (let i = start; i < end; i++) {
    const ch = charAt(i);
    if (ch === BRACKET_CLOSE) return i === start ? -1 : i;
    if (ch === BRACKET_OPEN || ch === SPACE || ch === TAB || ch === NEWLINE) return -1;
  }
  return -1;
}

// Inline: `[^label]` → a FootnoteReference element. Installed before the standard Link parser so the
// opening `[` is claimed here (a footnote ref is never a link). Definition lines never reach inline
// parsing — the block parser below consumes them whole first.
const footnoteReferenceParser = {
  name: "FootnoteReference",
  before: "Link",
  parse(cx: InlineContext, next: number, pos: number): number {
    if (next !== BRACKET_OPEN || cx.char(pos + 1) !== CARET) return -1;
    const close = scanLabelEnd((i) => cx.char(i), pos + 2, cx.end);
    if (close < 0) return -1;
    return cx.addElement(cx.elt("FootnoteReference", pos, close + 1));
  },
};

/** True when a line (from its first non-marker char) opens a `[^label]:` definition. */
function definitionLabelClose(text: string, start: number): number {
  if (text.charCodeAt(start) !== BRACKET_OPEN || text.charCodeAt(start + 1) !== CARET) return -1;
  const close = scanLabelEnd((i) => text.charCodeAt(i), start + 2, text.length);
  if (close < 0 || text.charCodeAt(close + 1) !== COLON) return -1;
  return close;
}

// Block: `[^label]: text` → a FootnoteDefinition (single line). Installed before LinkReference, which
// would otherwise mis-claim `[^label]: ...` as a link reference definition. `endLeaf` lets a definition
// interrupt a running paragraph, so it works even with no blank line above it ("write anywhere").
const footnoteDefinitionParser = {
  name: "FootnoteDefinition",
  before: "LinkReference",
  parse(cx: BlockContext, line: Line): boolean {
    const close = definitionLabelClose(line.text, line.pos);
    if (close < 0) return false;
    const from = cx.lineStart + line.pos;
    const markEnd = cx.lineStart + close + 2; // through the `]:`
    const lineEnd = cx.lineStart + line.text.length;
    cx.addElement(
      cx.elt("FootnoteDefinition", from, lineEnd, [cx.elt("FootnoteMark", from, markEnd)]),
    );
    cx.nextLine();
    return true;
  },
  endLeaf(_cx: BlockContext, line: Line): boolean {
    return definitionLabelClose(line.text, line.pos) >= 0;
  },
};

/** The lezer-markdown extension adding footnote reference + definition nodes. Wired in `markdown.ts`. */
export const footnotesMarkdown: MarkdownConfig = {
  defineNodes: [
    { name: "FootnoteReference", style: t.labelName },
    { name: "FootnoteDefinition", block: true },
    { name: "FootnoteMark", style: t.processingInstruction },
  ],
  parseInline: [footnoteReferenceParser],
  parseBlock: [footnoteDefinitionParser],
};
