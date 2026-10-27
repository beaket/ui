import { afterEach, describe, expect, it } from "vitest";
import { createEditor, type PaperEditor } from "./create-editor";

// PaperEditor handle contract (ADR-0024): the vanilla core gets the same IME-safe behavior the React
// wrapper always had. The deferral itself is proven per controller (value-controller.test,
// highlight-layer.test); this locks that the handle routes through them rather than raw dispatch.

interface ComposingStub {
  inputState: { composing: number };
}

let editor: PaperEditor | null = null;

afterEach(() => {
  editor?.destroy();
  editor = null;
});

function mount(doc: string, opts: Parameters<typeof createEditor>[1] = {}): PaperEditor {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  editor = createEditor(parent, { doc, ...opts });
  return editor;
}

function setComposing(e: PaperEditor, n: number): void {
  (e.getView() as unknown as ComposingStub).inputState.composing = n;
}

const settle = () => new Promise((r) => setTimeout(r, 0));

describe("createEditor handle", () => {
  it("reads and replaces the document without echoing onChange", () => {
    const changes: string[] = [];
    const e = mount("옛 문서", { onChange: (v) => changes.push(v) });
    expect(e.getValue()).toBe("옛 문서");
    e.setValue("새 문서");
    expect(e.getValue()).toBe("새 문서");
    expect(changes).toEqual([]);
  });

  it("defers setValue during composition and applies it after compositionend", async () => {
    const e = mount("옛 문서");
    setComposing(e, 1);
    e.setValue("새 문서");
    expect(e.getValue()).toBe("옛 문서");

    setComposing(e, 0);
    e.getView().contentDOM.dispatchEvent(new CompositionEvent("compositionend"));
    await settle();
    expect(e.getValue()).toBe("새 문서");
  });

  it("defers setHighlights during composition and applies it after compositionend", async () => {
    const statuses: Map<string, string>[] = [];
    const e = mount("가나다 라마바", { onHighlightStatusChange: (m) => statuses.push(new Map(m)) });
    setComposing(e, 1);
    e.setHighlights([{ id: "h1", anchor: { quote: "라마바", offset: 4 } }]);
    expect(statuses).toEqual([]);

    setComposing(e, 0);
    e.getView().contentDOM.dispatchEvent(new CompositionEvent("compositionend"));
    await settle();
    expect(statuses.at(-1)?.get("h1")).toBe("exact");
  });

  it("reports the selection range and text, null when empty", () => {
    const e = mount("hello world");
    expect(e.getSelection()).toBeNull();
    e.getView().dispatch({ selection: { anchor: 0, head: 5 } });
    expect(e.getSelection()).toEqual({ from: 0, to: 5, text: "hello" });
  });

  it("flips read-only and color scheme live, without recreating the view", () => {
    const e = mount("text");
    const view = e.getView();
    e.setReadOnly(true);
    expect(view.state.readOnly).toBe(true);
    e.setReadOnly(false);
    expect(view.state.readOnly).toBe(false);
    e.setColorScheme("dark");
    expect(view.dom.style.colorScheme).toBe("dark");
    expect(e.getView()).toBe(view);
  });

  it("destroy releases the view and cancels a deferred value", async () => {
    const e = mount("옛 문서");
    setComposing(e, 1);
    e.setValue("새 문서");
    const view = e.getView();
    e.destroy();
    editor = null;
    view.contentDOM.dispatchEvent(new CompositionEvent("compositionend"));
    await settle();
    expect(view.dom.isConnected).toBe(false);
  });
});
