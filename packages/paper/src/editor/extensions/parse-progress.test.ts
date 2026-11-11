import { forceParsing, syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { type DecorationSet, EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
import { footnoteModelField } from "./footnote-render";

// Regression for #1240: CM6 parses only the first ~3 KB synchronously and finishes the rest in idle
// slices, delivered as a transaction with no doc/selection/viewport change. Fields keyed on
// `docChanged` never saw the late nodes, so tables, footnotes and renderer fences past the first
// slice stayed raw until the next edit.

const FILLER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n".repeat(4000);
const TAIL =
  "| a | b |\n| --- | --- |\n| 1 | 2 |\n\nref[^1]\n\n[^1]: note\n\n```mermaid\ngraph TD\n```\n";
const DOC = FILLER + TAIL;

const views: EditorView[] = [];
afterEach(() => {
  for (const v of views.splice(0)) v.destroy();
});

function mount(): EditorView {
  const parent = document.createElement("div");
  document.body.appendChild(parent);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: DOC,
      extensions: editorExtensions({
        codeBlockRenderers: {
          mermaid: (_code, el) => {
            el.textContent = "rendered";
          },
        },
      }),
    }),
  });
  views.push(view);
  return view;
}

/** Number of block-replace decorations (table widgets, renderer fences) past the filler. */
function blockWidgetsInTail(view: EditorView): number {
  let count = 0;
  for (const source of view.state.facet(EditorView.decorations)) {
    if (typeof source === "function") continue;
    (source as DecorationSet).between(FILLER.length, view.state.doc.length, (_f, _t, value) => {
      if ((value.spec as { block?: boolean }).block) count++;
    });
  }
  return count;
}

describe("decorations refresh when the parser catches up (#1240)", () => {
  it("renders the table, footnote and renderer fence at the end of a large document", () => {
    const view = mount();
    // The initial parse stops well before the table at the end.
    expect(syntaxTree(view.state).length).toBeLessThan(FILLER.length);
    expect(view.state.field(footnoteModelField).order).toEqual([]);
    expect(blockWidgetsInTail(view)).toBe(0);

    forceParsing(view, view.state.doc.length, 20_000);
    expect(syntaxTree(view.state).length).toBe(view.state.doc.length);

    expect(view.state.field(footnoteModelField).order).toEqual(["1"]);
    expect(blockWidgetsInTail(view)).toBeGreaterThanOrEqual(2); // table + mermaid fence
  });
});
