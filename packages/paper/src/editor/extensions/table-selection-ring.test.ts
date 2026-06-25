import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";

// Toggle .cm-table-selected on the widget when the table block is "selected" (the selection exactly matches the table range).

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

// The document is the table itself — table block range = [0, doc.length]
const DOC = ["| a | b |", "| --- | --- |", "| 1 | 2 |"].join("\n");

describe("tableSelectionRing", () => {
  it("adds the ring class when the selection matches the table range, and removes it when cleared", async () => {
    const v = makeView(DOC);
    await until(() => v.dom.querySelector(".cm-table-widget") !== null);
    const widget = v.dom.querySelector(".cm-table-widget") as HTMLElement;

    // Select the whole table → ring on
    v.dispatch({ selection: { anchor: 0, head: v.state.doc.length } });
    await until(() => widget.classList.contains("cm-table-selected"));
    expect(widget.classList.contains("cm-table-selected")).toBe(true);

    // Collapse the cursor → ring off
    v.dispatch({ selection: { anchor: 0 } });
    await until(() => !widget.classList.contains("cm-table-selected"));
    expect(widget.classList.contains("cm-table-selected")).toBe(false);
  });

  // The plugin skips DOM work when nothing is (or was) ring-selected, tracked by an internal `applied`
  // flag. Guard that the flag re-arms: the ring must turn back on after a full on→off cycle, and an
  // intervening plain caret move (which the early-out skips) must not strand it.
  it("re-arms the ring after on → off → caret move → on", async () => {
    const v = makeView(DOC);
    await until(() => v.dom.querySelector(".cm-table-widget") !== null);
    const widget = v.dom.querySelector(".cm-table-widget") as HTMLElement;

    v.dispatch({ selection: { anchor: 0, head: v.state.doc.length } });
    await until(() => widget.classList.contains("cm-table-selected"));

    v.dispatch({ selection: { anchor: 0 } }); // ring off (applied → null)
    await until(() => !widget.classList.contains("cm-table-selected"));

    v.dispatch({ selection: { anchor: 1 } }); // plain caret move — early-out skips, must not strand state
    await new Promise((r) => setTimeout(r, 30));
    expect(widget.classList.contains("cm-table-selected")).toBe(false);

    v.dispatch({ selection: { anchor: 0, head: v.state.doc.length } }); // ring on again
    await until(() => widget.classList.contains("cm-table-selected"));
    expect(widget.classList.contains("cm-table-selected")).toBe(true);
  });
});
