import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { cellNewlineToBr, findBrRanges } from "./tableWidget";

function applyInsert(doc: string, from: number, to: number, insert: string) {
  const state = EditorState.create({ doc, extensions: [cellNewlineToBr] });
  // The filter decides the selection — if the test computes it from raw length, it diverges from CM's \r\n normalization.
  return state.update({ changes: { from, to, insert } });
}

// Line breaks within a cell: range detection for rendering source <br> as a real line break during editing (pure logic).

describe("findBrRanges", () => {
  it("text without <br> yields an empty array", () => {
    expect(findBrRanges("그냥 텍스트")).toEqual([]);
  });

  it("finds the source range of a single <br>", () => {
    expect(findBrRanges("첫째줄<br>둘째줄")).toEqual([{ from: 3, to: 7 }]);
  });

  it("finds all of multiple <br>", () => {
    // "a<br>b<br>c": <br> at 1-5, 6-10
    expect(findBrRanges("a<br>b<br>c")).toEqual([
      { from: 1, to: 5 },
      { from: 6, to: 10 },
    ]);
  });

  it("recognizes the <br/> and <br /> variants and case-insensitively", () => {
    expect(findBrRanges("a<br/>b")).toEqual([{ from: 1, to: 6 }]);
    expect(findBrRanges("a<br />b")).toEqual([{ from: 1, to: 7 }]);
    expect(findBrRanges("a<BR>b")).toEqual([{ from: 1, to: 5 }]);
  });

  it("locates accurately by code point index even with CJK mixed in", () => {
    // "사과<br>배": <br> at index 2-6
    expect(findBrRanges("사과<br>배")).toEqual([{ from: 2, to: 6 }]);
  });
});

describe("cellNewlineToBr", () => {
  it("converts newlines from a multi-line paste into <br>", () => {
    const tr = applyInsert("", 0, 0, "사과\n바나나\n포도");
    expect(tr.state.doc.toString()).toBe("사과<br>바나나<br>포도");
    expect(tr.state.doc.lines).toBe(1); // no real newline remains — the table row isn't split
  });

  it("converts CRLF/CR into <br> too", () => {
    expect(applyInsert("", 0, 0, "a\r\nb").state.doc.toString()).toBe("a<br>b");
    expect(applyInsert("", 0, 0, "a\rb").state.doc.toString()).toBe("a<br>b");
  });

  it("passes the transaction through unchanged when there is no newline", () => {
    const tr = applyInsert("기존", 2, 2, "추가"); // '기존' is 2 characters
    expect(tr.state.doc.toString()).toBe("기존추가");
  });

  it("the cursor moves to the end of the insertion after conversion", () => {
    const tr = applyInsert("", 0, 0, "a\nb"); // "a<br>b" = 6 characters
    expect(tr.state.selection.main.head).toBe(6);
  });

  it("also converts when replacing a selection with multiple lines", () => {
    // In "XYZ", replace [1,2)='Y' with "p\nq" → "Xp<br>qZ"
    const tr = applyInsert("XYZ", 1, 2, "p\nq");
    expect(tr.state.doc.toString()).toBe("Xp<br>qZ");
  });
});
