import { syntaxTree } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

// Enter inside a code block: prevents the indentService of the language parser (Python etc., lazy-loaded via codeLanguages)
// from accumulating syntax-based indentation line by line. On code content lines it only
// "keeps the current line's indentation" — predictable, and a simplicity suited to a markdown writing tool.
// (Lightweight/simple — IDE-style syntactic auto-indent is out of scope.)
// Does not intervene during IME composition (left to default behavior / composition commit, in the spirit of ADR-0004).

/** Returns the FencedCode node if the cursor is on a 'content' line of a fenced code block, else null */
function fencedCodeContentAt(view: EditorView, pos: number) {
  const { state } = view;
  let inFence = false;
  for (let n: SyntaxNode | null = syntaxTree(state).resolveInner(pos, -1); n; n = n.parent) {
    if (n.name === "FencedCode") {
      inFence = true;
      break;
    }
  }
  if (!inFence) return false;
  // On a fence delimiter line (``` or ~~~) leave it to default behavior — intervene only on code content lines
  const line = state.doc.lineAt(pos);
  if (/^\s*(```|~~~)/.test(line.text)) return false;
  return line;
}

/** Enter on a code content line = line break + copy the current line's indentation (bypassing syntactic auto-indent) */
export function codeBlockNewline(view: EditorView): boolean {
  if (view.composing) return false;
  const sel = view.state.selection.main;
  if (!sel.empty) return false;
  const line = fencedCodeContentAt(view, sel.head);
  if (!line) return false;
  const indent = /^[ \t]*/.exec(line.text)?.[0] ?? "";
  view.dispatch(view.state.replaceSelection("\n" + indent), {
    scrollIntoView: true,
    userEvent: "input",
  });
  return true;
}

// Captured before defaultKeymap's Enter (insertNewlineAndIndent), but yields to the slash menu (Prec.highest).
export const codeBlockEnter: Extension = Prec.high(
  keymap.of([{ key: "Enter", run: codeBlockNewline }]),
);
