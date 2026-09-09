import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Alert } from "./alert";

test("Alert renders its description", () => {
  assert.match(renderToStaticMarkup(<Alert>Saved.</Alert>), /Saved/);
});
