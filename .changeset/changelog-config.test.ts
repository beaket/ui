import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const changelog = require("./changelog-config.cjs");

const options = { repo: "beaket/ui" };

const render = async (summary: string): Promise<string> =>
  changelog.getReleaseLine(
    { id: "test", summary, releases: [{ name: "@beaket/ui", type: "patch" }] },
    "patch",
    options,
  );

describe("changelog wrapper", () => {
  it("does not link all-digit hex colours as issues", async () => {
    const line = await render("Palette `#151617`, `#222527` and bare #275085.");
    expect(line).not.toContain("](https://github.com/");
    expect(line).toContain("`#151617`");
    expect(line).toContain("`#222527`");
    expect(line).toContain("`#275085`");
  });

  it("keeps short issue references linked", async () => {
    const line = await render("See #1082 for context.");
    expect(line).toContain("[#1082](https://github.com/beaket/ui/issues/1082)");
  });
});
