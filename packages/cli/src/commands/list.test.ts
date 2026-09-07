import { afterEach, expect, it, vi } from "vitest";
import { list } from "./list.ts";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("lists and filters registry descriptions without reading project configuration", async () => {
  const fetch = vi.fn(
    async (_url: string, _options?: RequestInit) =>
      new Response(
        JSON.stringify({
          components: [
            { name: "table", description: "Tabular data" },
            { name: "button", description: "Press an action" },
          ],
        }),
      ),
  );
  vi.stubGlobal("fetch", fetch);
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const ref = "a".repeat(40);
  await list(undefined, { registryRef: ref });
  expect(log.mock.calls.flat()).toEqual([
    "Available components:",
    "  - button — Press an action",
    "  - table — Tabular data",
  ]);
  expect(fetch.mock.calls[0][0]).toContain(`/${ref}/registry/registry.json`);
  log.mockClear();
  await list("ACTION", { registryRef: ref });
  expect(log.mock.calls.flat()).toEqual(["Available components:", "  - button — Press an action"]);
  log.mockClear();
  await list("missing", { registryRef: ref });
  expect(log).toHaveBeenCalledWith('No components match "missing".');
});
