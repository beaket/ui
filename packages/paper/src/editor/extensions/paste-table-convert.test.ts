import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";
import { editorExtensions } from "../create-editor";
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

  it("escapes backslashes before pipes so cell escaping cannot be defeated", () => {
    // `\|` must become `\\\|` (escaped backslash + escaped pipe), never `\\|`
    // (literal backslash + live delimiter), which would inject an extra column.
    expect(tsvToRows("a\\|b\tc")).toEqual([["a\\\\\\|b", "c"]]);
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

describe("paste handler syntax context", () => {
  let view: EditorView | null = null;
  afterEach(() => {
    view?.destroy();
    view = null;
    document.body.innerHTML = "";
  });

  function paste(doc: string, cursor: number, text: string): string {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    view = new EditorView({
      state: EditorState.create({
        doc,
        selection: { anchor: cursor },
        extensions: editorExtensions({}),
      }),
      parent,
    });
    ensureSyntaxTree(view.state, view.state.doc.length, 5000);
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: (type: string) => (type === "text/plain" ? text : "") },
    });
    view.contentDOM.dispatchEvent(event);
    return view.state.doc.toString();
  }

  const tsv = "a\tb\nc\td";

  it("leaves tab-containing text verbatim inside a fenced code block", () => {
    expect(paste("```go\n\n```", 6, tsv)).toBe("```go\na\tb\nc\td\n```");
  });

  it("leaves tab-containing text verbatim inside inline code", () => {
    expect(paste("see `x` here", 6, tsv)).toBe("see `xa\tb\nc\td` here");
  });

  it("still converts tab-separated text in a paragraph into a table", () => {
    expect(paste("", 0, tsv)).toBe("| a | b |\n| --- | --- |\n| c | d |");
  });
});
