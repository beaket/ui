import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";

// Regression: pin down that nested lists/tasks/blockquotes render correctly while "outside the cursor".
// (What once looked broken was a measurement artifact — the source was polluted by auto-indentation
//  while typing, or the cursor sat on a structure line and exposed the source — the render logic itself is fine.)

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

/** The visible text of each .cm-line (widgets included, replaced source excluded) */
function renderedLines(v: EditorView): string[] {
  return [...v.contentDOM.querySelectorAll(".cm-line")].map((el) => el.textContent ?? "");
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("nested list / task / blockquote rendering (outside the cursor)", () => {
  it("all three levels of nested bullets render as • (no raw markers, no double bullets)", () => {
    const v = makeView("머리글\n\n- 1단계\n  - 2단계\n    - 3단계", 0);
    expect(renderedLines(v)).toEqual(["머리글", "", "• 1단계", "  • 2단계", "    • 3단계"]);
  });

  it("both checked and unchecked tasks render as checkboxes (no raw - [ ] exposed)", () => {
    const v = makeView("머리글\n\n- [x] 완료\n- [ ] 미완료", 0);
    expect(renderedLines(v)).toEqual(["머리글", "", "완료", "미완료"]);
    const boxes = v.contentDOM.querySelectorAll<HTMLInputElement>("input.cm-task-checkbox");
    expect(boxes.length).toBe(2);
    expect(boxes[0].checked).toBe(true);
    expect(boxes[1].checked).toBe(false);
  });

  it("a blockquote renders with a left border and no bullet, and the > mark is hidden", () => {
    const v = makeView("머리글\n\n> 인용문\n> 둘째줄", 0);
    expect(renderedLines(v)).toEqual(["머리글", "", "인용문", "둘째줄"]);
    expect(v.contentDOM.querySelectorAll(".cm-blockquote-line").length).toBe(2);
  });
});

describe("list hanging indent (second-line alignment on wrap)", () => {
  function listLine(v: EditorView, text: string): Element | undefined {
    return [...v.contentDOM.querySelectorAll(".cm-line")].find((el) =>
      el.textContent?.includes(text),
    );
  }
  const padCh = (style: string | null) =>
    parseInt(style?.match(/padding-left:\s*(\d+)ch/)?.[1] ?? "0", 10);

  it("a list item line gets padding-left + a negative text-indent", () => {
    const v = makeView("- 항목", 100);
    const style = listLine(v, "항목")?.getAttribute("style") ?? null;
    expect(style).toMatch(/padding-left:\s*\d+ch/);
    expect(style).toMatch(/text-indent:\s*-\d+ch/);
  });

  it("a nested item gets a deeper indent proportional to its content start column", () => {
    const v = makeView("- 1단계\n  - 2단계", 100);
    expect(padCh(listLine(v, "2단계")?.getAttribute("style") ?? null)).toBeGreaterThan(
      padCh(listLine(v, "1단계")?.getAttribute("style") ?? null),
    );
  });

  it("a two-digit ordered marker gets a deeper indent than a single-digit one", () => {
    const v = makeView("1. 첫째\n10. 열째", 100);
    expect(padCh(listLine(v, "열째")?.getAttribute("style") ?? null)).toBeGreaterThan(
      padCh(listLine(v, "첫째")?.getAttribute("style") ?? null),
    );
  });
});

describe("Live Preview: when the cursor is on a structure line the source is exposed (expected behavior)", () => {
  it("when the cursor is on a task line the - [ ] source is visible", () => {
    const v = makeView("- [ ] 미완료", 4);
    expect(renderedLines(v)[0]).toContain("[ ]");
  });

  it("when the cursor is on a blockquote line the > source is visible", () => {
    const v = makeView("> 인용문", 3);
    expect(renderedLines(v)[0]).toContain(">");
  });
});
