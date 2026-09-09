/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Tabs } from "./tabs";

test("Tabs renders the selected panel", () => {
  const html = renderToStaticMarkup(
    <Tabs defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one">One</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="one">Panel</Tabs.Content>
    </Tabs>,
  );
  assert.match(html, /Panel/);
});
