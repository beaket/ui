import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { editorExtensions } from "../create-editor";
import {
  type CodeBlockRenderer,
  type CodeBlockRenderers,
  computeCodeBlocks,
} from "./code-block-render";
import { markdownExtension } from "./markdown";

// Consumer-delegated code-block rendering contract (ADR-0023). `computeCodeBlocks` is pure and
// cursor-independent → the jsdom contract seam (ADR-0005): which fences become widget candidates, that
// unregistered languages fall through, and that the lang/code/range are extracted from the syntax tree.
// The cursor filter, the rendered DOM, the cache, error display, and the scheme handoff are exercised
// through a mounted view with a FAKE sync renderer (no real mermaid needed). Real SVG geometry/coords are
// carved out for the browser (invariant #4) — verified in sites/paper.

const stateOf = (doc: string) => EditorState.create({ doc, extensions: [markdownExtension()] });

const blocksOf = (doc: string, langs: string[] = ["mermaid"]) =>
  computeCodeBlocks(stateOf(doc), new Set(langs));

describe("computeCodeBlocks — candidate fences (pure seam)", () => {
  it("returns a registered fence with its language, body, and block range", () => {
    const doc = "before\n\n```mermaid\ngraph TD\nA-->B\n```\n\nafter";
    const blocks = blocksOf(doc);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].lang).toBe("mermaid");
    expect(blocks[0].code).toBe("graph TD\nA-->B");
    // Range spans the opening-fence line start … closing-fence line end (whole lines, for block-replace).
    expect(doc.slice(blocks[0].from, blocks[0].to)).toBe("```mermaid\ngraph TD\nA-->B\n```");
  });

  it("ignores a fence whose language has no registered renderer (stays a normal code block)", () => {
    expect(blocksOf("```js\nconst a = 1;\n```")).toEqual([]);
  });

  it("ignores a bare fence with no info string", () => {
    expect(blocksOf("```\nplain\n```")).toEqual([]);
  });

  it("returns nothing when the registry is empty", () => {
    expect(blocksOf("```mermaid\nx\n```", [])).toEqual([]);
  });

  it("finds multiple registered fences across the document", () => {
    const doc = "```mermaid\na\n```\n\ntext\n\n```mermaid\nb\n```";
    expect(blocksOf(doc).map((b) => b.code)).toEqual(["a", "b"]);
  });

  it("handles an empty-body fence (code is the empty string)", () => {
    const blocks = blocksOf("```mermaid\n```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe("");
  });

  it("matches only the exact info-string language (a trailing word is not `mermaid`)", () => {
    // The info string is the whole token after the fence; v1 keys on the trimmed string exactly.
    expect(blocksOf("```mermaidish\nx\n```")).toEqual([]);
  });

  it("supports a fence nested in a blockquote — body is the clean code (quote marks stripped)", () => {
    // The block-replace range covers the whole line (including the `> ` prefix), but the lezer CodeText
    // is already prefix-free, so the renderer gets clean source. v1 trade-off: the diagram renders but is
    // not visually wrapped in the quote chrome; the source round-trips untouched on edit.
    const blocks = blocksOf("> ```mermaid\n> graph TD\n> ```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe("graph TD");
  });

  it("supports a fence nested in a list item — body is the clean code (indent stripped)", () => {
    const blocks = blocksOf("- item\n\n  ```mermaid\n  graph TD\n  ```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe("graph TD");
  });
});

// ── Mounted-view integration (fake renderer) ──────────────────────────────────────────────────────
// This is also the overlap probe: if a block-replace widget collided with block-syntax-hiding's
// fence-line hides, mounting the full editorExtensions set would throw here.

let view: EditorView | null = null;

const fakeRenderer: CodeBlockRenderer = (code, el) => {
  const out = document.createElement("div");
  out.className = "fake-diagram";
  out.textContent = `DIAGRAM:${code}`;
  el.replaceChildren(out);
};

function makeView(
  doc: string,
  renderers: CodeBlockRenderers = { mermaid: fakeRenderer },
  anchor = 0,
): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: editorExtensions({ codeBlockRenderers: renderers }),
    }),
    parent,
  });
  view.dispatch({ selection: { anchor: Math.min(anchor, view.state.doc.length) } });
  return view;
}

afterEach(() => {
  view?.destroy();
  view = null;
});

describe("code-block-render — mounted view", () => {
  it("renders a registered fence off-cursor as a widget (and mounting does not throw on overlap)", () => {
    const v = makeView("intro\n\n```mermaid\ngraph TD\n```\n\nend", { mermaid: fakeRenderer }, 0);
    const diagram = v.contentDOM.querySelector(".cm-code-render .fake-diagram");
    expect(diagram).not.toBeNull();
    expect(diagram?.textContent).toContain("graph TD");
  });

  it("shows raw source (no widget) when the cursor is inside the block", () => {
    const doc = "intro\n\n```mermaid\ngraph TD\n```\n\nend";
    const v = makeView(doc, { mermaid: fakeRenderer }, doc.indexOf("graph TD") + 2);
    expect(v.contentDOM.querySelector(".cm-code-render")).toBeNull();
    expect(v.contentDOM.textContent).toContain("```mermaid");
  });

  it("leaves an unregistered language as a normal code block (no widget)", () => {
    const v = makeView("```js\nconst a = 1;\n```", { mermaid: fakeRenderer }, 0);
    expect(v.contentDOM.querySelector(".cm-code-render")).toBeNull();
  });

  it("renders error text when the renderer throws", () => {
    const v = makeView("x\n\n```mermaid\nbad\n```", {
      mermaid: () => {
        throw new Error("Parse error on line 1");
      },
    });
    const err = v.contentDOM.querySelector(".cm-code-render-error");
    expect(err?.textContent).toBe("Parse error on line 1");
  });

  it("renders error text when an async renderer rejects (the real mermaid error path)", async () => {
    const v = makeView("x\n\n```mermaid\nbad\n```", {
      mermaid: () => Promise.reject(new Error("Parse error on line 1")),
    });
    await Promise.resolve(); // flush the rejection microtask
    const err = v.contentDOM.querySelector(".cm-code-render-error");
    expect(err?.textContent).toBe("Parse error on line 1");
  });

  it("passes the resolved color scheme to the renderer context", () => {
    const seen: string[] = [];
    const recorder: CodeBlockRenderer = (_code, el, ctx) => {
      seen.push(ctx.colorScheme);
      el.replaceChildren();
    };
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({
        doc: "x\n\n```mermaid\nx\n```",
        extensions: editorExtensions({
          codeBlockRenderers: { mermaid: recorder },
          colorScheme: "dark",
        }),
      }),
      parent,
    });
    expect(seen).toContain("dark");
  });

  it("does not call the renderer again for the same (code, scheme) after a re-render (cache hit)", () => {
    const spy = vi.fn<CodeBlockRenderer>((_code, el) => {
      el.replaceChildren(document.createTextNode("ok"));
    });
    const doc = "a\n\n```mermaid\nx\n```\n\nb";
    const v = makeView(doc, { mermaid: spy }, 0);
    const calls = spy.mock.calls.length;
    expect(calls).toBeGreaterThanOrEqual(1);
    // Edit a DISTANT line: the model recomputes but the mermaid block's (code,scheme) is unchanged →
    // eq() keeps its DOM, the renderer is not re-invoked.
    v.dispatch({ changes: { from: 0, insert: "X" } });
    expect(spy.mock.calls.length).toBe(calls);
  });
});
