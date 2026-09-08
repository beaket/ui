import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { NavigationProgress } from "./navigation-progress";

test("NavigationProgress renders while active", () => {
  assert.match(renderToStaticMarkup(<NavigationProgress active />), /role="progressbar"/);
});
