import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const props = JSON.parse(
  readFileSync(new URL("../src/generated/props.json", import.meta.url), "utf8"),
);
// Named part exports must not leak into the root API or duplicate compound rows.
for (const [component, rootProp, partProp] of [
  ["data-table", "searchPlaceholder", "Toolbar.searchPlaceholder"],
  ["navigation", "value", "Link.value"],
  ["pagination", "page", "Item.page"],
]) {
  assert.equal(props[component].filter(({ name }) => name === rootProp).length, 1);
  assert.equal(props[component].filter(({ name }) => name === partProp).length, 1);
}
assert(!props["data-table"].some(({ name }) => name === "message" || name === "row"));
assert(props["data-table"].some(({ name }) => name === "Empty.message"));
console.log("Named compound prop documentation passed");
