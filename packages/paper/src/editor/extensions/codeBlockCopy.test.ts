import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import { describe, expect, it } from "vitest";
import { editorExtensions } from "../createEditor";
import { extractFencedCodeText } from "./codeBlockCopy";

// codeBlockCopy: the copy button at the top-right of a code block copies only the code text inside the block
// (excluding the ``` fences and language line). Payload extraction uses the CodeText child node range rather than line
// arithmetic — handling language presence/absence, empty blocks, and unclosed fences without an off-by-one. Here only the pure function is verified (click/clipboard/DOM are verified in the browser).

function firstFenced(doc: string): { state: EditorState; node: SyntaxNode } {
  const state = EditorState.create({ doc, extensions: editorExtensions() });
  let node: SyntaxNode | null = null;
  syntaxTree(state).iterate({
    enter(n) {
      if (n.name === "FencedCode" && !node) node = n.node;
    },
  });
  if (!node) throw new Error("FencedCode node not found");
  return { state, node };
}

describe("extractFencedCodeText", () => {
  it("with a language, extracts only the code excluding the language line and fences", () => {
    const { state, node } = firstFenced("```js\nconst x = 1\n```");
    expect(extractFencedCodeText(state, node)).toBe("const x = 1");
  });

  it("without a language, still extracts excluding only the fences", () => {
    const { state, node } = firstFenced("```\nhello\n```");
    expect(extractFencedCodeText(state, node)).toBe("hello");
  });

  it("extracts multiple lines preserving line breaks", () => {
    const { state, node } = firstFenced("```js\na\nb\nc\n```");
    expect(extractFencedCodeText(state, node)).toBe("a\nb\nc");
  });

  it("an empty code block returns an empty string (the signal not to attach a button)", () => {
    const { state, node } = firstFenced("```\n```");
    expect(extractFencedCodeText(state, node)).toBe("");
  });

  it("extracts CodeText even without a closing fence (mid-edit)", () => {
    const { state, node } = firstFenced("```js\nconst x = 1");
    expect(extractFencedCodeText(state, node)).toContain("const x = 1");
  });

  it("preserves blank lines within the content", () => {
    const { state, node } = firstFenced("```\na\n\nb\n```");
    expect(extractFencedCodeText(state, node)).toBe("a\n\nb");
  });
});
