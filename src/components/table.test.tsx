import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Table } from "./table";

test("Table renders a cell", () => {
  assert.match(
    renderToStaticMarkup(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    ),
    /Value/,
  );
});
