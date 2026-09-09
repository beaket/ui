import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Select } from "./select";

test("Select renders its trigger", () => {
  const html = renderToStaticMarkup(
    <Select>
      <Select.Trigger>
        <Select.Value placeholder="Choose" />
      </Select.Trigger>
    </Select>,
  );
  assert.match(html, /Choose/);
});
