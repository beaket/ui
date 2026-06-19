import { EditorState } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import type { AnchorStatus } from "../anchor";
import { editorExtensions } from "../create-editor";
import type { HighlightInput } from "./highlight-layer";
import {
  buildHighlights,
  createHighlightController,
  highlightField,
  highlightLayer,
  setActiveHighlightEffect,
  setHighlightsEffect,
} from "./highlight-layer";

// Highlight layer contract (ADR-0014 surface step). The coordinate-independent parts (buildHighlights, field mapping, status)
// are deterministic jsdom tests. Actual coloring, smudging, and rect are verified in the 5173 browser.

function rangesOf(set: DecorationSet): { from: number; to: number; id: string | undefined }[] {
  const out: { from: number; to: number; id: string | undefined }[] = [];
  set.between(0, 1e9, (from, to, deco) => {
    out.push({
      from,
      to,
      id: (deco.spec.attributes as Record<string, string>)?.["data-highlight-id"],
    });
  });
  return out;
}

describe("buildHighlights — pure re-resolution → decorations + status", () => {
  it("builds an exact anchor into a mark decoration at the exact position + exact status", () => {
    const state = EditorState.create({ doc: "The quick brown fox" });
    const r = buildHighlights(state, [{ id: "q1", anchor: { quote: "quick", offset: 4 } }]);
    expect(r.statuses.get("q1")).toBe("exact");
    expect(rangesOf(r.decorations)).toEqual([{ from: 4, to: 9, id: "q1" }]);
  });

  it("orphaned anchor leaves only status, no decoration", () => {
    const state = EditorState.create({ doc: "nothing matches here" });
    const r = buildHighlights(state, [
      { id: "q1", anchor: { quote: "deleted phrase", offset: 2 } },
    ]);
    expect(r.statuses.get("q1")).toBe("orphaned");
    expect(rangesOf(r.decorations)).toEqual([]);
  });

  it("approximate anchor yields a decoration + approximate status", () => {
    const state = EditorState.create({ doc: "The quick brown fox leaps over the lazy dog" });
    const r = buildHighlights(state, [
      { id: "q1", anchor: { quote: "The quick brown fox jumps", offset: 0 } },
    ]);
    expect(r.statuses.get("q1")).toBe("approximate");
    expect(rangesOf(r.decorations)).toHaveLength(1);
  });
});

describe("highlightField — in-session tracking (mapPos) + status emission", () => {
  let view: EditorView | null = null;
  afterEach(() => {
    view?.destroy();
    view = null;
  });

  function mount(doc: string, onStatus?: (m: Map<string, AnchorStatus>) => void): EditorView {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [highlightLayer({ onHighlightStatusChange: onStatus })],
      }),
      parent,
    });
    return view;
  }

  function setHl(v: EditorView, list: HighlightInput[]): void {
    v.dispatch({ effects: setHighlightsEffect.of(list) });
  }

  it("setHighlights creates decorations and the status callback fires with the map", () => {
    let last: Map<string, AnchorStatus> | null = null;
    const v = mount("The quick brown fox", (m) => (last = m));
    setHl(v, [{ id: "q1", anchor: { quote: "quick", offset: 4 } }]);
    expect(rangesOf(v.state.field(highlightField).decorations)).toEqual([
      { from: 4, to: 9, id: "q1" },
    ]);
    expect(last && (last as Map<string, AnchorStatus>).get("q1")).toBe("exact");
  });

  it("decoration position follows when text is inserted before it (mapPos, not re-resolution)", () => {
    const v = mount("The quick brown fox");
    setHl(v, [{ id: "q1", anchor: { quote: "quick", offset: 4 } }]);
    v.dispatch({ changes: { from: 0, insert: "PRE " }, userEvent: "input.type" });
    expect(rangesOf(v.state.field(highlightField).decorations)).toEqual([
      { from: 8, to: 13, id: "q1" },
    ]);
  });

  it("docChange does not re-emit status (only setHighlights does)", () => {
    const seen: number[] = [];
    const v = mount("The quick brown fox", (m) => seen.push(m.size));
    setHl(v, [{ id: "q1", anchor: { quote: "quick", offset: 4 } }]); // once
    v.dispatch({ changes: { from: 0, insert: "X" }, userEvent: "input.type" });
    expect(seen).toEqual([1]); // no extra emission on insert
  });
});

