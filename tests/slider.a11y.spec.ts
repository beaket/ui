import { expect, test } from "@playwright/test";

test("Slider keeps a disabled thumb still under a real pointer press", async ({ page }) => {
  await page.goto("http://127.0.0.1:6006/iframe.html?id=ui-slider--all-states&viewMode=story");
  const thumb = page.locator("[data-slot=slider-thumb][data-disabled]");
  await expect(thumb).toBeVisible();
  const before = await thumb.boundingBox();
  if (!before) throw new Error("Disabled thumb has no layout box");
  const value = await thumb.getAttribute("aria-valuenow");
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await expect(thumb).toHaveCSS("translate", "none");
  expect(await thumb.boundingBox()).toEqual(before);
  await page.mouse.up();
  expect(await thumb.getAttribute("aria-valuenow")).toBe(value);
  const hit = await thumb.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return { width: parseFloat(style.width), height: parseFloat(style.height) };
  });
  expect(hit.width).toBeGreaterThanOrEqual(44);
  expect(hit.height).toBeGreaterThanOrEqual(44);
});
