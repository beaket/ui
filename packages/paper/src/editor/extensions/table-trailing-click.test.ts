import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { docEndsWithBareTable } from "./table-widget";

// Regression (#474): clicking in the empty space below a table that is the *literal last block*
// (an initial doc ending in a table with no trailing line) lands the caret at doc end, which CM
// renders visually *before* the widget. The mousedown handler heals the doc with a trailing line
// and places the caret there. Edit paths can't reach this state (tableBoundaryGuard guarantees a
// trailing blank line), but an initial `doc` passed straight in can.
//
// Geometry is carved out under jsdom (invariant #4): documentTop / lineBlockAt return 0, so the
// "below the last block" gate reduces to clientY > 0 — enough to exercise the full handler path.

let view: EditorView | null = null;

function makeView(doc: string, readOnly = false): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions({ readOnly }) }),
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

async function viewWithTable(doc: string, readOnly = false): Promise<EditorView> {
  const v = makeView(doc, readOnly);
  await until(() => v.dom.querySelector(".cm-table-widget") !== null);
  return v;
}

function clickBelow(v: EditorView): void {
  v.contentDOM.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, clientX: 10, clientY: 100 }),
  );
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("docEndsWithBareTable", () => {
  it("is true when the doc ends with a table and no trailing line", () => {
    const v = makeView("| a | b |\n| --- | --- |\n| 1 | 2 |");
    expect(docEndsWithBareTable(v.state)).toBe(true);
  });

  it("is false when a trailing blank line follows the table", () => {
    const v = makeView("| a | b |\n| --- | --- |\n| 1 | 2 |\n");
    expect(docEndsWithBareTable(v.state)).toBe(false);
  });

  it("is false when content follows the table", () => {
    const v = makeView("| a | b |\n| --- | --- |\n| 1 | 2 |\n\ntail");
    expect(docEndsWithBareTable(v.state)).toBe(false);
  });

  it("is false for a doc without a table", () => {
    const v = makeView("just a paragraph");
    expect(docEndsWithBareTable(v.state)).toBe(false);
  });
});

describe("click below a bare trailing table (#474)", () => {
  it("inserts a trailing line and places the caret after the table", async () => {
    const v = await viewWithTable("| a | b |\n| --- | --- |\n| 1 | 2 |");
    const before = v.state.doc.length;
    clickBelow(v);
    expect(v.state.doc.length).toBe(before + 1);
    expect(v.state.sliceDoc(before)).toBe("\n");
    expect(v.state.selection.main.head).toBe(before + 1); // the fresh trailing line, after the table
  });

  it("does nothing when a trailing blank line already exists", async () => {
    const v = await viewWithTable("| a | b |\n| --- | --- |\n| 1 | 2 |\n");
    const before = v.state.doc.toString();
    clickBelow(v);
    expect(v.state.doc.toString()).toBe(before); // CM's default (correct) handling is left alone
  });

  it("never mutates a read-only doc", async () => {
    const v = await viewWithTable("| a | b |\n| --- | --- |\n| 1 | 2 |", true);
    const before = v.state.doc.toString();
    clickBelow(v);
    expect(v.state.doc.toString()).toBe(before);
  });
});
