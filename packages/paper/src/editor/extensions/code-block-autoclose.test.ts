import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { SyntaxNodeRef } from "@lezer/common";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { autoCloseFence } from "./code-block-autoclose";

// Enter on an opening fence line auto-inserts the matching close, parking the cursor on a blank
// middle line: ```js + Enter -> ```js / <cursor> / ``` . code-block-enter.ts owns the content lines.

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

// The closed-fence gate relies on a closed FencedCode having two CodeMark children and an
// unterminated one having a single CodeMark. Pin that parser assumption — if it ever shifts, the
// gate silently breaks (double-insert or never-insert) and these tests are the alarm.
describe("parser assumption: CodeMark count distinguishes open vs. closed fence", () => {
  function codeMarkCount(state: EditorState): number {
    let count = 0;
    syntaxTree(state).iterate({
      enter: (n: SyntaxNodeRef) => {
        if (n.name === "CodeMark") count++;
      },
    });
    return count;
  }
  it("an unterminated fence has exactly one CodeMark", () => {
    const v = makeView("```js\nhello", 0);
    expect(codeMarkCount(v.state)).toBe(1);
  });
  it("a closed fence has two CodeMarks", () => {
    const v = makeView("```js\nhello\n```", 0);
    expect(codeMarkCount(v.state)).toBe(2);
  });
});

describe("autoCloseFence — command behavior", () => {
  it("```js + Enter inserts the close and parks the cursor on the blank middle line", () => {
    const doc = "```js";
    const v = makeView(doc, doc.length);
    expect(autoCloseFence(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```js\n\n```");
    expect(v.state.selection.main.head).toBe(6); // start of the empty middle line
  });

  it("bare ``` + Enter auto-closes the same way", () => {
    const doc = "```";
    const v = makeView(doc, doc.length);
    expect(autoCloseFence(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```\n\n```");
    expect(v.state.selection.main.head).toBe(4);
  });

  it("preserves leading indentation on both the middle and closing lines", () => {
    const doc = "  ```ts";
    const v = makeView(doc, doc.length);
    expect(autoCloseFence(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("  ```ts\n  \n  ```");
    expect(v.state.selection.main.head).toBe(10); // after the 2-space indent on the middle line
  });

  it("does not double-close when the block already has a closing fence", () => {
    const doc = "```js\nhello\n```";
    const v = makeView(doc, 5); // cursor at the end of the opening ```js line
    expect(autoCloseFence(v)).toBe(false);
  });

  it("does not intervene on the closing fence line of a complete block", () => {
    const doc = "```\ncode\n```";
    const v = makeView(doc, doc.length); // cursor on the closing ```
    expect(autoCloseFence(v)).toBe(false);
  });

  it("does not intervene mid-line (cursor not at the end of the fence line)", () => {
    const doc = "```js";
    const v = makeView(doc, 3); // between ``` and js
    expect(autoCloseFence(v)).toBe(false);
  });

  it("does not intervene with a selection range", () => {
    const doc = "```js";
    const v = makeView(doc, doc.length);
    v.dispatch({ selection: { anchor: 0, head: doc.length } });
    expect(autoCloseFence(v)).toBe(false);
  });

  it("does not intervene on ordinary body text", () => {
    const doc = "일반 문단";
    const v = makeView(doc, doc.length);
    expect(autoCloseFence(v)).toBe(false);
  });
});

// The real wiring proof: a synthetic Enter through the fully-wired keymap (4+ Enter handlers compete).
// A direct-command test alone would stay green even if Enter never routed here.
describe("Enter keymap integration — routes to autoCloseFence on an opening fence line", () => {
  function pressEnter(v: EditorView) {
    v.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true, cancelable: true }),
    );
  }

  it("pressing Enter at the end of ```js completes the block", () => {
    const doc = "```js";
    const v = makeView(doc, doc.length);
    pressEnter(v);
    expect(v.state.doc.toString()).toBe("```js\n\n```");
    expect(v.state.selection.main.head).toBe(6);
  });

  it("Enter on a code content line still only keeps indentation (codeBlockEnter, not autoclose)", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    pressEnter(v);
    expect(v.state.doc.toString()).toBe("```\n    foo\n    ");
  });
});
