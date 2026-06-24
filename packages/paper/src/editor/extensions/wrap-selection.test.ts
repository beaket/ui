import { EditorSelection, EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { wrapEdit } from "./wrap-selection";

// Wrap-the-selection-on-type (Notion/Obsidian): with text selected, typing a pair opener surrounds
// the selection and keeps the selection on the inner text, instead of replacing it. The decision
// lives in the pure `wrapEdit(state, text)` seam (jsdom can't fire the beforeinput that drives the
// inputHandler), so it is tested directly here.

function stateWith(doc: string, ranges: { anchor: number; head: number }[]): EditorState {
  return EditorState.create({
    doc,
    extensions: editorExtensions(),
    selection: EditorSelection.create(ranges.map((r) => EditorSelection.range(r.anchor, r.head))),
  });
}

/** Apply a wrapEdit spec and return the resulting doc + main selection, for assertion. */
function apply(state: EditorState, text: string) {
  const spec = wrapEdit(state, text);
  if (!spec) return null;
  const next = state.update(spec).state;
  return { doc: next.doc.toString(), main: next.selection.main };
}

describe("wrapEdit — wrap the selection on type", () => {
  it("wraps a mid-string selection with a symmetric marker, selection on inner text", () => {
    // "asd3fas3df", select "3fas3" (indices 3..8), type ` → asd`3fas3`df
    const r = apply(stateWith("asd3fas3df", [{ anchor: 3, head: 8 }]), "`");
    expect(r?.doc).toBe("asd`3fas3`df");
    expect([r?.main.from, r?.main.to]).toEqual([4, 9]); // still covers "3fas3"
  });

  it("wraps with the matching closer for asymmetric brackets", () => {
    expect(apply(stateWith("hello", [{ anchor: 0, head: 5 }]), "[")?.doc).toBe("[hello]");
    expect(apply(stateWith("hello", [{ anchor: 0, head: 5 }]), "(")?.doc).toBe("(hello)");
    expect(apply(stateWith("hello", [{ anchor: 0, head: 5 }]), "{")?.doc).toBe("{hello}");
  });

  it("supports the full default pair set", () => {
    for (const [open, close] of [
      ["(", ")"],
      ["[", "]"],
      ["{", "}"],
      ["`", "`"],
      ['"', '"'],
      ["'", "'"],
      ["*", "*"],
    ]) {
      expect(apply(stateWith("x", [{ anchor: 0, head: 1 }]), open)?.doc).toBe(`${open}x${close}`);
    }
  });

  it("preserves selection direction (head before anchor)", () => {
    const r = apply(stateWith("hello", [{ anchor: 5, head: 0 }]), "*");
    expect(r?.doc).toBe("*hello*");
    expect(r?.main.anchor).toBe(6);
    expect(r?.main.head).toBe(1);
  });

  it("returns null for a collapsed selection (defer to default insertion)", () => {
    expect(wrapEdit(stateWith("hello", [{ anchor: 2, head: 2 }]), "`")).toBeNull();
  });

  it("returns null for a char outside the pair set", () => {
    expect(wrapEdit(stateWith("hello", [{ anchor: 0, head: 5 }]), "x")).toBeNull();
    expect(wrapEdit(stateWith("hello", [{ anchor: 0, head: 5 }]), "~")).toBeNull();
    expect(wrapEdit(stateWith("hello", [{ anchor: 0, head: 5 }]), "_")).toBeNull();
  });

  it("returns null for pasted / multi-char text", () => {
    expect(wrapEdit(stateWith("hello", [{ anchor: 0, head: 5 }]), "((")).toBeNull();
    expect(wrapEdit(stateWith("hello", [{ anchor: 0, head: 5 }]), "world")).toBeNull();
  });
});
