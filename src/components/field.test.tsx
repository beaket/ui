/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Field } from "./field";

test("Field connects the label to its control", () => {
  const html = renderToStaticMarkup(
    <Field>
      <Field.Label>Email</Field.Label>
      <Field.Control>
        <input />
      </Field.Control>
    </Field>,
  );
  assert.match(html, /aria-labelledby=/);
});
