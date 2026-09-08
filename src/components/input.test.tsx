import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Input } from "./input";

test("Input renders its label", () => {
  assert.match(renderToStaticMarkup(<Input aria-label="Email" />), /aria-label="Email"/);
});
