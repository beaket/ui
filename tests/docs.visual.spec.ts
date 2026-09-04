import { expect, test } from "@playwright/test";
import registry from "../registry/registry.json" with { type: "json" };

const routes = [
  "/ui/",
  "/ui/installation",
  "/ui/cli",
  "/ui/design-rules",
  "/ui/tokens",
  "/ui/themes",
  "/ui/changelog",
  ...registry.components.map(({ name }) => `/ui/components/${name}`),
].filter(
  (route) =>
    process.env.VISUAL_TEST_MODE !== "selected" ||
    (process.env.VISUAL_DOCS?.split(",").filter(Boolean) ?? []).includes(route),
);

for (const viewport of [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test.describe(viewport.name, () => {
    test.use({ viewport });

    for (const route of routes) {
      test(route, async ({ page }) => {
        await page.route("https://github.com/beaket.png", (route) => route.abort());
        const response = await page.goto(`http://127.0.0.1:4322${route}`);
        expect(response?.ok()).toBeTruthy();
        await expect(page.locator(".layout")).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(
          `${viewport.name}-${route.replaceAll("/", "-") || "home"}.png`,
          {
            animations: "disabled",
            fullPage: true,
            // The sidebar prints the published package version on every page
            // (`doc.astro` renders `v{pkg.version}`), so a release PR's version
            // bump shifts a handful of pixels on all 99 docs snapshots at once
            // and blocks the release that produced it. The version is not what
            // these snapshots are guarding.
            mask: [page.locator(".sidebar-version")],
          },
        );
      });
    }
  });
}
