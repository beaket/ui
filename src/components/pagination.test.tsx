/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Pagination } from "./pagination";

test("Pagination renders the current page", () => {
  assert.match(
    renderToStaticMarkup(
      <Pagination page={2} totalPages={3} buildPageUrl={(page) => `?page=${page}`} />,
    ),
    />2</,
  );
});

// DESIGN.md § The Dashed-Disabled Rule: disabled is dashed border, border-muted
// stroke, bg-disabled fill, fg-disabled text — in link and button mode alike.
const disabledMarks = [
  "border-dashed",
  "border-border-muted",
  "bg-bg-disabled",
  "text-fg-disabled",
];

function disabledStepClasses(markup: string, label: string) {
  const tag = markup.match(new RegExp(`<[a-z]+[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? "";
  return tag.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? [];
}

test("a disabled Previous carries all four disabled marks in link mode", () => {
  const markup = renderToStaticMarkup(
    <Pagination page={1} totalPages={3} buildPageUrl={(page) => `?page=${page}`} />,
  );
  const classes = disabledStepClasses(markup, "Previous page");
  for (const mark of disabledMarks) assert.ok(classes.includes(mark), `missing ${mark}`);
});

test("a disabled Next carries all four disabled marks in button mode", () => {
  const markup = renderToStaticMarkup(
    <Pagination mode="button" page={3} totalPages={3} onPageChange={() => {}} />,
  );
  const classes = disabledStepClasses(markup, "Next page");
  for (const mark of disabledMarks) assert.ok(classes.includes(mark), `missing ${mark}`);
});
