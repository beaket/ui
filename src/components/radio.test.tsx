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
