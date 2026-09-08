import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Separator } from "./separator";

test("Separator renders a separator role", () => {
  assert.match(renderToStaticMarkup(<Separator />), /separator/);
});
