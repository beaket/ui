/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Textarea } from "./textarea";

test("Textarea renders its label", () => {
  assert.match(renderToStaticMarkup(<Textarea aria-label="Notes" />), /aria-label="Notes"/);
});
