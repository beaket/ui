/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Blockquote } from "./blockquote";

test("Blockquote renders its quote", () => {
  assert.match(renderToStaticMarkup(<Blockquote>Keep it simple.</Blockquote>), /Keep it simple/);
});