function classesOf(set: DecorationSet): { id: string | undefined; cls: string | undefined }[] {
  const out: { id: string | undefined; cls: string | undefined }[] = [];
  set.between(0, 1e9, (_f, _t, deco) => {
    out.push({
      id: (deco.spec.attributes as Record<string, string>)?.["data-highlight-id"],
      cls: deco.spec.class as string | undefined,
    });
  });
  return out;
}

describe("activeHighlightId — declarative active class (decision 5)", () => {
  let view: EditorView | null = null;
  afterEach(() => {
    view?.destroy();
    view = null;
  });
  function mount(doc: string, onStatus?: (m: Map<string, AnchorStatus>) => void): EditorView {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [highlightLayer({ onHighlightStatusChange: onStatus })],
      }),
      parent,
    });
    return view;
  }

  it("setActiveHighlight applies the active class only to the matching id", () => {
    const v = mount("The quick brown fox");
    v.dispatch({
      effects: setHighlightsEffect.of([
        { id: "a", anchor: { quote: "quick", offset: 4 } },
        { id: "b", anchor: { quote: "brown", offset: 10 } },
      ]),
    });
    v.dispatch({ effects: setActiveHighlightEffect.of("b") });
    const cls = classesOf(v.state.field(highlightField).decorations);
    expect(cls.find((c) => c.id === "a")?.cls).toBe("cm-annotation-highlight");
    expect(cls.find((c) => c.id === "b")?.cls).toContain("cm-annotation-active");
  });

  it("with active(null) the active class is nowhere", () => {
    const v = mount("The quick brown fox");
    v.dispatch({
      effects: setHighlightsEffect.of([{ id: "a", anchor: { quote: "quick", offset: 4 } }]),
    });
    v.dispatch({ effects: setActiveHighlightEffect.of("a") });
    v.dispatch({ effects: setActiveHighlightEffect.of(null) });
    expect(classesOf(v.state.field(highlightField).decorations)[0].cls).toBe(
      "cm-annotation-highlight",
    );
  });

  it("setting active to an orphaned/non-existent id is a no-op (no throw)", () => {
    const v = mount("The quick brown fox");
    v.dispatch({
      effects: setHighlightsEffect.of([{ id: "a", anchor: { quote: "quick", offset: 4 } }]),
    });
    expect(() => v.dispatch({ effects: setActiveHighlightEffect.of("ghost") })).not.toThrow();
    expect(classesOf(v.state.field(highlightField).decorations)[0].cls).toBe(
      "cm-annotation-highlight",
    );
  });

  it("changing active does not re-emit onHighlightStatusChange (status ref stable)", () => {
    const seen: number[] = [];
    const v = mount("The quick brown fox", (m) => seen.push(m.size));
    v.dispatch({
      effects: setHighlightsEffect.of([{ id: "a", anchor: { quote: "quick", offset: 4 } }]),
    }); // once
    v.dispatch({ effects: setActiveHighlightEffect.of("a") });
    v.dispatch({ effects: setActiveHighlightEffect.of(null) });
    expect(seen).toEqual([1]);
  });

  it("boundary: input right after a highlight does not grow the range, but input inside it is tracked", () => {
    const v = mount("The quick brown fox");
    v.dispatch({
      effects: setHighlightsEffect.of([{ id: "a", anchor: { quote: "quick", offset: 4 } }]),
    }); // 4..9
    v.dispatch({ changes: { from: 9, insert: "X" }, userEvent: "input.type" }); // right after
    expect(rangesOf(v.state.field(highlightField).decorations)).toEqual([
      { from: 4, to: 9, id: "a" },
    ]);
    v.dispatch({ changes: { from: 6, insert: "Y" }, userEvent: "input.type" }); // inside
    expect(rangesOf(v.state.field(highlightField).decorations)).toEqual([
      { from: 4, to: 10, id: "a" },
    ]);
  });
});

