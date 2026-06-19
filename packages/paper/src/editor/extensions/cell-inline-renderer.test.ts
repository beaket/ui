import { describe, expect, it } from "vitest";
import { renderCellInline } from "./cell-inline-renderer";

function render(text: string): string {
  const el = document.createElement("td");
  renderCellInline(el, text);
  return el.innerHTML;
}

describe("renderCellInline", () => {
  it("renders inline formatting without marks", () => {
    expect(render("**굵게**")).toBe("<strong>굵게</strong>");
    expect(render("*기울임*")).toBe("<em>기울임</em>");
    expect(render("~~취소~~")).toBe("<s>취소</s>");
    expect(render("`코드`")).toBe("<code>코드</code>");
  });

  it("expands an escaped pipe literally (ADR-0002: hide structure syntax)", () => {
    expect(render("a \\| b")).toBe("a | b");
  });

  it("renders <br> as an actual line break (Shift+Enter)", () => {
    expect(render("첫줄<br>둘째줄")).toBe("첫줄<br>둘째줄");
    expect(render("첫줄<br/>둘째줄")).toContain("<br>");
  });

  it("keeps only the text for links", () => {
    expect(render("[네이버](https://naver.com)")).toBe('<span class="cm-table-link">네이버</span>');
  });

  it("handles nested formatting", () => {
    expect(render("**굵게 *기울임***")).toBe("<strong>굵게 <em>기울임</em></strong>");
  });

  it("empty text yields an empty cell", () => {
    expect(render("")).toBe("");
  });
});
