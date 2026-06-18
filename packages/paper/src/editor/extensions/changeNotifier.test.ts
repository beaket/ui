import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { changeNotifier, silentDocChange } from "./changeNotifier";

// onChange contract (ADR-0013 decision 4 + finalized 2026-06-17):
// ① Push the full markdown once per user edit (docChanged)
// ② setValue-style programmatic replacement (silentDocChange) does not echo — only user edits go out
// ③ During IME composition, defer; fire once with the final doc after compositionend settles (ADR-0004)
// ④ The initial mount (state construction) does not fire

interface ComposingStub {
  inputState: { composing: number };
}

let view: EditorView | null = null;

afterEach(() => {
  view?.destroy();
  view = null;
});

function makeView(doc: string, onChange: (v: string) => void): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: [changeNotifier(onChange)] }),
    parent,
  });
  return view;
}

function startComposing(v: EditorView): void {
  v.contentDOM.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
  (v as unknown as ComposingStub).inputState.composing = 1;
}

function endComposing(v: EditorView): void {
  (v as unknown as ComposingStub).inputState.composing = -1;
  v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
}

describe("changeNotifier", () => {
  it("does not fire on the initial mount", () => {
    const calls: string[] = [];
    makeView("가나다", (v) => calls.push(v));
    expect(calls).toEqual([]);
  });

  it("pushes the full markdown once per user edit", () => {
    const calls: string[] = [];
    const v = makeView("가나다", (s) => calls.push(s));
    v.dispatch({ changes: { from: 3, insert: "라" }, userEvent: "input.type" });
    expect(calls).toEqual(["가나다라"]);
  });

  it("silentDocChange (=setValue-style) changes do not echo", () => {
    const calls: string[] = [];
    const v = makeView("가나다", (s) => calls.push(s));
    v.dispatch({
      changes: { from: 0, to: 3, insert: "새 문서" },
      annotations: silentDocChange.of(true),
    });
    expect(calls).toEqual([]);
    // The doc actually changed, but there is no push
    expect(v.state.doc.toString()).toBe("새 문서");
  });

  it("defers during composition and fires once with the final doc after it ends", async () => {
    const calls: string[] = [];
    const v = makeView("가나다", (s) => calls.push(s));

    startComposing(v);
    v.dispatch({ changes: { from: 3, insert: "ㅁ" }, userEvent: "input.type" });
    v.dispatch({ changes: { from: 3, to: 4, insert: "마" }, userEvent: "input.type" });
    expect(calls).toEqual([]); // ③ deferred

    endComposing(v);
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toEqual(["가나다마"]); // once after settling, final doc
  });

  it("does nothing when onChange is not provided (existing test invariant)", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({ doc: "x", extensions: [changeNotifier(undefined)] }),
      parent,
    });
    view.dispatch({ changes: { from: 1, insert: "y" }, userEvent: "input.type" });
    expect(view.state.doc.toString()).toBe("xy"); // works without throwing
  });
});
