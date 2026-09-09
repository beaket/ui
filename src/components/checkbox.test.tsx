import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkbox } from "./checkbox";

test("Checkbox renders a checkbox", () => {
  assert.match(renderToStaticMarkup(<Checkbox aria-label="Enable alerts" />), /checkbox/);
});
