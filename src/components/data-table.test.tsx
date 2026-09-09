import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DataTable } from "./data-table";

test("DataTable renders supplied rows", () => {
  assert.match(
    renderToStaticMarkup(
      <DataTable data={[{ name: "Ada" }]} columns={[{ accessorKey: "name", header: "Name" }]} />,
    ),
    /Ada/,
  );
});
