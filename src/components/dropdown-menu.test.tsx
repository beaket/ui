/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropdownMenu } from "./dropdown-menu";

test("DropdownMenu renders its trigger", () => {
  assert.match(
    renderToStaticMarkup(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      </DropdownMenu>,
    ),
    /Actions/,
  );
});
