import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Card } from "./card";

test("Card renders its content", () => {
  assert.match(
    renderToStaticMarkup(
      <Card>
        <Card.Content>Content</Card.Content>
      </Card>,
    ),
    /Content/,
  );
});
