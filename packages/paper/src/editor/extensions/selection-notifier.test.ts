import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { markdownExtension } from "./markdown";
import type { SelectionInfo } from "./selection-notifier";
import { selectionNotifier } from "./selection-notifier";

// onSelect contract (ADR-0014 decisions 5·6). Reports the selection in source coordinates: { text, anchor, rect (screen coords) }.
// text/anchor are coordinate-independent (jsdom-deterministic); rect comes from coordsAtPos, so it's null in jsdom (left to browser verification).
// Held during IME composition + fires after settling (ADR-0004).

interface ComposingStub {
  inputState: { composing: number };
}

let view: EditorView | null = null;

afterEach(() => {
  view?.destroy();
  view = null;
});

function mount(doc: string, onSelect: (s: SelectionInfo | null) => void): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: [markdownExtension(), selectionNotifier(onSelect)],
    }),
    parent,
  });
  return view;
}

describe("selectionNotifier", () => {
  it("reports text and anchor for a non-empty selection", () => {
    const calls: (SelectionInfo | null)[] = [];
    const v = mount("The quick brown fox", (s) => calls.push(s));
    v.dispatch({ selection: { anchor: 4, head: 9 } }); // "quick"
    const last = calls.at(-1);
    expect(last).toMatchObject({ text: "quick", anchor: { quote: "quick", offset: 4 } });
  });

  it("a selection whose endpoint falls inside a hidden marker gives a snapped, clean anchor", () => {
    const calls: (SelectionInfo | null)[] = [];
    const v = mount("a **bold** b", (s) => calls.push(s));
    v.dispatch({ selection: { anchor: 3, head: 9 } }); // both ends inside '**' → 'bold'
    expect(calls.at(-1)).toMatchObject({ text: "bold", anchor: { quote: "bold", offset: 4 } });
  });

  it("empty selection (cursor) yields onSelect(null)", () => {
    const calls: (SelectionInfo | null)[] = [];
    const v = mount("hello", (s) => calls.push(s));
    v.dispatch({ selection: { anchor: 2 } });
    expect(calls.at(-1)).toBeNull();
  });

  it("holds selection changes during composition and fires after it ends", async () => {
    const calls: (SelectionInfo | null)[] = [];
    const v = mount("The quick brown fox", (s) => calls.push(s));
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    (v as unknown as ComposingStub).inputState.composing = 1;
    v.dispatch({ selection: { anchor: 4, head: 9 } });
    expect(calls).toEqual([]); // held
    (v as unknown as ComposingStub).inputState.composing = -1;
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 20));
    expect(calls.at(-1)).toMatchObject({ text: "quick" }); // fires after settling
  });
});
