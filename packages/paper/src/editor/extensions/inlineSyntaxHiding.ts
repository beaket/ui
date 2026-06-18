import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView } from "@codemirror/view";
import { guardedDecorations } from "./composingGuard";

// Live Preview rule: for inline format ranges without a cursor, hide the marks (**, *, ~~, `)
// and keep only the rendered style (highlight). When the cursor touches the range, expose the original.

const FORMAT_NODES = new Set(["StrongEmphasis", "Emphasis", "Strikethrough", "InlineCode"]);
const MARK_NODES = new Set(["EmphasisMark", "CodeMark", "StrikethroughMark"]);

const hideMark = Decoration.replace({});
// The inline code chip (background) applies only to InlineCode nodes — if given via a monospace highlight tag,
// it would leak into fenced code content (CodeText) too and double up with the code-block line background.
const inlineCodeChip = Decoration.mark({ class: "cm-inline-code" });

function selectionTouches(state: EditorState, from: number, to: number): boolean {
  return state.selection.ranges.some((range) => range.from <= to && range.to >= from);
}

function computeDecorations(view: EditorView): DecorationSet {
  const { state } = view;
  const hidden: { from: number; to: number }[] = [];
  const chips: { from: number; to: number }[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter(node) {
        // The chip applies always, regardless of cursor — the code range must stay visible even while editing
        if (node.name === "InlineCode") chips.push({ from: node.from, to: node.to });
        if (node.name === "Link") {
          if (selectionTouches(state, node.from, node.to)) return;
          // `[text](url)` → keep only the text
          for (let child = node.node.firstChild; child; child = child.nextSibling) {
            if (child.name === "LinkMark" || child.name === "URL")
              hidden.push({ from: child.from, to: child.to });
          }
          return;
        }
        if (!FORMAT_NODES.has(node.name)) return;
        if (selectionTouches(state, node.from, node.to)) return;
        for (let child = node.node.firstChild; child; child = child.nextSibling) {
          if (MARK_NODES.has(child.name)) hidden.push({ from: child.from, to: child.to });
        }
      },
    });
  }

  // In nested formats (**bold *italic***), the parent's closing mark is collected after the child mark, so sorting is needed
  return Decoration.set(
    [
      ...hidden.map((r) => hideMark.range(r.from, r.to)),
      ...chips.map((r) => inlineCodeChip.range(r.from, r.to)),
    ],
    true,
  );
}

export function inlineSyntaxHiding(): Extension {
  return [
    guardedDecorations("inline-syntax-hiding", computeDecorations),
    EditorView.theme({
      ".cm-inline-code": {
        fontSize: "0.9em",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--platinum)",
        padding: "0.05em 0.3em",
        // Global radius 0 (porcelain, ADR-0009)
      },
    }),
  ];
}
