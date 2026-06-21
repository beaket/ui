import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";

// #471: the grip menu must escape the .cm-scroller overflow box so it is never clipped. We assert
// the structural fact (jsdom carries no real geometry, invariant #4): the open menu is a child of
// view.dom (.cm-editor, overflow:visible) and lives OUTSIDE .cm-scroller (overflow:auto).

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

const DOC = ["| a | b |", "| --- | --- |", "| 1 | 2 |"].join("\n");

describe("table grip menu overflow (#471)", () => {
  it("attaches the opened menu under .cm-editor and outside .cm-scroller", async () => {
    const v = makeView(DOC);
    await until(() => v.dom.querySelector(".cm-col-grip") !== null);
    const grip = v.dom.querySelector(".cm-col-grip") as HTMLElement;

    grip.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await until(() => v.dom.querySelector(".cm-table-menu") !== null);

    const menu = v.dom.querySelector(".cm-table-menu") as HTMLElement;
    // Direct child of the editor root, not nested in the scroller that clips overflow.
    expect(menu.parentElement).toBe(v.dom);
    expect(v.dom.querySelector(".cm-scroller")?.contains(menu)).toBe(false);
  });
});
