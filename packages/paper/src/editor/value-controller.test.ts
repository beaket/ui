import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { changeNotifier } from "./extensions/change-notifier";
import { createValueController } from "./value-controller";

// setValue contract (ADR-0013 decision 3 + ADR-0004 IME guard):
// ① In the non-composing state, replace the entire doc immediately
// ② The replacement is marked with silentDocChange so it does not echo onChange (finalized 2026-06-17)
// ③ Calls during IME composition are deferred and applied after compositionend settles
// ④ After dispose, the deferred value is not applied either (StrictMode unmount safety)

interface ComposingStub {
  inputState: { composing: number };
}

let view: EditorView | null = null;

afterEach(() => {
  view?.destroy();
  view = null;
});

function makeView(doc: string, onChange?: (v: string) => void): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: [changeNotifier(onChange)] }),
    parent,
  });
  return view;
}

function setComposing(v: EditorView, n: number): void {
  (v as unknown as ComposingStub).inputState.composing = n;
}

describe("createValueController", () => {
  it("replaces the entire doc immediately in the non-composing state", () => {
    const v = makeView("옛 문서");
    const ctl = createValueController(v);
    ctl.setValue("새 문서");
    expect(v.state.doc.toString()).toBe("새 문서");
  });

  it("the replacement does not echo onChange (silentDocChange)", () => {
    const calls: string[] = [];
    const v = makeView("옛 문서", (s) => calls.push(s));
    const ctl = createValueController(v);
    ctl.setValue("새 문서");
    expect(calls).toEqual([]);
  });

  it("calls during composition are deferred and applied after it ends", async () => {
    const v = makeView("옛 문서");
    const ctl = createValueController(v);

    setComposing(v, 1);
    ctl.setValue("새 문서");
    expect(v.state.doc.toString()).toBe("옛 문서"); // ③ deferred — does not break composition

    setComposing(v, -1);
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 20));
    expect(v.state.doc.toString()).toBe("새 문서");
  });

  it("does not apply the deferred value after dispose", async () => {
    const v = makeView("옛 문서");
    const ctl = createValueController(v);

    setComposing(v, 1);
    ctl.setValue("새 문서");
    ctl.dispose();

    setComposing(v, -1);
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 20));
    expect(v.state.doc.toString()).toBe("옛 문서");
  });
});
