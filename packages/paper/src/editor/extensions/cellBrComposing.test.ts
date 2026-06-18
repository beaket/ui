import { selectAll } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { cellBrLineBreaks, cellNewlineToBr } from "./tableWidget";

// CJK first-class (ADR-0004): the hidden <br> decoration in a cell defers recomputation + maps during composition, and re-evaluates after it ends.
// Same regression layer (ADR-0005) as the code-block IME bug (a docChange during composition breaks the decoration and kills subsequent commands).

interface ComposingStub {
  inputState: { composing: number };
}

let view: EditorView | null = null;

function makeView(doc: string): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: [cellBrLineBreaks, cellNewlineToBr] }),
    parent,
  });
  return view;
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("cell <br> path IME guard", () => {
  it("renders <br> as a real line break widget, not as characters", () => {
    const v = makeView("사과<br>바나나");
    expect(v.contentDOM.querySelectorAll("br").length).toBe(1);
    // It's a widget replace, so the on-screen text has no "<br>" characters
    expect(v.contentDOM.textContent).not.toContain("<br>");
  });

  it("a docChange during composition does not break the decoration, and Cmd+A works after it ends", () => {
    const v = makeView("사과<br>바나나");
    // Start composition
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    (v as unknown as ComposingStub).inputState.composing = 1;
    // Document change during composition — the decoration should be deferred + mapped and must not throw
    expect(() => v.dispatch({ changes: { from: v.state.doc.length, insert: "가" } })).not.toThrow();
    // End composition
    (v as unknown as ComposingStub).inputState.composing = -1;
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    // The subsequent command (Cmd+A) must still be alive (code-block IME bug regression)
    expect(selectAll(v)).toBe(true);
    expect(v.state.selection.main.from).toBe(0);
    expect(v.state.selection.main.to).toBe(v.state.doc.length);
    // <br> is still rendered as a widget
    expect(v.contentDOM.querySelectorAll("br").length).toBe(1);
  });
});
