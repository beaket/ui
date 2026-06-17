import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../createEditor";

// Per-language syntax highlighting in code blocks + separation of inline code chip style.
// - Depending on the fence info string (```js) a nested parser is loaded asynchronously and tokens get highlighted.
// - The inline code chip (background) is applied only via the InlineCode-specific class and doesn't leak into
//   fence code content (CodeText) — a regression where both receive the same monospace tag.

let view: EditorView | null = null;

function makeView(doc: string): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  return view;
}

/** Waits for the nested language parser's async load (dynamic import) → reparse → re-decoration */
async function until(cond: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeout) throw new Error("until(): timeout");
    await new Promise((r) => setTimeout(r, 25));
  }
}

afterEach(() => {
  view?.destroy();
  view = null;
});

const DOC = ["본문과 `인라인 코드` 텍스트", "", "```js", 'const x = "스트링"', "```"].join("\n");

function spanWithText(v: EditorView, text: string): HTMLElement | null {
  const spans = [...v.contentDOM.querySelectorAll("span")] as HTMLElement[];
  return spans.find((s) => s.textContent === text) ?? null;
}

describe("per-language code block highlighting", () => {
  it("keywords and strings in a ```js fence receive different token classes", async () => {
    const v = makeView(DOC);
    // After the language parser loads, 'const' is split out into its own token span
    await until(() => spanWithText(v, "const") !== null);
    const keyword = spanWithText(v, "const")!;
    const string = spanWithText(v, '"스트링"')!;
    expect(keyword.className).not.toBe("");
    expect(string.className).not.toBe("");
    expect(keyword.className).not.toBe(string.className);
  });

  it("a fence without a language shows as-is with no highlighting", async () => {
    const v = makeView("```\nconst plain = 1\n```");
    await new Promise((r) => setTimeout(r, 200));
    // Not split into tokens
    expect(spanWithText(v, "const")).toBeNull();
    expect(v.contentDOM.textContent).toContain("const plain = 1");
  });
});

describe("separation of inline code chip and code block style", () => {
  it("inline code gets the .cm-inline-code chip applied", async () => {
    const v = makeView(DOC);
    await until(() => v.contentDOM.querySelector(".cm-inline-code") !== null);
    const chip = v.contentDOM.querySelector(".cm-inline-code")!;
    // Since the cursor is outside, the backtick marks are hidden and only the content remains inside the chip
    expect(chip.textContent).toBe("인라인 코드");
  });

  it("the inline chip does not leak into fence code content (CodeText)", async () => {
    const v = makeView(DOC);
    await until(() => v.contentDOM.querySelector(".cm-inline-code") !== null);
    const codeLines = [...v.contentDOM.querySelectorAll(".cm-codeblock-line")];
    expect(codeLines.length).toBeGreaterThan(0);
    expect(codeLines.some((line) => line.querySelector(".cm-inline-code"))).toBe(false);
  });
});
