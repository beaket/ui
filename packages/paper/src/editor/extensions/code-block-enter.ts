import { indentLess, indentMore } from "@codemirror/commands";
import { indentUnit, syntaxTree } from "@codemirror/language";
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

// Tab with an empty selection: insert one indent **unit** (spaces, not a hard tab) at the cursor. The
// stock `insertTab` inserts a literal `\t` on an empty selection (only its multi-line branch uses the
// indent unit) — a hard tab is inconsistent with our spaces-everywhere indentation (lists, multi-line
// indentMore). With a non-empty selection we defer to `indentMore` (indents every spanned line).
function insertIndentUnit(view: EditorView): boolean {
  const { state } = view;
  if (state.selection.ranges.some((r) => !r.empty)) return indentMore(view);
  const unit = state.facet(indentUnit); // default "  " (2 spaces)
  view.dispatch({
    ...state.replaceSelection(unit),
    scrollIntoView: true,
    userEvent: "input.indent",
  });
  return true;
}

// Tab/Shift+Tab inside a fenced code block (ADR-0022): VSCode-style indent. Tab inserts the indent unit
// / indents the selected lines (insertIndentUnit), Shift+Tab outdents (indentLess). Guarded so they fire
// only when both ends of the selection sit on a code **content** line — the fence delimiter lines are
// excluded (parity with codeBlockNewline) so Tab can't push a `` ``` `` past 3 spaces and break the
// fence. Elsewhere it yields to the default Tab. Not run during IME composition.
function codeBlockIndentGuarded(run: (view: EditorView) => boolean): (view: EditorView) => boolean {
  return (view) => {
    if (view.composing) return false;
    const sel = view.state.selection.main;
    if (!fencedCodeContentAt(view, sel.head) || !fencedCodeContentAt(view, sel.anchor))
      return false;
    return run(view);
  };
}

export const codeBlockIndent = codeBlockIndentGuarded(insertIndentUnit);
export const codeBlockDedent = codeBlockIndentGuarded(indentLess);

// Captured before defaultKeymap's Enter (insertNewlineAndIndent), but yields to the slash menu (Prec.highest).
// The list/blockquote Tab handlers (Prec.highest) yield inside fenced code, so Tab here lands at Prec.high.
export const codeBlockEnter: Extension = Prec.high(
  keymap.of([
    { key: "Enter", run: codeBlockNewline },
    { key: "Tab", run: codeBlockIndent },
    { key: "Shift-Tab", run: codeBlockDedent },
  ]),
);
