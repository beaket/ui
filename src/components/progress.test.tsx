import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Progress } from "./progress";

test("Progress exposes its value", () => {
  assert.match(renderToStaticMarkup(<Progress value={50} />), /aria-valuenow="50"/);
});
