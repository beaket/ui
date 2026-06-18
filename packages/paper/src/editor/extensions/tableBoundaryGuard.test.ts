import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../createEditor";

// Table↔paragraph boundary protection: block deletion of the newline in the blank line (separator) after a table
// to prevent the GFM trap where a paragraph is absorbed into a table row. (ADR-0005 regression layer — verified with the production extension set)

let view: EditorView | null = null;

function makeView(doc: string): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  return view;
}

async function until(cond: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeout) throw new Error("until(): timeout");
    await new Promise((r) => setTimeout(r, 25));
  }
}

afterEach(() => {
  view?.destroy();
  view = null;
});

// 1=header, 2=delimiter row, 3=row, 4=blank line, 5=paragraph
const DOC = ["| a | b |", "| --- | --- |", "| 1 | 2 |", "", "문단입니다"].join("\n");

async function viewWithParsedTable(): Promise<EditorView> {
  const v = makeView(DOC);
  await until(() => v.dom.querySelector(".cm-table-widget") !== null);
  return v;
}

describe("tableBoundaryGuard", () => {
  it("blocks deleting the newline between the blank line ↔ paragraph (Backspace at paragraph start)", async () => {
    const v = await viewWithParsedTable();
    const para = v.state.doc.line(5);
    v.dispatch({ changes: { from: para.from - 1, to: para.from } }); // attempt to delete the newline before the paragraph
    expect(v.state.doc.toString()).toBe(DOC); // blocked → no change
  });

  it("blocks deleting the newline between the table ↔ blank line (Backspace at blank line start)", async () => {
    const v = await viewWithParsedTable();
    const blank = v.state.doc.line(4);
    v.dispatch({ changes: { from: blank.from - 1, to: blank.from } }); // attempt to delete the newline after the table
    expect(v.state.doc.toString()).toBe(DOC); // blocked
  });

  it("allows edits unrelated to the boundary as-is", async () => {
    const v = await viewWithParsedTable();
    const para = v.state.doc.line(5);
    v.dispatch({ changes: { from: para.to, insert: "!" } }); // type at the end of the paragraph
    expect(v.state.doc.toString()).toBe(DOC + "!");
  });

  // Even if it includes the table boundary newline, a large deletion that removes the whole table has no absorption risk.
  // In the past, select-all delete was blocked merely because it crossed the boundary (regression).
  it("does not block select-all deletion (a large deletion that includes the whole table)", async () => {
    const v = await viewWithParsedTable();
    v.dispatch({ changes: { from: 0, to: v.state.doc.length } }); // Cmd+A → Backspace
    expect(v.state.doc.toString()).toBe("");
  });

  it("does not block typing a character after select-all (replacement) either", async () => {
    const v = await viewWithParsedTable();
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: "x" } }); // Cmd+A → 'x'
    expect(v.state.doc.toString()).toBe("x");
  });
});
