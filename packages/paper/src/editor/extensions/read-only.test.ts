import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { setReadOnly } from "./read-only";

// Read-only contract (ADR-0018). jsdom asserts the *wiring + behavior matrix* (the editable/readOnly
// facets, the live compartment flip, and that the doc-mutating entry points stay inert); the rendered
// click-to-focus / scroll geometry is carved out for browser verification (invariant #4).

let view: EditorView | null = null;

function makeView(doc: string, readOnly?: boolean): EditorView {
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

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("readOnly wires the readOnly + editable facets together", () => {
  it("defaults to editable (readOnly false, contenteditable on)", () => {
    const v = makeView("hello");
    expect(v.state.readOnly).toBe(false);
    expect(v.state.facet(EditorView.editable)).toBe(true);
    expect(v.contentDOM.getAttribute("contenteditable")).toBe("true");
  });

  it("readOnly:true sets state.readOnly and turns contenteditable off", () => {
    const v = makeView("hello", true);
    expect(v.state.readOnly).toBe(true);
    expect(v.state.facet(EditorView.editable)).toBe(false);
    expect(v.contentDOM.getAttribute("contenteditable")).toBe("false");
  });
});

describe("setReadOnly flips the mode live without recreating the editor", () => {
  it("flips on then off, preserving the document", () => {
    const v = makeView("keep me");
    setReadOnly(v, true);
    expect(v.state.readOnly).toBe(true);
    expect(v.state.facet(EditorView.editable)).toBe(false);

    setReadOnly(v, false);
    expect(v.state.readOnly).toBe(false);
    expect(v.state.facet(EditorView.editable)).toBe(true);
    // The same view instance survived the flip (no recreation) and kept its document.
    expect(v.state.doc.toString()).toBe("keep me");
  });
});

describe("read-only behavior matrix (ADR-0018)", () => {
  const TABLE = "| A | B |\n| --- | --- |\n| 1 | 2 |\n";

  it("clicking a table cell does not enter cell editing when read-only", async () => {
    const v = makeView(TABLE, true);
    await until(() => v.dom.querySelector(".cm-table-widget") !== null);
    const cell = v.dom.querySelector("td, th") as HTMLElement | null;
    expect(cell).not.toBeNull();
    cell?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    // The cell subview is a separate EditorView; the entry guard keeps it from mounting (ADR-0018).
    expect(v.dom.querySelector(".cm-cell-editing")).toBeNull();
  });

  it("an editable editor DOES enter cell editing on the same click (positive control)", async () => {
    const v = makeView(TABLE, false);
    await until(() => v.dom.querySelector(".cm-table-widget") !== null);
    const cell = v.dom.querySelector("td, th") as HTMLElement | null;
    cell?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await until(() => v.dom.querySelector(".cm-cell-editing") !== null);
    expect(v.dom.querySelector(".cm-cell-editing")).not.toBeNull();
  });
});
