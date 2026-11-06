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

test("Field leaves a descendant's render-prop child intact", () => {
  function RenderProp({ children }: { children: (state: { ready: boolean }) => React.ReactNode }) {
    return <div>{children({ ready: true })}</div>;
  }
  const html = renderToStaticMarkup(
    <Field label="Name">
      <RenderProp>{(state) => <input data-ready={String(state.ready)} />}</RenderProp>
    </Field>,
  );
  assert.match(html, /data-ready="true"/);
});
