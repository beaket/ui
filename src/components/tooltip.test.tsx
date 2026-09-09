/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Tooltip, TooltipProvider } from "./tooltip";

test("Tooltip renders its trigger", () => {
  assert.match(
    renderToStaticMarkup(
      <TooltipProvider>
        <Tooltip>
          <Tooltip.Trigger>Info</Tooltip.Trigger>
        </Tooltip>
      </TooltipProvider>,
    ),
    /Info/,
  );
});
