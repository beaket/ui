/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RadioGroup } from "./radio";

test("RadioGroup renders an item", () => {
  assert.match(
    renderToStaticMarkup(
      <RadioGroup>
        <RadioGroup.Item value="one" aria-label="One" />
      </RadioGroup>,
    ),
    /radio/,
  );
});

test("RadioGroup orientation=vertical lays the items out in a column", () => {
  const markup = renderToStaticMarkup(
    <RadioGroup orientation="vertical" aria-label="Options">
      <RadioGroup.Item value="one" aria-label="One" />
    </RadioGroup>,
  );
  assert.match(markup, /data-orientation="vertical"/);
  assert.match(markup, /data-\[orientation=vertical\]:flex-col/);
});
