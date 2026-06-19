import { selectAll } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";

// Regression: in a document containing a code block, when the document changes
// during Korean IME composition,
// "RangeError: Decorations that replace line breaks may not be specified via plugins"
// is thrown, breaking the view, after which all commands like Cmd+A die (reported 2026-06-13).
// Cause: the composing guard defers recomputation without mapping existing decorations to the changed coordinates.

interface ComposingStub {
  inputState: { composing: number };
}

let view: EditorView | null = null;

function makeView(doc: string, anchor = 0): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  view.dispatch({ selection: { anchor } });
  return view;
}

/** Like a real IME: raise the composition state and change the document step by step */
function composeKorean(v: EditorView, at: number, steps: string[]): void {
  v.contentDOM.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
  (v as unknown as ComposingStub).inputState.composing = 1;
  let len = 0;
  for (const step of steps) {
    v.dispatch({
      changes: { from: at, to: at + len, insert: step },
      selection: { anchor: at + step.length },
      userEvent: "input.type",
    });
    len = step.length;
  }
}

function endComposition(v: EditorView): void {
  (v as unknown as ComposingStub).inputState.composing = -1;
  v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("code block + IME composition regression", () => {
  const DOC = "가나다\n\n```js\nconst x = 1\n```";

  it("a document change during composition does not raise a decoration exception", () => {
    const v = makeView(DOC, 3);
    expect(() => composeKorean(v, 3, ["ㅇ", "아", "안"])).not.toThrow();
  });

  it("even during composition the code block fence stays hidden at the correct position (decoration coordinate mapping)", () => {
    const v = makeView(DOC, 3);
    composeKorean(v, 3, ["ㅇ", "아", "안"]);
    // The fence (```) stays hidden; only the body text and code content are visible
    const visible = v.contentDOM.textContent ?? "";
    expect(visible).not.toContain("```");
    expect(visible).toContain("가나다안");
    expect(visible).toContain("const x = 1");
  });

  it("select all (Cmd+A) works after composition ends", async () => {
    const v = makeView(DOC, 3);
    composeKorean(v, 3, ["ㅇ", "아", "안"]);
    endComposition(v);
    await new Promise((r) => setTimeout(r, 10));

    expect(selectAll(v)).toBe(true);
    expect(v.state.selection.main.from).toBe(0);
    expect(v.state.selection.main.to).toBe(v.state.doc.length);
  });

  it("committed composition text remains in the document and the view keeps working", async () => {
    const v = makeView(DOC, 3);
    composeKorean(v, 3, ["ㅎ", "하", "한"]);
    endComposition(v);
    await new Promise((r) => setTimeout(r, 10));

    expect(v.state.doc.line(1).text).toBe("가나다한");
    // Subsequent normal editing also works
    expect(() =>
      v.dispatch({ changes: { from: 4, insert: "!" }, userEvent: "input.type" }),
    ).not.toThrow();
    expect(v.state.doc.line(1).text).toBe("가나다한!");
  });
});

describe("inline marks + IME composition", () => {
  it("composing outside the bold range keeps the mark-hiding coordinates intact", () => {
    const v = makeView("**굵게** 뒤에서 입력\n\n일반 문단", 0);
    const pos = v.state.doc.line(1).to;
    v.dispatch({ selection: { anchor: pos } });
    composeKorean(v, pos, ["ㄱ", "가"]);
    const visible = v.contentDOM.textContent ?? "";
    expect(visible).not.toContain("**");
    expect(visible).toContain("굵게");
  });
});
