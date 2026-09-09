import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Avatar } from "./avatar";

test("Avatar renders its fallback", () => {
  assert.match(
    renderToStaticMarkup(
      <Avatar>
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar>,
    ),
    /AB/,
  );
});
