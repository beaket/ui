import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editorExtensions } from "../createEditor";
import { copyDocumentAsMarkdown } from "./markdownCopy";

// ADR-0007 contract: markdown copy puts the entire document onto the clipboard as unprocessed RAW
// markdown regardless of the selection — even when table structure syntax (|) is hidden on screen, it stays in the payload.

const DOC = [
  "# 제목",
  "",
  "**굵게** 본문.",
  "",
  "| 이름 | 나이 |",
  "| --- | --- |",
  "| 철수 | 20 |",
  "",
].join("\n");

let view: EditorView | null = null;
let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});

afterEach(() => {
  view?.destroy();
  view = null;
});

function makeView(doc: string): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({ doc, extensions: editorExtensions() }),
    parent,
  });
  return view;
}

describe("markdownCopy", () => {
  it("the corner icon (affordance) is always present in the editor", () => {
    const v = makeView(DOC);
    expect(v.dom.querySelector(".cm-md-copy")).not.toBeNull();
  });

  it("copies the entire document as RAW markdown including the table | (independent of the selection)", () => {
    const v = makeView(DOC);
    // Verify that "the entire document" is copied even with only part of it selected
    v.dispatch({ selection: { anchor: 0, head: 3 } });
    copyDocumentAsMarkdown(v, () => {});
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(DOC);
    // Table structure syntax hidden on screen must stay alive in the payload
    expect(writeText.mock.calls[0][0]).toContain("| 이름 | 나이 |");
    expect(writeText.mock.calls[0][0]).toContain("| --- | --- |");
  });

  it("clicking the icon fires a copy", () => {
    const v = makeView(DOC);
    const button = v.dom.querySelector(".cm-md-copy") as HTMLButtonElement;
    button.click();
    expect(writeText).toHaveBeenCalledWith(DOC);
  });

  it("on a successful copy the toast is briefly shown", async () => {
    const v = makeView(DOC);
    const button = v.dom.querySelector(".cm-md-copy") as HTMLButtonElement;
    button.click();
    // writeText is a resolved Promise → the toast class attaches after the microtask
    await Promise.resolve();
    await Promise.resolve();
    expect(v.dom.querySelector(".cm-md-copy-toast-show")).not.toBeNull();
  });
});

describe("markdownCopy — a11y lossless source mirror", () => {
  it("a source region with an accessibility label exists", () => {
    const v = makeView(DOC);
    const source = v.dom.querySelector(".cm-md-source");
    expect(source).not.toBeNull();
    expect(source?.getAttribute("role")).toBe("region");
    expect(source?.getAttribute("aria-label")).toBe("Document Markdown source (for AI)");
  });

  it("the mirror holds the full RAW markdown including the table | hidden on screen", () => {
    const v = makeView(DOC);
    const source = v.dom.querySelector(".cm-md-source") as HTMLDivElement;
    expect(source.textContent).toBe(DOC);
    expect(source.textContent).toContain("| 이름 | 나이 |");
    expect(source.textContent).toContain("| --- | --- |");
  });

  it("the mirror updates when the document changes", () => {
    const v = makeView(DOC);
    const source = v.dom.querySelector(".cm-md-source") as HTMLDivElement;
    v.dispatch({ changes: { from: v.state.doc.length, insert: "\n새 줄 **굵게**." } });
    expect(source.textContent).toBe(v.state.doc.toString());
    expect(source.textContent).toContain("새 줄 **굵게**.");
  });
});
