import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { blockquoteIndent, blockquoteNewline, blockquoteOutdent } from "./blockquote-keys";

// Enter model inside a blockquote (user decision, ADR-0009 decision 6):
//  - Line with content: continue the blockquote at the same depth (`> > foo` → next line `> > `).
//  - Empty blockquote line: escape the whole blockquote — remove all `>` regardless of depth (empty line in place). Depth 2 also exits
//    after Enter twice past content, just like depth 1. (Outdenting one level at a time is unnatural since the cursor doesn't move down → discarded.)
//  - List/task lines inside a blockquote yield to markdownKeymap (preserving markers); `>` inside a code block is ignored.

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

describe("Enter inside a blockquote — direct calls (branch logic)", () => {
  describe("line with content: continue at the same depth", () => {
    it("depth 1 (`> A` → `> A\\n> `)", () => {
      const v = makeView("> A", 3);
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> A\n> ");
      expect(v.state.selection.main.head).toBe(v.state.doc.length);
    });
    it("depth 2 (`> > B` → `> > B\\n> > `)", () => {
      const v = makeView("> > B", 5);
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > B\n> > ");
    });
    it("depth 3 (`> > > C` → `> > > C\\n> > > `)", () => {
      const v = makeView("> > > C", 7);
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > > C\n> > > ");
    });
    it("if the cursor is mid-content, split at the same depth", () => {
      const doc = "> > foobar";
      const v = makeView(doc, doc.indexOf("bar")); // foo|bar
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > foo\n> > bar");
    });
  });

  describe("empty blockquote line: escape the whole blockquote (depth-agnostic, leaves an empty separator line)", () => {
    // Escaping replaces the marker line with an empty line (`\n`) to **leave an empty separator line** — otherwise text typed
    // right below gets absorbed into the blockquote as a lazy continuation. The cursor goes to the new line below the separator (line.from+1).
    it("depth 1 (`> A\\n> ` → `> A\\n\\n`)", () => {
      const v = makeView("> A\n> ", 6);
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> A\n\n");
      expect(v.state.selection.main.head).toBe(v.state.doc.length);
    });
    it("depth 2 (`> > B\\n> > ` → `> > B\\n\\n`, escapes immediately instead of dropping to depth 1)", () => {
      const v = makeView("> > B\n> > ", 10);
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > B\n\n");
      expect(v.state.selection.main.head).toBe(v.state.doc.length);
    });
    it("depth 3 (`> > > C\\n> > > ` → `> > > C\\n\\n`)", () => {
      const v = makeView("> > > C\n> > > ", 13);
      expect(blockquoteNewline(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > > C\n\n");
    });
  });

  describe("yield (returns false) cases", () => {
    it("a body line that is not a blockquote", () => {
      expect(blockquoteNewline(makeView("일반 문단", 4))).toBe(false);
    });
    it("a line starting with `>` inside a code block (Blockquote node guard)", () => {
      const doc = "```\n> not a quote\n```";
      expect(blockquoteNewline(makeView(doc, doc.indexOf("not a quote")))).toBe(false);
    });
    it("list/task lines inside a blockquote → yield to markdownKeymap", () => {
      expect(blockquoteNewline(makeView("> - item", 8))).toBe(false);
      expect(blockquoteNewline(makeView("> 1. item", 9))).toBe(false);
      expect(blockquoteNewline(makeView("> - [ ] task", 12))).toBe(false);
    });
    it("cursor inside the blockquote prefix (`> > `) → prevents splitting mid-marker", () => {
      expect(blockquoteNewline(makeView("> > text", 2))).toBe(false);
    });
    it("does not intervene when there is a selection range", () => {
      const v = makeView("> A", 0);
      v.dispatch({ selection: { anchor: 0, head: 3 } });
      expect(blockquoteNewline(v)).toBe(false);
    });
  });
});

// Keymap integration: dispatch a real keydown to contentDOM to verify the whole keymap path. Since markdownKeymap (Prec.high)
// intercepts Enter for blockquote continuation, this deterministically confirms our handler (Prec.highest) must win.
// (Automated physical keys deliver keydown unreliably → this synthetic keydown is the real regression evidence.)
describe("Enter keymap integration — rapid sequence + input + Korean composition", () => {
  function pressEnter(v: EditorView) {
    v.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true, cancelable: true }),
    );
  }
  interface ComposingStub {
    inputState: { composing: number };
  }
  function composeKorean(v: EditorView, at: number, steps: string[]) {
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
    (v as unknown as ComposingStub).inputState.composing = -1;
    v.contentDOM.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
  }

  function lineElFor(v: EditorView, text: string) {
    return [...v.contentDOM.querySelectorAll(".cm-line")].find((el) => el.textContent === text);
  }

  it("depth 2: content → Enter (continue) → Enter (escape, empty separator line) → plain text input", () => {
    const v = makeView("> > 안쪽", 6);
    pressEnter(v); // > > 안쪽\n> >
    expect(v.state.doc.toString()).toBe("> > 안쪽\n> > ");
    pressEnter(v); // > > 안쪽\n\n  (escape + empty separator line)
    expect(v.state.doc.toString()).toBe("> > 안쪽\n\n");
    v.dispatch(v.state.replaceSelection("바깥")); // plain text outside the blockquote
    expect(v.state.doc.toString()).toBe("> > 안쪽\n\n바깥");
  });

  it("text typed after escaping renders outside the blockquote (lazy continuation regression — core)", () => {
    const v = makeView("> > 안쪽", 6);
    pressEnter(v);
    pressEnter(v);
    v.dispatch(v.state.replaceSelection("바깥"));
    // Without the empty separator line, `바깥` gets absorbed into the blockquote above and receives .cm-blockquote-line (bug).
    const el = lineElFor(v, "바깥");
    expect(el).toBeTruthy();
    expect(el?.classList.contains("cm-blockquote-line")).toBe(false);
  });

  it("depth 3 also fully escapes with one Enter on the empty line (Enter twice past content)", () => {
    const v = makeView("> > > C", 7);
    pressEnter(v);
    expect(v.state.doc.toString()).toBe("> > > C\n> > > ");
    pressEnter(v);
    expect(v.state.doc.toString()).toBe("> > > C\n\n");
  });

  it('"Enter twice + Korean composition" — composition guard intact, text lands outside the blockquote (ADR-0004)', () => {
    const v = makeView("> > 안쪽", 6);
    pressEnter(v);
    pressEnter(v); // empty separator line + cursor on the new line below it
    const at = v.state.selection.main.head;
    expect(() => composeKorean(v, at, ["ㅎ", "하", "한", "한그", "한글"])).not.toThrow();
    expect(v.state.doc.toString()).toBe("> > 안쪽\n\n한글");
    expect(lineElFor(v, "한글")?.classList.contains("cm-blockquote-line")).toBe(false);
  });

  it("Enter on a list line inside a blockquote: markdownKeymap continues both the blockquote and list markers", () => {
    const v = makeView("> - item", 8);
    pressEnter(v);
    expect(v.state.doc.toString()).toBe("> - item\n> - ");
  });

  it("typing after Enter at the end of a blockquote content line → keeps the same depth", () => {
    const v = makeView("> 인용", 4);
    pressEnter(v);
    v.dispatch(v.state.replaceSelection("다음줄"));
    expect(v.state.doc.toString()).toBe("> 인용\n> 다음줄");
  });
});

