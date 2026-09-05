import { expect, test } from "@playwright/test";

const routes = [
  "/ui/",
  "/ui/installation",
  "/ui/cli",
  "/ui/design-rules",
  "/ui/tokens",
  "/ui/themes",
  // `/ui/changelog` is deliberately absent. It renders generated release data,
  // so its snapshot changes wholesale on every release; it is ~22,000px tall;
  // and at the 768px tablet viewport it oscillates between 22,802px and
  // 22,230px because its own scrollbar pushes the effective width across the
  // breakpoint, which changes the height, which changes whether there is a
  // scrollbar. Three consecutive runs alternated between exactly those two
  // heights. It guards no layout the other routes do not already cover.
  // Two component pages, not all 26: they share one layout, their examples are
  // already captured story by story, and `check-docs-preview-html.mjs` asserts
  // server-rendered preview markup on every page. `button` is the simplest of
  // them and `data-table` the densest.
  "/ui/components/button",
  "/ui/components/data-table",
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
