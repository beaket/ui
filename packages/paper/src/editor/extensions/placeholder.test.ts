import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";

// Placeholder option (ADR-0018). The hint is CodeMirror's `placeholder` extension, wired only when
// `placeholder` is set. Contract: it renders on an empty document and disappears once there is text.

let view: EditorView | null = null;

function makeView(doc: string, placeholder?: string): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions({ placeholder }) }),
    parent,
  });
  return view;
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("placeholder", () => {
  it("renders the hint text on an empty document", () => {
    const v = makeView("", "Write something…");
    const el = v.dom.querySelector(".cm-placeholder");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("Write something…");
  });

  it("shows no placeholder once the document is non-empty", () => {
    const v = makeView("already typed", "Write something…");
    expect(v.dom.querySelector(".cm-placeholder")).toBeNull();
  });

  it("wires nothing when the option is absent", () => {
    const v = makeView("");
    expect(v.dom.querySelector(".cm-placeholder")).toBeNull();
  });
});
