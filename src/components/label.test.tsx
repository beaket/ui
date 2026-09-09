import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Label } from "./label";

test("Label keeps its control association", () => {
  assert.match(renderToStaticMarkup(<Label htmlFor="email">Email</Label>), /for="email"/);
});
