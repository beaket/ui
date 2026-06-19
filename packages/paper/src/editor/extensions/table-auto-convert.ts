import { syntaxTree } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { activateCell } from "./table-widget";

// Table entry point 2: typing `| A | B |` then Enter → append a delimiter row and empty row to convert into a table.
// A single dispatch, so one undo restores the original text (and cursor).

function countColumns(text: string): number {
  let pipes = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "|" && text[i - 1] !== "\\") pipes++;
  }
  return pipes - 1;
}

function convertPipeRowOnEnter(view: EditorView): boolean {
  // During composition, Enter is used only to commit the composition (CJK first-class)
  if (view.composing) return false;
  const { state } = view;
  const sel = state.selection.main;
  if (!sel.empty) return false;

  const line = state.doc.lineAt(sel.head);
  if (sel.head !== line.to) return false;
  const text = line.text.trim();
  if (!/^\|.+\|$/.test(text)) return false;

  // If already part of a table (e.g. a row below an existing table), defer to default behavior
  for (
    let node: SyntaxNode | null = syntaxTree(state).resolveInner(line.from, 1);
    node;
    node = node.parent
  ) {
    if (node.name === "Table") return false;
  }

  const cols = countColumns(text);
  if (cols < 1) return false;

  view.dispatch({
    changes: { from: line.to, insert: "\n|" + " --- |".repeat(cols) + "\n|" + "  |".repeat(cols) },
    userEvent: "input",
  });
  // Enter editing on the first body cell right after conversion
  activateCell(view, line.from, 1, 0);
  return true;
}

export function tableAutoConvert(): Extension {
  return Prec.high(keymap.of([{ key: "Enter", run: convertPipeRowOnEnter }]));
}
