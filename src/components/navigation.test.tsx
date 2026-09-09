/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation } from "./navigation";

test("Navigation marks its active link", () => {
  const html = renderToStaticMarkup(
    <Navigation value="/settings">
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link value="/settings">Settings</Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>,
  );
  assert.match(html, /aria-current="page"/);
});
