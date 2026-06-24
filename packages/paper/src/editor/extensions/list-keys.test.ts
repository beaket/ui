import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { listIndent, listOutdent } from "./list-keys";

// List Tab/Shift+Tab (ADR-0022). Tab nests the current item under its preceding sibling; Shift+Tab
// lifts it one level (or strips the marker at top level). The whole item subtree shifts by a uniform
// delta. The discriminating assertion is not "how many spaces" but "did the syntax tree nest deeper" —
// a space count can pass while the rendered nesting is broken (CommonMark needs the parent's content
// column exactly; 4 spaces on a plain line is a code block, not a nested item).

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

/** Number of ListItem ancestors wrapping `pos` — the real nesting depth in the parsed tree. */
function listDepthAt(v: EditorView, pos: number): number {
  let depth = 0;
  for (let n: SyntaxNode | null = syntaxTree(v.state).resolveInner(pos, -1); n; n = n.parent) {
    if (n.name === "ListItem") depth++;
  }
  return depth;
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("Tab — nest the current item one level deeper", () => {
  it("bullet: `- A\\n- B` with cursor on B nests B under A (`- A\\n  - B`)", () => {
    const doc = "- A\n- B";
    const v = makeView(doc, doc.length); // cursor at end of B
    expect(listDepthAt(v, doc.length)).toBe(1);
    expect(listIndent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("- A\n  - B");
    // The real check: B is now a nested ListItem (depth 2), not merely "two spaces deeper".
    expect(listDepthAt(v, v.state.doc.length)).toBe(2);
  });

  it("ordered: nests to the parent's content column (3 under `1. `), marker kept (no renumber, v1)", () => {
    const doc = "1. A\n1. B";
    const v = makeView(doc, doc.length);
    expect(listIndent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("1. A\n   1. B");
    expect(listDepthAt(v, v.state.doc.length)).toBe(2);
  });

  it("first item of a list has no preceding sibling → consumed no-op (not a focus escape)", () => {
    const doc = "- A\n- B";
    const v = makeView(doc, 3); // cursor on A
    expect(listIndent(v)).toBe(true); // consumed
    expect(v.state.doc.toString()).toBe(doc); // unchanged
  });

  it("carries the whole subtree: indenting B also shifts its child C", () => {
    const doc = "- A\n- B\n  - C";
    const v = makeView(doc, 6); // cursor on B
    expect(listIndent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("- A\n  - B\n    - C");
  });
});

describe("Shift+Tab — lift the current item one level shallower", () => {
  it("nested → sibling of parent: `- A\\n  - B` (cursor on B) → `- A\\n- B`", () => {
    const doc = "- A\n  - B";
    const v = makeView(doc, doc.length);
    expect(listDepthAt(v, doc.length)).toBe(2);
    expect(listOutdent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("- A\n- B");
    expect(listDepthAt(v, v.state.doc.length)).toBe(1);
  });

  it("top-level bullet → strip the marker into a paragraph: `- A` → `A`", () => {
    const doc = "- A";
    const v = makeView(doc, doc.length);
    expect(listOutdent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("A");
    expect(listDepthAt(v, 0)).toBe(0);
  });

  it("top-level ordered → `1. A` → `A`", () => {
    const v = makeView("1. A", 4);
    expect(listOutdent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("A");
  });

  it("carries the whole subtree: outdenting B also shifts its child C", () => {
    const doc = "- A\n  - B\n    - C";
    const v = makeView(doc, 8); // cursor on B
    expect(listOutdent(v)).toBe(true);
    expect(v.state.doc.toString()).toBe("- A\n- B\n  - C");
  });
});

describe("yield (returns false) — Tab falls through to the default", () => {
  it("a plain paragraph", () => {
    expect(listIndent(makeView("hello", 5))).toBe(false);
    expect(listOutdent(makeView("hello", 5))).toBe(false);
  });

  it("a fenced code block inside a list item → yields so the code-block Tab handler owns it", () => {
    const doc = "- A\n  ```\n  code\n  ```";
    const v = makeView(doc, doc.indexOf("code") + 2);
    expect(listIndent(v)).toBe(false);
    expect(listOutdent(v)).toBe(false);
  });

  it("a range selection", () => {
    const v = makeView("- A\n- B", 0);
    v.dispatch({ selection: { anchor: 0, head: 7 } });
    expect(listIndent(v)).toBe(false);
  });
});

// Keymap integration: a real keydown to contentDOM exercises the whole keymap path, confirming
// listKeymap (Prec.highest, registered before blockquoteKeymap) claims list lines — including a list
// line inside a blockquote (the precedence the wiring is designed for).
describe("Tab keymap integration", () => {
  function press(v: EditorView, key: string, shift = false) {
    v.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key, shiftKey: shift, bubbles: true, cancelable: true }),
    );
  }

  it("Tab on a plain list line nests it", () => {
    const doc = "- A\n- B";
    const v = makeView(doc, doc.length);
    press(v, "Tab");
    expect(v.state.doc.toString()).toBe("- A\n  - B");
  });

  it("a list line inside a blockquote: Tab indents the list, not the quote", () => {
    const doc = "> - A\n> - B";
    const v = makeView(doc, doc.length); // cursor on the `> - B` line
    press(v, "Tab");
    // The list nests (two leading spaces after the quote marker); the quote depth is untouched.
    expect(v.state.doc.toString()).toBe("> - A\n>   - B");
  });
});
