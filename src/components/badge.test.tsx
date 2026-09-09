/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge } from "./badge";

test("Badge renders its label", () => {
  assert.match(renderToStaticMarkup(<Badge>New</Badge>), /New/);
});
