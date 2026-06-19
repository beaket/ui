import { describe, expect, it } from "vitest";
import { htmlTableToRows, toMarkdownTable, tsvToRows } from "./paste-table-convert";

describe("tsvToRows", () => {
  it("converts tab-separated text into a matrix", () => {
    expect(tsvToRows("a\tb\nc\td")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("does not convert when there is no tab", () => {
    expect(tsvToRows("그냥 텍스트")).toBeNull();
  });

  it("escapes pipes inside a cell", () => {
    expect(tsvToRows("a|b\tc")).toEqual([["a\\|b", "c"]]);
  });
});

describe("htmlTableToRows", () => {
  it("converts an HTML table into a matrix (spreadsheet copy)", () => {
    const rows = htmlTableToRows(
      "<table><tr><th>X</th><th>Y</th></tr><tr><td>1</td><td>2|3</td></tr></table>",
    );
    expect(rows).toEqual([
      ["X", "Y"],
      ["1", "2\\|3"],
    ]);
  });

  it("null when there is no table", () => {
    expect(htmlTableToRows("<p>본문</p>")).toBeNull();
  });
});

describe("toMarkdownTable", () => {
  it("serializes a matrix into a GFM table", () => {
    expect(
      toMarkdownTable([
        ["a", "b"],
        ["c", "d"],
      ]),
    ).toBe("| a | b |\n| --- | --- |\n| c | d |");
  });

  it("pads rows with a different column count using empty cells", () => {
    expect(toMarkdownTable([["a", "b"], ["c"]])).toBe("| a | b |\n| --- | --- |\n| c |   |");
  });
});
