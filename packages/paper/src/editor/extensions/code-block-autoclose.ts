import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

// Enter on an *opening* fence line auto-completes the block: it inserts the matching closing fence
// below and parks the cursor on a blank middle line — so typing ```js + Enter yields a ready-to-fill
// code block instead of an unterminated fence. (code-block-enter.ts handles Enter on the *content*
// lines; this handles the delimiter line it deliberately yields on.)
// Does not intervene during IME composition (invariant #1) nor in read-only state.

/** An opening fence line: ``` or ~~~ (3+), optional info string, with no closing fence chars on the
 *  same line. Captures [, leadingIndent, fenceChars, infoString]. */
const OPEN_FENCE = /^(\s*)(`{3,}|~{3,})([^`~]*)$/;

/** True if the FencedCode node containing `pos` already has a closing fence.
 *  A closed block has two CodeMark children (open + close); an unterminated one has only the open. */
function fenceAlreadyClosed(state: EditorState, pos: number): boolean {
  let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, -1);
  for (; node && node.name !== "FencedCode"; node = node.parent);
  if (!node) return false;
  let marks = 0;
  const cur = node.cursor();
  if (cur.firstChild()) {
    do {
      if (cur.name === "CodeMark") marks++;
    } while (cur.nextSibling());
  }
  return marks >= 2;
}

/** Enter at the end of an unterminated opening fence line → insert the matching close + blank middle
 *  line, cursor on the middle line. Returns false (yields to default) in every other case. */
export function autoCloseFence(view: EditorView): boolean {
  if (view.composing) return false;
  const { state } = view;
  if (state.readOnly) return false;
  const sel = state.selection.main;
  if (!sel.empty) return false;
  const line = state.doc.lineAt(sel.head);
  if (sel.head !== line.to) return false; // only when the cursor is at the end of the fence line
  const m = OPEN_FENCE.exec(line.text);
  if (!m) return false;
  const [, indent, fence] = m;
  if (fenceAlreadyClosed(state, sel.head)) return false;
  view.dispatch({
    changes: { from: sel.head, insert: `\n${indent}\n${indent}${fence}` },
    selection: { anchor: sel.head + 1 + indent.length },
    scrollIntoView: true,
    userEvent: "input",
  });
  return true;
}

// Prec.high to beat defaultKeymap's Enter; coexists with codeBlockEnter (also Prec.high) since the two
// guard disjoint cases (content line vs. opening delimiter line) and each yields when it does not apply.
export const codeBlockAutoClose: Extension = Prec.high(
  keymap.of([{ key: "Enter", run: autoCloseFence }]),
);
