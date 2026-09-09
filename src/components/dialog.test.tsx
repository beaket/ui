import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dialog } from "./dialog";

test("Dialog renders its trigger", () => {
  assert.match(
    renderToStaticMarkup(
      <Dialog>
        <Dialog.Trigger>
          <button>Open</button>
        </Dialog.Trigger>
      </Dialog>,
    ),
    /Open/,
  );
});
