import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../createEditor";

// blockSyntaxHiding: block structural marks branch their exposure on "is the cursor on that line" (Obsidian behavior).
// Headings have per-level asymmetric vertical margin (.cm-heading-line .cm-h{n}) — Zenn style, top>bottom (ADR-0009 revision).
// The margin class is applied regardless of cursor to prevent a vertical jump on entry (same principle as list hanging indent).
// Horizontal rules (`---`/`***`) hide their text on cursorless lines and render as a horizontal rule (.cm-hr-line).

let view: EditorView | null = null;

function makeView(doc: string, anchor = 0): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  view.dispatch({ selection: { anchor: Math.min(anchor, view.state.doc.length) } });
  return view;
}

function lineEl(v: EditorView, text: string): Element | undefined {
  return [...v.contentDOM.querySelectorAll(".cm-line")].find((el) =>
    el.textContent?.includes(text),
  );
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("heading mark hiding", () => {
  it("a heading line without a cursor hides the opening `#`", () => {
    const v = makeView("## 제목\n\n본문", /* anchor */ 100);
    expect(lineEl(v, "제목")?.textContent).toBe("제목");
  });

  it("when the cursor is inside the heading line, exposes `#` for editing", () => {
    const v = makeView("## 제목", 4);
    expect(lineEl(v, "제목")?.textContent).toBe("## 제목");
  });

  it("attaches a per-level margin class to the heading line (Zenn-style asymmetric spacing, ADR-0009 revision)", () => {
    const v = makeView("본문\n\n## 제목", 100);
    const el = lineEl(v, "제목");
    expect(el?.classList.contains("cm-heading-line")).toBe(true);
    expect(el?.classList.contains("cm-h2")).toBe(true);
  });

  it("the margin class is kept even when the cursor is on the heading line (prevents jump on entry)", () => {
    const v = makeView("## 제목", 4);
    expect(lineEl(v, "제목")?.classList.contains("cm-heading-line")).toBe(true);
  });
});

describe("blockquote block (.cm-blockquote-line)", () => {
  // Attaches a line class to `>` lines (including empty `>` continuation lines) to draw the left vertical bar / gutter / color.
  // The gutter (paddingLeft) has the same specificity as baseTheme `.cm-line { padding:0 }`,
  // so the selector must be `.cm-line.cm-blockquote-line` (two classes) to survive (same trap as the heading margin).
  const quote = "본문\n\n> 인용 첫 줄\n>\n> 인용 둘째 줄";

  it("both the `>` line and empty continuation lines get the blockquote line class", () => {
    const v = makeView(quote, 0);
    const lines = [...v.contentDOM.querySelectorAll(".cm-blockquote-line")];
    expect(lines.length).toBe(3);
  });

  it("gets a depth class (cm-bq-d{n}) per nesting depth — visual distinction", () => {
    const v = makeView("본문\n\n> 바깥\n> > 안쪽", 0);
    const outer = lineEl(v, "바깥");
    const inner = lineEl(v, "안쪽");
    expect(outer?.classList.contains("cm-bq-d1")).toBe(true);
    expect(outer?.classList.contains("cm-bq-d2")).toBe(false);
    // The inner line is wrapped by two Blockquotes (outer + inner), so depth 2
    expect(inner?.classList.contains("cm-bq-d2")).toBe(true);
    expect(inner?.classList.contains("cm-blockquote-line")).toBe(true);
  });

  it("beyond depth 4 is clamped at 4 levels", () => {
    const v = makeView("본문\n\n> > > > > 매우 깊음", 0);
    const el = lineEl(v, "매우 깊음");
    expect(el?.classList.contains("cm-bq-d4")).toBe(true);
  });

  // Indentation and bars (paddingLeft / background) are a selector-specificity issue, and jsdom's limited
  // compound-selector resolution makes asserting computed values impossible. The real red→green is verified in the browser.
});

describe("horizontal rule rendering (.cm-hr-line)", () => {
  it("a `---` line without a cursor hides the text and attaches the hr class", () => {
    const v = makeView("위\n\n---\n\n아래", 100);
    const hr = v.contentDOM.querySelector(".cm-hr-line");
    expect(hr).not.toBeNull();
    expect(hr?.textContent).toBe("");
  });

  it("`***` is recognized as the same horizontal rule", () => {
    const v = makeView("위\n\n***\n\n아래", 100);
    expect(v.contentDOM.querySelector(".cm-hr-line")?.textContent).toBe("");
  });

  it("when the cursor is on the horizontal rule line, exposes `---` for editing", () => {
    const doc = "위\n\n---\n\n아래";
    const v = makeView(doc, doc.indexOf("---") + 1);
    expect(v.contentDOM.querySelector(".cm-hr-line")).toBeNull();
    expect(lineEl(v, "---")?.textContent).toBe("---");
  });
});

describe("code-block fence lines (.cm-codeblock-fence)", () => {
  const code = "본문\n\n```ts\nconst x = 1\n```\n\n끝";

  it("when the cursor is outside, the opening/closing fence lines hide their text and become padding strips", () => {
    const v = makeView(code, 0);
    const fences = v.contentDOM.querySelectorAll(".cm-codeblock-fence");
    expect(fences).toHaveLength(2);
    fences.forEach((f) => expect(f.textContent).toBe(""));
    // Only the code body lines remain as surface code lines
    expect(lineEl(v, "const x = 1")?.classList.contains("cm-codeblock-line")).toBe(true);
  });

  it("when the cursor is inside the block, exposes the fences as full-height code lines (no strips)", () => {
    const v = makeView(code, code.indexOf("const x") + 2);
    expect(v.contentDOM.querySelector(".cm-codeblock-fence")).toBeNull();
    expect(lineEl(v, "```ts")?.classList.contains("cm-codeblock-line")).toBe(true);
  });
});
