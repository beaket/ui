import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { codeBlockNewline } from "./code-block-enter";

// Regression: Enter inside a code block only "keeps the current line's indentation" (bypassing language syntactic auto-indent).
// Prevents the problem where deeply indented code accumulated indentation line by line.

let view: EditorView | null = null;

function makeView(doc: string, anchor: number): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  view.dispatch({ selection: { anchor } });
  return view;
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("Enter inside a code block — keep indentation (prevent accumulation)", () => {
  it("Enter at the end of an indented code line copies only the same indentation", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    expect(codeBlockNewline(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```\n    foo\n    ");
  });

  it("successive Enters do not accumulate indentation (stays at 4 spaces)", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    codeBlockNewline(v); // -> one line of "    "
    codeBlockNewline(v); // -> "    " again (not 8 spaces)
    const lines = v.state.doc.toString().split("\n");
    expect(lines).toEqual(["```", "    foo", "    ", "    "]);
  });

  it("does not intervene on a fence delimiter (```) line (yields to default behavior)", () => {
    const doc = "```python";
    const v = makeView(doc, doc.length);
    expect(codeBlockNewline(v)).toBe(false);
  });

  it("does not intervene in normal body text outside a code block", () => {
    const doc = "일반 문단";
    const v = makeView(doc, doc.length);
    expect(codeBlockNewline(v)).toBe(false);
  });

  it("does not intervene when there is a selection range", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    v.dispatch({ selection: { anchor: 4, head: 8 } });
    expect(codeBlockNewline(v)).toBe(false);
  });
});
