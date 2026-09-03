import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

type Story = { id: string; type: string; tags: string[] };
const { entries } = JSON.parse(readFileSync("storybook-static/index.json", "utf8")) as {
  entries: Record<string, Story>;
};
// Play-function checks and the intentionally empty inactive state have no visual surface to compare.
const stories = Object.values(entries).filter(
  ({ id, type, tags }) =>
    type === "story" && id !== "ui-navigationprogress--inactive" && !tags.includes("play-fn"),
);

for (const viewport of [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test.describe(viewport.name, () => {
    test.use({ viewport });

    for (const { id } of stories) {
      test(id, async ({ page }) => {
        await page.route("https://github.com/beaket.png", (route) => route.abort());
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=${id}&viewMode=story`);
        const root = page.locator("#storybook-root");
        await expect(root).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expect(root).toHaveScreenshot(`${viewport.name}-${id}.png`, {
          animations: "disabled",
        });
      });
    }
  });
}