describe("Tab/Shift+Tab — blockquote level change (empty blockquote line)", () => {
  // When the cursor is on that line, the `>` marker is visible and included in textContent, so find via includes.
  // (The depth class cm-bq-d{n} is attached regardless of cursor.)
  function lineElFor(v: EditorView, text: string) {
    return [...v.contentDOM.querySelectorAll(".cm-line")].find((el) =>
      el.textContent?.includes(text),
    );
  }

  describe("Tab: one level deeper", () => {
    it("empty `> > ` → `> > > ` (depth 2→3)", () => {
      const v = makeView("> > 안쪽\n> > ", 11);
      expect(blockquoteIndent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > 안쪽\n> > > ");
    });
    it("empty `> ` → `> > ` (depth 1→2)", () => {
      const v = makeView("> 인용\n> ", 6);
      expect(blockquoteIndent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> 인용\n> > ");
    });
    it("content lines deepen too: `> > 내용` → `> > > 내용` (cursor stays at the end)", () => {
      const v = makeView("> > 내용", 6);
      expect(blockquoteIndent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > > 내용");
      expect(v.state.selection.main.head).toBe(v.state.doc.length);
    });
    it("does not intervene on non-blockquote lines", () => {
      expect(blockquoteIndent(makeView("일반", 2))).toBe(false);
    });
  });

  describe("Shift+Tab: one level shallower", () => {
    it("empty `> > ` → `>` separator line + `> ` (depth 2→1)", () => {
      const v = makeView("> > 안쪽\n> > ", 11);
      expect(blockquoteOutdent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > 안쪽\n>\n> ");
    });
    it("empty `> > > ` → `> >` separator line + `> > ` (depth 3→2)", () => {
      const v = makeView("> > > C\n> > > ", 13);
      expect(blockquoteOutdent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> > > C\n> >\n> > ");
    });
    it("empty `> ` (depth 1) → escape (empty separator line, same as Enter escape)", () => {
      const v = makeView("> 인용\n> ", 6);
      expect(blockquoteOutdent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> 인용\n\n");
    });
    it("content lines shallow too: `> > 내용` → `> 내용` (standalone line, shrinks only the prefix)", () => {
      const v = makeView("> > 내용", 6);
      expect(blockquoteOutdent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("> 내용");
      expect(v.state.selection.main.head).toBe(v.state.doc.length);
    });
    it("depth 1 content line → remove blockquote (plain text): `> 내용` → `내용`", () => {
      const v = makeView("> 내용", 4);
      expect(blockquoteOutdent(v)).toBe(true);
      expect(v.state.doc.toString()).toBe("내용");
    });
    it("does not intervene on non-blockquote lines", () => {
      expect(blockquoteOutdent(makeView("일반", 2))).toBe(false);
    });
  });

  // Core check: after Shift+Tab, typing in place should render at one level shallower
  // (whether the separator line breaks the lazy continuation). After Tab, at one level deeper.
  it("typing after Shift+Tab → renders at one level shallower (depth 2→1)", () => {
    const v = makeView("> > 안쪽\n> > ", 11);
    blockquoteOutdent(v);
    v.dispatch(v.state.replaceSelection("한단계위"));
    expect(v.state.doc.toString()).toBe("> > 안쪽\n>\n> 한단계위");
    expect(lineElFor(v, "한단계위")?.classList.contains("cm-bq-d1")).toBe(true);
    expect(lineElFor(v, "한단계위")?.classList.contains("cm-bq-d2")).toBe(false);
  });

  it("typing after Tab → renders at one level deeper (depth 2→3)", () => {
    const v = makeView("> > 안쪽\n> > ", 11);
    blockquoteIndent(v);
    v.dispatch(v.state.replaceSelection("더깊이"));
    expect(v.state.doc.toString()).toBe("> > 안쪽\n> > > 더깊이");
    expect(lineElFor(v, "더깊이")?.classList.contains("cm-bq-d3")).toBe(true);
  });

  it("standalone content line Shift+Tab → renders at one level shallower (`> > 내용` → `> 내용`, d1)", () => {
    const v = makeView("> > 내용", 6);
    blockquoteOutdent(v);
    expect(lineElFor(v, "내용")?.classList.contains("cm-bq-d1")).toBe(true);
    expect(lineElFor(v, "내용")?.classList.contains("cm-bq-d2")).toBe(false);
  });

  it("content line Tab → renders at one level deeper (`> > 내용` → `> > > 내용`, d3)", () => {
    const v = makeView("> > 내용", 6);
    blockquoteIndent(v);
    expect(lineElFor(v, "내용")?.classList.contains("cm-bq-d3")).toBe(true);
  });
});
