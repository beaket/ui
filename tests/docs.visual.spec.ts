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
];

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
          },
        );
      });
    }
  });
}
