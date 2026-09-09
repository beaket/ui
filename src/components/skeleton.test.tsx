/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Skeleton } from "./skeleton";

test("Skeleton exposes loading status", () => {
  assert.match(renderToStaticMarkup(<Skeleton />), /role="status"/);
});
