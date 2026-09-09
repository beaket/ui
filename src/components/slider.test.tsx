/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Slider } from "./slider";

test("Slider renders an accessible thumb", () => {
  assert.match(renderToStaticMarkup(<Slider defaultValue={[25]} />), /aria-label="Value"/);
});
