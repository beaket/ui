import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../createEditor";
import { altFromFilename, handleImageFiles, insertImageBlock } from "./imageDrop";

// Ingest contract: resolver→insert→render. Verified via the pure entry point handleImageFiles
// without synthesizing DataTransfer/drop events (ADR-0005 deterministic contract). Event firing
// is confirmed in the browser.

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

function pngFile(name: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/png" });
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("altFromFilename", () => {
  it("strips the extension and uses it as alt", () => {
    expect(altFromFilename("photo.png")).toBe("photo");
    expect(altFromFilename("a.b.jpeg")).toBe("a.b");
    expect(altFromFilename("확장자없음")).toBe("확장자없음");
  });
});

describe("insertImageBlock (block isolation)", () => {
  it("on an empty line, inserts image + trailing newline only, cursor on the line below", () => {
    const v = makeView("", 0);
    const after = insertImageBlock(v, 0, "photo", "X");
    expect(v.state.doc.toString()).toBe("![photo](X)\n");
    expect(v.state.selection.main.head).toBe(after);
    // The cursor is on the next (empty) line, not the image line
    expect(v.state.doc.lineAt(v.state.selection.main.head).text).toBe("");
  });

  it("when mid-line, splits upward to make the image its own line", () => {
    const v = makeView("앞글", 1); // after "앞" (mid-line)
    insertImageBlock(v, 1, "p", "X");
    expect(v.state.doc.toString()).toBe("앞\n![p](X)\n글");
  });
});

describe("handleImageFiles (resolver→insert→render contract)", () => {
  it("inserts ![alt](url) using the custom resolver URL and Phase A renders it", async () => {
    const v = makeView("머리글\n\n", 8); // trailing empty line
    await handleImageFiles(v, [pngFile("photo.png")], 8, () => "https://cdn.test/x.png");
    expect(v.state.doc.toString()).toContain("![photo](https://cdn.test/x.png)");
    // No cursor on the image line, so it renders as a widget
    const img = v.contentDOM.querySelector<HTMLImageElement>(".cm-image-widget img");
    expect(img?.getAttribute("src")).toBe("https://cdn.test/x.png");
  });

  it("awaits an async resolver (simulating upload)", async () => {
    const v = makeView("", 0);
    await handleImageFiles(v, [pngFile("a.png")], 0, (f) =>
      Promise.resolve(`https://up.test/${f.name}`),
    );
    expect(v.state.doc.toString()).toContain("![a](https://up.test/a.png)");
  });

  it("inserts multiple files in order", async () => {
    const v = makeView("", 0);
    await handleImageFiles(v, [pngFile("one.png"), pngFile("two.png")], 0, (f) => `u/${f.name}`);
    const doc = v.state.doc.toString();
    expect(doc.indexOf("![one](u/one.png)")).toBeGreaterThanOrEqual(0);
    expect(doc.indexOf("![two](u/two.png)")).toBeGreaterThan(doc.indexOf("![one](u/one.png)"));
  });

  it("skips the file when the resolver throws or returns an empty string", async () => {
    const v = makeView("", 0);
    await handleImageFiles(v, [pngFile("bad.png")], 0, () => {
      throw new Error("upload failed");
    });
    await handleImageFiles(v, [pngFile("empty.png")], 0, () => "");
    expect(v.state.doc.toString()).toBe("");
  });
});
