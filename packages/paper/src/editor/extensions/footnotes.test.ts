import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { computeFootnotes } from "./footnote-render";
import { markdownExtension } from "./markdown";

// Footnote contract tests (ADR-0005). The parser nodes (FootnoteReference / FootnoteDefinition) and the
// pure `computeFootnotes` model are deterministic and coordinate-independent → jsdom contract targets.
// The rendering — superscript widgets, the in-place definition render, the collected block section, the
// reveal-on-cursor and click-to-source behaviors — is geometry/DOM and is carved out for the browser
// (invariant #4), verified in the playground.

const stateOf = (doc: string) => EditorState.create({ doc, extensions: [markdownExtension()] });

const modelOf = (doc: string) => computeFootnotes(stateOf(doc));

describe("footnote parser", () => {
  it("parses `[^1]` as a FootnoteReference and `[^1]: …` as a FootnoteDefinition", () => {
    const names = new Set<string>();
    syntaxTree(stateOf("ref[^1]\n\n[^1]: def")).iterate({
      enter: (n) => {
        names.add(n.name);
      },
    });
    expect(names.has("FootnoteReference")).toBe(true);
    expect(names.has("FootnoteDefinition")).toBe(true);
  });

  it("recognizes a definition that directly follows a paragraph line (no blank line above)", () => {
    // The block parser's `endLeaf` lets a definition interrupt a running paragraph ("write anywhere").
    const m = modelOf("ref[^1]\ntext\n[^1]: def");
    expect(m.numberOf.get("1")).toBe(1);
    expect(m.defs.get("1")?.body).toBe("def");
  });

  it("does not treat `[^x]` inside inline code as a reference", () => {
    // The code span is claimed by the InlineCode parser first, so its `[^x]` stays literal — leaving the
    // real definition unreferenced (and therefore unnumbered).
    const m = modelOf("use `[^x]` literally\n\n[^x]: real");
    expect(m.numberOf.has("x")).toBe(false);
    expect(m.defs.has("x")).toBe(true);
  });
});

describe("computeFootnotes — numbering", () => {
  it("numbers by first-reference order, not definition order", () => {
    const m = modelOf("A[^x] B[^y]\n\n[^y]: why\n[^x]: ex");
    expect(m.order).toEqual(["x", "y"]); // x is referenced first → 1
    expect(m.numberOf.get("x")).toBe(1);
    expect(m.numberOf.get("y")).toBe(2);
  });

  it("numbers a label referenced more than once only once", () => {
    const m = modelOf("A[^x] B[^x] C[^y]\n\n[^x]: ex\n[^y]: why");
    expect(m.order).toEqual(["x", "y"]);
    expect(m.numberOf.get("x")).toBe(1);
    expect(m.numberOf.get("y")).toBe(2);
  });

  it("excludes a reference that has no matching definition (stays literal)", () => {
    const m = modelOf("A[^ghost] B[^real]\n\n[^real]: here");
    expect(m.numberOf.has("ghost")).toBe(false);
    expect(m.numberOf.get("real")).toBe(1);
    expect(m.order).toEqual(["real"]);
  });

  it("excludes an unreferenced definition from the numbering, but still parses it", () => {
    const m = modelOf("A[^x]\n\n[^x]: ex\n[^orphan]: lonely");
    expect(m.order).toEqual(["x"]);
    expect(m.numberOf.has("orphan")).toBe(false);
    expect(m.defs.has("orphan")).toBe(true);
  });

  it("returns an empty model when there are no footnotes", () => {
    const m = modelOf("just a paragraph with no footnotes");
    expect(m.order).toEqual([]);
    expect(m.numberOf.size).toBe(0);
  });
});

describe("computeFootnotes — definitions", () => {
  it("captures the definition body with the single leading space trimmed", () => {
    expect(modelOf("A[^x]\n\n[^x]: the body text").defs.get("x")?.body).toBe("the body text");
  });

  it("lets a later definition for the same label win", () => {
    expect(modelOf("A[^x]\n\n[^x]: first\n[^x]: second").defs.get("x")?.body).toBe("second");
  });

  it("records the definition's source range", () => {
    const doc = "A[^x]\n\n[^x]: body";
    const def = modelOf(doc).defs.get("x");
    expect(def?.from).toBe(doc.indexOf("[^x]:"));
    expect(def?.to).toBe(doc.length);
  });
});
