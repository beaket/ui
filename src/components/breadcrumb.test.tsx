import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Breadcrumb } from "./breadcrumb";

test("Breadcrumb renders the current page", () => {
  const html = renderToStaticMarkup(
    <Breadcrumb>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Settings</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>,
  );
  assert.match(html, /aria-current="page"/);
});
