/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Sheet } from "./sheet";

test("Sheet renders its trigger", () => {
  assert.match(
    renderToStaticMarkup(
      <Sheet>
        <Sheet.Trigger>
          <button>Open</button>
        </Sheet.Trigger>
      </Sheet>,
    ),
    /Open/,
  );
});