describe("onHighlightClick — click reporting (decision 6)", () => {
  let view: EditorView | null = null;
  afterEach(() => {
    view?.destroy();
    view = null;
  });

  it("clicking a highlight span reports that id", () => {
    const clicked: string[] = [];
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({
        doc: "The quick brown fox",
        extensions: [highlightLayer({ onHighlightClick: (id) => clicked.push(id) })],
      }),
      parent,
    });
    view.dispatch({
      effects: setHighlightsEffect.of([{ id: "a", anchor: { quote: "quick", offset: 4 } }]),
    });
    const span = view.contentDOM.querySelector('[data-highlight-id="a"]') as HTMLElement;
    expect(span).toBeTruthy();
    span.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(clicked).toEqual(["a"]);
  });
});

describe("createHighlightController — IME guard", () => {
  let view: EditorView | null = null;
  afterEach(() => {
    view?.destroy();
    view = null;
  });

  function mount(doc: string): EditorView {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({ doc, extensions: [highlightLayer()] }),
      parent,
    });
    return view;
  }

  it("setHighlights during composition is held and applied after it ends", async () => {
    const v = mount("The quick brown fox");
    (v as unknown as { inputState: { composing: number } }).inputState.composing = 1;
    const ctl = createHighlightController(v);
    ctl.setHighlights([{ id: "q1", anchor: { quote: "quick", offset: 4 } }]);
    expect(v.state.field(highlightField).decorations.size).toBe(0); // held
    (v as unknown as { inputState: { composing: number } }).inputState.composing = -1;
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 20));
    expect(v.state.field(highlightField).decorations.size).toBe(1); // applied after settling
  });

  it("does not apply held changes after dispose", async () => {
    const v = mount("The quick brown fox");
    (v as unknown as { inputState: { composing: number } }).inputState.composing = 1;
    const ctl = createHighlightController(v);
    ctl.setHighlights([{ id: "q1", anchor: { quote: "quick", offset: 4 } }]);
    ctl.dispose();
    (v as unknown as { inputState: { composing: number } }).inputState.composing = -1;
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 20));
    expect(v.state.field(highlightField).decorations.size).toBe(0);
  });

  it("when both highlights+active are held during composition, they apply at once after settling (coalesce, active class correct)", async () => {
    const v = mount("The quick brown fox");
    (v as unknown as { inputState: { composing: number } }).inputState.composing = 1;
    const ctl = createHighlightController(v);
    ctl.setHighlights([{ id: "a", anchor: { quote: "quick", offset: 4 } }]);
    ctl.setActiveHighlight("a");
    expect(v.state.field(highlightField).decorations.size).toBe(0); // held
    (v as unknown as { inputState: { composing: number } }).inputState.composing = -1;
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 20));
    const cls = classesOf(v.state.field(highlightField).decorations);
    expect(cls).toHaveLength(1);
    expect(cls[0].cls).toContain("cm-annotation-active"); // final active reflected without stale
  });
});

describe("highlightField — does not throw even when resolved to table text (decision 4: graceful)", () => {
  let view: EditorView | null = null;
  afterEach(() => {
    view?.destroy();
    view = null;
  });

  it("mark decoration lays over without error even when the anchor matches table-cell text", () => {
    const doc = "| 키 | 값 |\n| --- | --- |\n| alpha | beta |\n";
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    // Verified over the full extension set (including tableWidget's atomic/replace decorations)
    view = new EditorView({
      state: EditorState.create({ doc, extensions: [editorExtensions(), highlightLayer()] }),
      parent,
    });
    expect(() => {
      view!.dispatch({
        effects: setHighlightsEffect.of([
          { id: "q1", anchor: { quote: "alpha", offset: doc.indexOf("alpha") } },
        ]),
      });
    }).not.toThrow();
    // status is exact (exists in source) but may be invisible since it's inside the table — the key point is that it doesn't throw
    expect(view.state.field(highlightField).statuses.get("q1")).toBe("exact");
  });
});
