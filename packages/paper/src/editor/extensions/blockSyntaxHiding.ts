import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView } from "@codemirror/view";
import { guardedDecorations } from "./composingGuard";

// Hiding structural marks of block elements. Unlike inline (per-node exposure), blocks use "is the cursor on
// that line" as the exposure unit (Obsidian behavior).

const hideMark = Decoration.replace({});
// Blockquote line: nesting-depth class (cm-bq-d{n}). Indent by the depth and draw that many vertical bars
// (GitHub/Obsidian convention). Depth is the number of Blockquote nodes wrapping a line. Clamped at 4 levels (rare).
const QUOTE_MAX_DEPTH = 4;
const quoteLineDeco = [1, 2, 3, 4].map((d) =>
  Decoration.line({ class: `cm-blockquote-line cm-bq-d${d}` }),
);
const codeLine = Decoration.line({ class: "cm-codeblock-line" });
// Code-block fence (``` line): when the cursor is outside, hide the text and shrink the line to a ~0.5em surface padding strip.
// (Previously it remained a full-height empty row like a body code line, creating an accidental ~1.6em gap.)
const fenceLine = Decoration.line({ class: "cm-codeblock-fence" });
// Horizontal rule: on lines without a cursor, hide the `---` text and draw a horizontal rule on the line (follow-up to ADR-0009 decision 4).
const hrLine = Decoration.line({ class: "cm-hr-line" });

// Per-nesting-depth blockquote theme. One level = bar (2px) + gutter. At depth d, indent the text by d*UNIT and
// draw vertical bars at positions k=0..d-1 (k*UNIT) to form a continuous line with the parent lines.
// Bars are a background-image layer (not involved in layout) — only paddingLeft enters line height, keeping coordinates safe.
const BQ_UNIT = 1.1; // em / nesting level
const BQ_BAR = "linear-gradient(var(--chrome), var(--chrome))";
const quoteDepthTheme = Object.fromEntries(
  [1, 2, 3, 4].map((d) => [
    // The two-class selector beats baseTheme `.cm-line { padding:0 }` (same specificity).
    `.cm-line.cm-bq-d${d}`,
    {
      paddingLeft: `${(d * BQ_UNIT).toFixed(2)}em`,
      backgroundImage: Array.from({ length: d }, () => BQ_BAR).join(", "),
      backgroundPosition: Array.from(
        { length: d },
        (_, k) => `${(k * BQ_UNIT).toFixed(2)}em 0`,
      ).join(", "),
      backgroundSize: "2px 100%",
      backgroundRepeat: "no-repeat",
    },
  ]),
);

const ATX_HEADINGS = new Set([
  "ATXHeading1",
  "ATXHeading2",
  "ATXHeading3",
  "ATXHeading4",
  "ATXHeading5",
  "ATXHeading6",
]);

// Per-level asymmetric vertical margin for headings (.cm-heading-line .cm-h{n}). Top>bottom (Zenn style, ADR-0009 revision).
// Applied regardless of cursor — prevents vertical jump on entry (same principle as list hanging indent).
const headingLineDeco = [1, 2, 3, 4, 5, 6].map((n) =>
  Decoration.line({ class: `cm-heading-line cm-h${n}` }),
);

function selectionTouchesLine(state: EditorState, pos: number): boolean {
  const line = state.doc.lineAt(pos);
  return state.selection.ranges.some((range) => range.from <= line.to && range.to >= line.from);
}

function computeDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const hidden: { from: number; to: number }[] = [];
  const headingLines: { pos: number; level: number }[] = [];
  // Line start position → nesting depth (number of wrapping Blockquote nodes). Accumulates as nodes overlap on the same line.
  const quoteDepth = new Map<number, number>();
  const codeLines: number[] = [];
  const fenceLines: number[] = [];
  const hrLines: number[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        if (ATX_HEADINGS.has(node.name)) {
          // The per-level asymmetric margin always applies regardless of cursor (prevents jump on entry)
          const level = Number(node.name.slice("ATXHeading".length));
          headingLines.push({ pos: state.doc.lineAt(node.from).from, level });
          // The opening `#` mark is hidden only on lines without a cursor (exposed when editing)
          if (selectionTouchesLine(state, node.from)) return;
          for (let child = node.node.firstChild; child; child = child.nextSibling) {
            if (child.name !== "HeaderMark") continue;
            // The opening mark is hidden together with the trailing space (`# Title` → `Title`)
            const after = state.doc.sliceString(child.to, child.to + 1);
            hidden.push({ from: child.from, to: after === " " ? child.to + 1 : child.to });
          }
        }
        if (node.name === "Blockquote") {
          // Line style for the whole blockquote block. Each time a node wraps a line, depth +1 (nested `> >` is +2).
          // The `>` mark on cursorless lines is hidden separately in the QuoteMark branch.
          const firstLine = state.doc.lineAt(node.from).number;
          const lastLine = state.doc.lineAt(node.to).number;
          for (let n = firstLine; n <= lastLine; n++) {
            const pos = state.doc.line(n).from;
            quoteDepth.set(pos, (quoteDepth.get(pos) ?? 0) + 1);
          }
        }
        if (node.name === "QuoteMark") {
          if (selectionTouchesLine(state, node.from)) return;
          const after = state.doc.sliceString(node.to, node.to + 1);
          hidden.push({ from: node.from, to: after === " " ? node.to + 1 : node.to });
        }
        if (node.name === "HorizontalRule") {
          // If the cursor is on that line, expose `---` as-is for editing; otherwise render as a horizontal rule
          if (selectionTouchesLine(state, node.from)) return;
          const line = state.doc.lineAt(node.from);
          hrLines.push(line.from);
          if (line.to > line.from) hidden.push({ from: line.from, to: line.to });
        }
        if (node.name === "FencedCode") {
          const firstLine = state.doc.lineAt(node.from);
          const lastLine = state.doc.lineAt(node.to);
          // The fence (``` + language) is exposed at block granularity — shown if the cursor is inside the block
          const touched = state.selection.ranges.some(
            (range) => range.from <= node.to && range.to >= node.from,
          );
          for (let n = firstLine.number; n <= lastLine.number; n++) {
            const linePos = state.doc.line(n).from;
            // Only when the cursor is outside, the opening/closing fence lines become shrunk strips; the rest are code lines
            const isFence = !touched && (n === firstLine.number || n === lastLine.number);
            if (isFence) fenceLines.push(linePos);
            else codeLines.push(linePos);
          }
          if (touched) return;
          if (firstLine.to > firstLine.from)
            hidden.push({ from: firstLine.from, to: firstLine.to });
          if (lastLine.number !== firstLine.number && lastLine.to > lastLine.from)
            hidden.push({ from: lastLine.from, to: lastLine.to });
        }
      },
    });
  }

  return Decoration.set(
    [
      ...hidden.map((r) => hideMark.range(r.from, r.to)),
      ...headingLines.map((h) => headingLineDeco[h.level - 1].range(h.pos)),
      ...[...quoteDepth].map(([pos, depth]) =>
        quoteLineDeco[Math.min(depth, QUOTE_MAX_DEPTH) - 1].range(pos),
      ),
      ...codeLines.map((pos) => codeLine.range(pos)),
      ...fenceLines.map((pos) => fenceLine.range(pos)),
      ...hrLines.map((pos) => hrLine.range(pos)),
    ],
    true,
  );
}

export function blockSyntaxHiding(): Extension {
  return [
    guardedDecorations("block-syntax-hiding", computeDecorations),
    EditorView.theme({
      // Blockquote color is common regardless of depth. Indentation and vertical bars are drawn by the depth classes (quoteDepthTheme).
      ".cm-line.cm-blockquote-line": {
        color: "var(--steel)",
      },
      ...quoteDepthTheme,
      ".cm-line.cm-codeblock-line": {
        backgroundColor: "var(--surface)",
        fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "D2Coding", monospace',
        fontSize: "0.9em",
        // Unified block horizontal gutter — based on 0.9em text, so 0.78em ≈ the blockquote/table 0.7em (body-text based)
        padding: "0 0.78em",
      },
      // Fence line = code-block top/bottom padding strip (empty surface, ~0.5em density). Radius 0.
      // A widgetBuffer remains even on empty lines, so line-height alone won't flatten it to one line — shrink font-size too.
      ".cm-codeblock-fence": {
        backgroundColor: "var(--surface)",
        fontSize: "0.5em",
        lineHeight: "1",
      },
      // Heading asymmetric vertical margin (Zenn style, ADR-0009 revision). Top>bottom to make the section start crisp.
      // Use padding instead of margin — the CM6 height model can't measure .cm-line's margin,
      // so cursor coordinates accumulate error, but padding is included in the line box and is accurate.
      // em is based on .cm-line's body size (17px) — combined with one empty line row, the top becomes generous.
      // The bigger the heading, the larger the top margin to reinforce hierarchy. The bottom is kept small to bind with the body text that follows.
      // The selector uses two classes — to beat baseTheme's `.cm-line { padding: 0 }` (same specificity).
      ".cm-line.cm-heading-line": { paddingBottom: "0.1em" },
      ".cm-heading-line.cm-h1": { paddingTop: "1.6em" },
      ".cm-heading-line.cm-h2": { paddingTop: "0.4em" },
      ".cm-heading-line.cm-h3": { paddingTop: "1.1em" },
      ".cm-heading-line.cm-h4, .cm-heading-line.cm-h5, .cm-heading-line.cm-h6": {
        paddingTop: "0.9em",
      },
      // Horizontal rule: a silver 1px horizontal rule within one empty-line row height (porcelain radius 0).
      ".cm-hr-line": {
        position: "relative",
      },
      ".cm-hr-line::after": {
        content: '""',
        position: "absolute",
        left: "0",
        right: "0",
        top: "50%",
        borderTop: "1px solid var(--silver)",
      },
    }),
  ];
}
