import { expect, test } from "@playwright/test";
import { open } from "./ime";

// Theme token precedence in a real browser (ADR-0025). jsdom does not resolve var() chains, so
// theme.test.ts locks the chain strings and this checks the cascade they produce:
// role override > deprecated 0.x alias > host @beaket/ui semantic token > built-in default.

const bodyColor = (page: import("@playwright/test").Page) =>
  page.locator(".cm-content").evaluate((el) => getComputedStyle(el).color);

test("the built-in default applies with no host tokens", async ({ page }) => {
  await open(page, "text");
  expect(await bodyColor(page)).toBe("rgb(35, 42, 53)"); // #232a35
});

test("a host @beaket/ui semantic token is inherited", async ({ page }) => {
  await open(page, "text");
  await page.addStyleTag({ content: ":root { --color-fg: rgb(1, 2, 3); }" });
  expect(await bodyColor(page)).toBe("rgb(1, 2, 3)");
});

test("the deprecated alias beats the host token", async ({ page }) => {
  await open(page, "text");
  await page.addStyleTag({
    content: ":root { --color-fg: rgb(1, 2, 3); --beaket-paper-ink: rgb(4, 5, 6); }",
  });
  expect(await bodyColor(page)).toBe("rgb(4, 5, 6)");
});

test("the role override beats the alias and the host token", async ({ page }) => {
  await open(page, "text");
  await page.addStyleTag({
    content:
      ":root { --color-fg: rgb(1, 2, 3); --beaket-paper-ink: rgb(4, 5, 6); --beaket-paper-fg: rgb(7, 8, 9); }",
  });
  expect(await bodyColor(page)).toBe("rgb(7, 8, 9)");
});

test("the writing surface follows the host's bg-input", async ({ page }) => {
  await open(page, "text");
  await page.addStyleTag({ content: ":root { --color-bg-input: rgb(250, 249, 248); }" });
  const bg = await page
    .locator(".cm-editor")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe("rgb(250, 249, 248)");
});
