import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { markdownExtension } from "./markdown";
import { buildTableDecorations } from "./table-widget";

// Regression for #488: buildTableDecorations was descending into inline nodes of every
// Paragraph/Heading/etc. on every docChanged, costing O(doc-size) per keystroke.
// The fix prunes to block-container nodes only; this suite pins that nested tables
// (blockquote, list item) still produce identical decoration ranges after the prune.

const stateOf = (doc: string) => EditorState.create({ doc, extensions: [markdownExtension()] });

/** Collect the [from, to] pairs from the decoration set. */
function decoRangesOf(doc: string): { from: number; to: number }[] {
  const state = stateOf(doc);
  const set = buildTableDecorations(state);
  const ranges: { from: number; to: number }[] = [];
  set.between(0, state.doc.length, (from, to) => {
    ranges.push({ from, to });
  });
  return ranges;
}

const SIMPLE_TABLE = "| a | b |\n| --- | --- |\n| 1 | 2 |";

describe("buildTableDecorations — container pruning regression (issue #488)", () => {
  it("produces one decoration for a top-level table", () => {
    expect(decoRangesOf(SIMPLE_TABLE)).toHaveLength(1);
  });

  it("produces one decoration for a table inside a blockquote", () => {
    const doc = "> | a | b |\n> | --- | --- |\n> | 1 | 2 |";
    expect(decoRangesOf(doc)).toHaveLength(1);
  });

  it("produces one decoration for a table inside a loose list item", () => {
    // A loose list item (blank line inside) can contain block-level content.
    const doc = "- item\n\n  | a | b |\n  | --- | --- |\n  | 1 | 2 |";
    expect(decoRangesOf(doc)).toHaveLength(1);
  });

  it("produces one decoration for a table inside a nested blockquote", () => {
    const doc = "> > | a | b |\n> > | --- | --- |\n> > | 1 | 2 |";
    expect(decoRangesOf(doc)).toHaveLength(1);
  });

  it("counts decorations across all nesting contexts in the same document", () => {
    const doc = [
      SIMPLE_TABLE,
      "",
      "paragraph without a table",
      "",
      "> | x | y |",
      "> | --- | --- |",
      "> | 3 | 4 |",
    ].join("\n");
    expect(decoRangesOf(doc)).toHaveLength(2);
  });

  it("does not produce a decoration for prose without a table", () => {
    const doc = "# Heading\n\nJust a paragraph.\n\n> A blockquote without a table.";
    expect(decoRangesOf(doc)).toHaveLength(0);
  });
});
