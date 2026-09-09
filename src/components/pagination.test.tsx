import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
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
