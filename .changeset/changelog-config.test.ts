import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const changelog = require("./changelog-config.cjs") as {
  getReleaseLine: (
    changeset: { id: string; summary: string; releases: [] },
    type: string,
    options: { repo: string },
  ) => Promise<string>;
};

const render = (summary: string) =>
  changelog.getReleaseLine({ id: "test", summary, releases: [] }, "patch", {
    repo: "beaket/ui",
  });

describe("changelog-config", () => {
  it("leaves all-digit hex colours as inline code, not issue links", async () => {
    const line = await render(
      "Grounds are `#151617` and `#222527`, info is #275085, alpha #12345678.",
    );

    expect(line).not.toContain("](https://github.com/");
    expect(line).toContain("`#151617`");
    expect(line).toContain("`#222527`");
    expect(line).toContain("`#275085`");
    expect(line).toContain("`#12345678`");
  });

  it("keeps real issue and pull request references linked", async () => {
    const line = await render("Fixes #123 and #1082.");

    expect(line).toContain("[#123](https://github.com/beaket/ui/issues/123)");
    expect(line).toContain("[#1082](https://github.com/beaket/ui/issues/1082)");
  });
});
