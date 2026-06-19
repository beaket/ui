import { describe, expect, it } from "vitest";
import { parseAligns, parseRowCells, serializeDelimiter, serializeRow } from "./table-widget";

describe("parseRowCells", () => {
  it("splits a basic row into cell ranges", () => {
    const cells = parseRowCells("| a | bc |", 100);
    expect(cells.map((c) => c.text)).toEqual(["a", "bc"]);
    expect(cells[0]).toMatchObject({ from: 102, to: 103 });
    expect(cells[1]).toMatchObject({ from: 106, to: 108 });
  });

  it("an empty cell also has an editable range", () => {
    const cells = parseRowCells("|  |  |", 0);
    expect(cells).toHaveLength(2);
    expect(cells[0].editable).toBe(true);
    expect(cells[0].from).toBe(cells[0].to);
  });

  it("an escaped pipe (\\|) is not a cell boundary", () => {
    const cells = parseRowCells("| a \\| b | c |", 0);
    expect(cells.map((c) => c.text)).toEqual(["a \\| b", "c"]);
  });

  it("excludes only one padding space at each edge — preserves a trailing space being typed", () => {
    const cells = parseRowCells("| ab  | c |", 0);
    expect(cells[0].text).toBe("ab "); // one padding space excluded, the rest is cell content
  });

  it("handles a row with the edge pipes omitted", () => {
    const cells = parseRowCells("a | b", 0);
    expect(cells.map((c) => c.text)).toEqual(["a", "b"]);
  });
});

describe("alignment round-trip", () => {
  it("parseAligns interprets the colon notation", () => {
    expect(parseAligns("| :--- | :-: | ---: | --- |")).toEqual(["left", "center", "right", null]);
  });

  it("serializeDelimiter → parseAligns round-trip", () => {
    const aligns = ["left", "center", "right", null] as const;
    expect(parseAligns(serializeDelimiter([...aligns]))).toEqual([...aligns]);
  });
});

describe("serializeRow", () => {
  it("serializes a cell array into a GFM row", () => {
    expect(serializeRow(["a", "b"])).toBe("| a | b |");
    expect(serializeRow(["", "b"])).toBe("|  | b |");
  });

  it("serializeRow → parseRowCells round-trip", () => {
    const texts = ["이름", "나이", "도시"];
    const cells = parseRowCells(serializeRow(texts), 0);
    expect(cells.map((c) => c.text)).toEqual(texts);
  });
});
