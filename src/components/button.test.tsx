/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./button";

test("Button renders a button", () => {
  assert.match(renderToStaticMarkup(<Button>Save</Button>), /<button/);
});
