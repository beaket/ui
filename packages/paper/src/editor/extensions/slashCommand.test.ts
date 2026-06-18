import { describe, expect, it } from "vitest";
import { defaultSlashItems, resolveSlashItems } from "./slashCommand";

// Slash item consumer config contract (ADR-0012). resolveSlashItems is a coordinate-independent
// pure function, so it is a deterministic unit-test target (ADR-0005). Menu position/scroll are
// verified in the browser.

describe("resolveSlashItems — defaults", () => {
  it("resolves the default items as-is when unspecified", () => {
    const items = resolveSlashItems();
    expect(items.map((i) => i.label)).toEqual(defaultSlashItems.map((s) => s.label));
  });

  it("fills items without keywords with an empty string (so filter matching does not throw)", () => {
    const items = resolveSlashItems([{ label: "날짜", insert: "2026-06-16" }]);
    expect(items[0].keywords).toBe("");
  });

  it("privileged action is reattached only via built-in id — only the table has after", () => {
    const items = resolveSlashItems();
    const table = items.find((i) => i.label === "Table");
    const h1 = items.find((i) => i.label === "Heading 1");
    expect(table?.after).toBeTypeOf("function");
    expect(h1?.after).toBeUndefined();
  });
});

describe("resolveSlashItems — flat array (complete replacement)", () => {
  it("discards defaults and keeps only the consumer items", () => {
    const items = resolveSlashItems([{ label: "날짜", insert: "2026-06-16" }]);
    expect(items.map((i) => i.label)).toEqual(["날짜"]);
  });

  it("consumer items cannot acquire a privileged action (no after if id is not in the registry)", () => {
    const items = resolveSlashItems([{ id: "mine", label: "내 표", insert: "| a |" }]);
    expect(items[0].after).toBeUndefined();
  });

  it("a consumer that borrows the table id gets the privileged action (built-in reuse path)", () => {
    const items = resolveSlashItems([{ id: "table", label: "내 표", insert: "| a |" }]);
    expect(items[0].after).toBeTypeOf("function");
  });
});

describe("resolveSlashItems — transformer (derived)", () => {
  it("can exclude an item from defaults", () => {
    const items = resolveSlashItems((d) => d.filter((x) => x.id !== "codeblock"));
    expect(items.find((i) => i.label === "Code block")).toBeUndefined();
    expect(items.find((i) => i.label === "Table")).toBeDefined();
  });

  it("returned array order = display order (expresses order without priority)", () => {
    const items = resolveSlashItems((d) => [...d].reverse());
    expect(items.map((i) => i.label)).toEqual([...defaultSlashItems].reverse().map((s) => s.label));
  });

  it("can mix defaults items with new consumer items, and the table privilege is preserved", () => {
    const items = resolveSlashItems((d) => [{ label: "날짜", insert: "2026-06-16" }, ...d]);
    expect(items[0].label).toBe("날짜");
    expect(items[0].after).toBeUndefined();
    expect(items.find((i) => i.label === "Table")?.after).toBeTypeOf("function");
  });

  it("the defaults passed to the transformer are a copy, so they cannot mutate the original", () => {
    const before = defaultSlashItems.map((s) => s.label);
    resolveSlashItems((d) => {
      d[0].label = "HACKED";
      return d;
    });
    expect(defaultSlashItems.map((s) => s.label)).toEqual(before);
  });

  it("returning an empty array yields no items (menu closes, same as a filter result of 0)", () => {
    expect(resolveSlashItems(() => [])).toEqual([]);
  });
});
