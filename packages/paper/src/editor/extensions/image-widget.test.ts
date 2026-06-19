import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { parseImage } from "./image-widget";

// A line-only image (`![alt](url)`) is rendered as <img> when the cursor is outside, and exposes
// the source when the cursor touches the line (same Live Preview rule as the horizontal rule).
// Mid-sentence inline images keep their source.

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

// CM6 inserts `<img class="cm-widgetBuffer">` cursor anchors around the replace widget, so
// count only content images.
function imgs(v: EditorView): HTMLImageElement[] {
  return [...v.contentDOM.querySelectorAll<HTMLImageElement>(".cm-image-widget img")];
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("parseImage (pure)", () => {
  it("extracts alt and url", () => {
    expect(parseImage("![풍경](https://x.test/a.png)")).toEqual({
      alt: "풍경",
      url: "https://x.test/a.png",
      title: null,
    });
  });

  it("extracts title", () => {
    expect(parseImage('![a](https://x.test/a.png "캡션")')).toEqual({
      alt: "a",
      url: "https://x.test/a.png",
      title: "캡션",
    });
  });

  it("allows empty alt", () => {
    expect(parseImage("![](https://x.test/a.png)")?.alt).toBe("");
  });

  it("null when not an image", () => {
    expect(parseImage("[링크](https://x.test)")).toBeNull();
    expect(parseImage("그냥 텍스트")).toBeNull();
  });
});

describe("imageWidget render (Live Preview)", () => {
  it("renders a line-only image as <img> when the cursor is outside (no raw ![..] exposed)", () => {
    const v = makeView("머리글\n\n![풍경](https://x.test/a.png)", 0);
    const found = imgs(v);
    expect(found.length).toBe(1);
    expect(found[0].getAttribute("src")).toBe("https://x.test/a.png");
    expect(found[0].alt).toBe("풍경");
    // The source text is not visible in the body
    expect(v.contentDOM.textContent).not.toContain("![풍경]");
  });

  it("exposes the source when the cursor touches the image line (img disappears)", () => {
    const doc = "머리글\n\n![풍경](https://x.test/a.png)";
    const v = makeView(doc, doc.length); // cursor inside the image line
    expect(imgs(v).length).toBe(0);
    expect(v.contentDOM.textContent).toContain("![풍경](https://x.test/a.png)");
  });

  it("does not render a mid-sentence inline image and keeps its source", () => {
    const v = makeView("머리글\n\n앞 ![풍경](https://x.test/a.png) 뒤", 0);
    expect(imgs(v).length).toBe(0);
    expect(v.contentDOM.textContent).toContain("![풍경](https://x.test/a.png)");
  });

  // Regression: a bug where a 1px border (2px left+right) added outside maxWidth:100% caused
  // horizontal scroll on images whose natural width >= container. border-box includes the border
  // within 100%. (The actual 2px overflow is layout, so jsdom cannot reproduce the numbers — it was
  // confirmed by browser measurement, and here we pin the box-sizing contract, which is the mechanism.)
  it("rendered image is box-sizing: border-box (border does not overflow past 100%)", () => {
    const v = makeView("머리글\n\n![풍경](https://x.test/a.png)", 0);
    const [img] = imgs(v);
    expect(img).toBeTruthy();
    expect(getComputedStyle(img).boxSizing).toBe("border-box");
  });
});
