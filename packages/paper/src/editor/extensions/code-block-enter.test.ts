import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { codeBlockDedent, codeBlockIndent, codeBlockNewline } from "./code-block-enter";

// Regression: Enter inside a code block only "keeps the current line's indentation" (bypassing language syntactic auto-indent).
// Prevents the problem where deeply indented code accumulated indentation line by line.

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

describe("Enter inside a code block — keep indentation (prevent accumulation)", () => {
  it("Enter at the end of an indented code line copies only the same indentation", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    expect(codeBlockNewline(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```\n    foo\n    ");
  });

  it("successive Enters do not accumulate indentation (stays at 4 spaces)", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    codeBlockNewline(v); // -> one line of "    "
    codeBlockNewline(v); // -> "    " again (not 8 spaces)
    const lines = v.state.doc.toString().split("\n");
    expect(lines).toEqual(["```", "    foo", "    ", "    "]);
  });

  it("does not intervene on a fence delimiter (```) line (yields to default behavior)", () => {
    const doc = "```python";
    const v = makeView(doc, doc.length);
    expect(codeBlockNewline(v)).toBe(false);
  });

  it("does not intervene in normal body text outside a code block", () => {
    const doc = "일반 문단";
    const v = makeView(doc, doc.length);
    expect(codeBlockNewline(v)).toBe(false);
  });

  it("does not intervene when there is a selection range", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    v.dispatch({ selection: { anchor: 4, head: 8 } });
    expect(codeBlockNewline(v)).toBe(false);
  });
});

// Tab/Shift+Tab inside a fenced code block (ADR-0022): VSCode-style indent via insertTab/indentLess,
// scoped to code content lines. Default indentUnit is 2 spaces.
describe("Tab/Shift+Tab inside a code block — VSCode-style indent", () => {
  it("Tab with an empty selection inserts one indent unit (2 spaces) at the cursor", () => {
    const doc = "```\nfoo";
    const v = makeView(doc, doc.length); // cursor at end of `foo`
    expect(codeBlockIndent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```\nfoo  ");
  });

  it("Tab with a multi-line selection indents every spanned line", () => {
    const doc = "```\nfoo\nbar\n```";
    const v = makeView(doc, 0);
    v.dispatch({ selection: { anchor: 4, head: 11 } }); // across `foo` and `bar`
    expect(codeBlockIndent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```\n  foo\n  bar\n```");
  });

  it("Shift+Tab outdents the current line", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    expect(codeBlockDedent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("```\n  foo");
  });

  it("yields (returns false) outside a code block", () => {
    expect(codeBlockIndent(makeView("plain text", 5))).toBe(false);
    expect(codeBlockDedent(makeView("plain text", 5))).toBe(false);
  });

  it("yields on a fence delimiter line so Tab can't break the fence", () => {
    const doc = "```\nfoo\n```";
    const v = makeView(doc, 1); // on the opening ``` line
    expect(codeBlockIndent(v)).toBe(false);
  });
});

// Keymap integration: a real keydown to contentDOM exercises the whole keymap path — the
// project-sanctioned evidence for keymap precedence (synthetic keydown, not browser automation which
// may swallow Tab for focus). Confirms codeBlockEnter's Tab (Prec.high) is reached: the list/blockquote
// handlers (Prec.highest) yield inside a fence.
describe("Tab keymap integration inside a code block", () => {
  function press(v: EditorView, key: string, shift = false) {
    v.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key, shiftKey: shift, bubbles: true, cancelable: true }),
    );
  }

  it("Tab on a code content line inserts an indent unit", () => {
    const doc = "```\nfoo";
    const v = makeView(doc, doc.length);
    press(v, "Tab");
    expect(v.state.doc.toString()).toBe("```\nfoo  ");
  });

  it("Shift+Tab on an indented code line outdents it", () => {
    const doc = "```\n    foo";
    const v = makeView(doc, doc.length);
    press(v, "Tab", true);
    expect(v.state.doc.toString()).toBe("```\n  foo");
  });
});
