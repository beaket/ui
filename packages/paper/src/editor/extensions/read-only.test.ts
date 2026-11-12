import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { setReadOnly } from "./read-only";

// Read-only contract (ADR-0018). jsdom asserts the *wiring + behavior matrix* (the editable/readOnly
// facets, the live compartment flip, and that the doc-mutating entry points stay inert); the rendered
// click-to-focus / scroll geometry is carved out for browser verification (invariant #4).

let view: EditorView | null = null;

function makeView(doc: string, readOnly?: boolean, onChange?: (value: string) => void): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions({ readOnly, onChange }) }),
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

async function waitFor<T>(get: () => T | null): Promise<T> {
  await until(() => get() !== null);
  return get() as T;
}

describe("read-only widget buttons never mutate the document (#1239)", () => {
  const DOC = "| A | B |\n| --- | --- |\n| 1 | 2 |\n";

  it("task checkbox mousedown leaves the doc unchanged and fires no onChange", async () => {
    const calls: string[] = [];
    const v = makeView("- [ ] task\n\nafter", true, (s) => calls.push(s));
    v.dispatch({ selection: { anchor: v.state.doc.length } });
    const box = (await waitFor(() => v.dom.querySelector(".cm-task-checkbox"))) as HTMLElement;
    box.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    expect(v.state.doc.toString()).toBe("- [ ] task\n\nafter");
    expect(calls).toHaveLength(0);
  });

  it("an editable editor toggles the checkbox and fires onChange once (positive control)", async () => {
    const calls: string[] = [];
    const v = makeView("- [ ] task\n\nafter", false, (s) => calls.push(s));
    v.dispatch({ selection: { anchor: v.state.doc.length } });
    const box = (await waitFor(() => v.dom.querySelector(".cm-task-checkbox"))) as HTMLElement;
    box.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    expect(v.state.doc.toString()).toBe("- [x] task\n\nafter");
    expect(calls).toEqual(["- [x] task\n\nafter"]);
  });

  it.each(["cm-table-add-col", "cm-table-add-row"])(
    "%s click leaves the table unchanged and fires no onChange",
    async (cls) => {
      const calls: string[] = [];
      const v = makeView(DOC, true, (s) => calls.push(s));
      const btn = (await waitFor(() => v.dom.querySelector("." + cls))) as HTMLElement;
      btn.click();
      expect(v.state.doc.toString()).toBe(DOC);
      expect(calls).toHaveLength(0);
    },
  );

  it("an editable editor adds a column and fires onChange once (positive control)", async () => {
    const calls: string[] = [];
    const v = makeView(DOC, false, (s) => calls.push(s));
    const btn = (await waitFor(() => v.dom.querySelector(".cm-table-add-col"))) as HTMLElement;
    btn.click();
    expect(v.state.doc.toString()).not.toBe(DOC);
    expect(calls).toHaveLength(1);
  });

  it("the column grip opens no menu when read-only", async () => {
    const v = makeView(DOC, true);
    const grip = (await waitFor(() => v.dom.querySelector(".cm-col-grip"))) as HTMLElement;
    grip.click();
    expect(document.body.textContent).not.toContain("Delete table");
  });
});
