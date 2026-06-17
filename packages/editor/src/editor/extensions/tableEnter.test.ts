import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../createEditor";
import { enterTableFromOutside } from "./tableWidget";

// Regression: entering a table from outside with ↑/↓ (symmetric to the edge arrow escape).
// The buggy behavior: ↑ below a table → atomicRanges skips the table and jumps upward (no entry).

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
    await new Promise((r) => setTimeout(r, 20));
  }
}

afterEach(() => {
  view?.destroy();
  view = null;
});

async function viewWithTable(doc: string): Promise<EditorView> {
  const v = makeView(doc);
  await until(() => v.dom.querySelector(".cm-table-widget") !== null);
  return v;
}

describe("enterTableFromOutside", () => {
  it("↑ right below a table → enters the last row cell of the table", async () => {
    const v = await viewWithTable("| a | b |\n| --- | --- |\n| 1 | 2 |\n"); // blank line at the end
    v.dispatch({ selection: { anchor: v.state.doc.length } }); // blank line below the table
    expect(enterTableFromOutside(v, "up")).toBe(true);
    await until(() => v.dom.querySelector(".cm-cell-editing") !== null); // entered cell editing
  });

  it("↓ right above a table → enters the header row cell", async () => {
    const v = await viewWithTable("위\n\n| a | b |\n| --- | --- |\n| 1 | 2 |");
    const blankAbove = v.state.doc.line(2); // blank line right above the table
    v.dispatch({ selection: { anchor: blankAbove.from } });
    expect(enterTableFromOutside(v, "down")).toBe(true);
    await until(() => v.dom.querySelector(".cm-cell-editing") !== null);
  });

  it("returns false when there is no adjacent table (default cursor movement)", async () => {
    const v = makeView("문단1\n\n문단2");
    v.dispatch({ selection: { anchor: 0 } }); // paragraph 1
    expect(enterTableFromOutside(v, "down")).toBe(false);
    expect(enterTableFromOutside(v, "up")).toBe(false);
  });
});
