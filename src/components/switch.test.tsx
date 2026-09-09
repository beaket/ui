import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Switch } from "./switch";

test("Switch renders a checkbox", () => {
  assert.match(renderToStaticMarkup(<Switch aria-label="Dark mode" />), /checkbox/);
});
