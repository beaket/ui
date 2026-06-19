import { EditorState } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { guardedDecorations } from "./composing-guard";

// Core contract of the CJK first-class gate:
// ① During composition, compute is not called (decoration recomputation is deferred)
// ② When the document changes during composition, existing decorations are mapped to new coordinates (view validity preserved)
// ③ When composition ends, it is re-evaluated precisely

interface ComposingStub {
  inputState: { composing: number };
}

let view: EditorView | null = null;

afterEach(() => {
  view?.destroy();
  view = null;
});

function makeView(doc: string, compute: (view: EditorView) => DecorationSet): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: [guardedDecorations("test", compute)] }),
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

describe("guardedDecorations", () => {
  it("does not call compute during composition and re-evaluates after it ends", async () => {
    let calls = 0;
    const v = makeView("가나다라", () => {
      calls++;
      return Decoration.none;
    });
    const baseline = calls;

    startComposing(v);
    v.dispatch({ changes: { from: 4, insert: "ㅁ" }, userEvent: "input.type" });
    v.dispatch({ changes: { from: 4, to: 5, insert: "마" }, userEvent: "input.type" });
    expect(calls).toBe(baseline); // ① deferred

    endComposing(v);
    await new Promise((r) => setTimeout(r, 10));
    expect(calls).toBeGreaterThan(baseline); // ③ re-evaluated
  });

  it("maps existing decorations when the document changes during composition (hidden position stays aligned)", () => {
    // Decoration that hides "나" — even if a character is inserted before it during composition, it must keep covering "나"
    const v = makeView("가나다", (vw) => {
      const idx = vw.state.doc.toString().indexOf("나");
      return idx < 0
        ? Decoration.none
        : Decoration.set([Decoration.replace({}).range(idx, idx + 1)]);
    });
    expect(v.contentDOM.textContent).toBe("가다");

    startComposing(v);
    v.dispatch({ changes: { from: 0, insert: "ㅇ" }, userEvent: "input.type" });
    // compute is deferred, but thanks to mapping "나" must still be covered
    expect(v.contentDOM.textContent).toBe("ㅇ가다"); // ②
  });
});
