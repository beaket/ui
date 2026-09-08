import { expect, test } from "@playwright/test";

for (const [component, part] of [
  ["switch", "thumb"],
  ["checkbox", "indicator"],
]) {
  test(`${component} keeps disabled inner parts still under pointer press`, async ({ page }) => {
    await page.goto(
      `http://127.0.0.1:6006/iframe.html?id=ui-${component}--all-states&viewMode=story`,
    );
    // Test the final geometry, independent of transition timing.
    await page.addStyleTag({ content: "* { transition: none !important; }" });
    const controls = page.locator(`[data-slot=${component}][disabled]`).filter({
      has: page.locator(`[data-slot=${component}-${part}]`),
    });
    await expect(controls.first()).toBeVisible();
    for (const control of await controls.all()) {
      const inner = control.locator(`[data-slot=${component}-${part}]`);
      const translate = await inner.evaluate((element) => getComputedStyle(element).translate);
      const before = await inner.boundingBox();
      const chassis = await control.boundingBox();
      if (!chassis) throw new Error("Control has no layout box");
      await page.mouse.move(chassis.x + chassis.width / 2, chassis.y + chassis.height / 2);
      await page.mouse.down();
      await expect(inner).toHaveCSS("translate", translate);
      expect(await inner.boundingBox()).toEqual(before);
      await page.mouse.up();
    }
  });
}
