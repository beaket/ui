import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Run with the existing browser/Storybook gate; do not exclude the hidden canvas.
for (const scheme of ["light", "dark"] as const) {
  for (const kind of ["select", "dropdownmenu"] as const) {
    test(`${kind} background focus isolation (${scheme})`, async ({ page }, info) => {
      const story = kind === "select" ? "default" : "with-submenus";
      await page.goto(
        `http://127.0.0.1:6006/iframe.html?id=ui-${kind}--${story}&viewMode=story&globals=scheme:${scheme}`,
      );
      const trigger = page.getByRole(kind === "select" ? "combobox" : "button", {
        name: kind === "select" ? "Select a fruit" : "Open Menu",
        exact: true,
      });
      await expect(trigger).toBeVisible();
      await page.evaluate(() => {
        const root = document.getElementById("storybook-root")!;
        for (let i = 0; i < 23; i++) {
          const button = document.createElement("button");
          button.textContent = `Background action ${i}`;
          root.append(button);
        }
        const preserved = document.createElement("div");
        preserved.id = "already-inert";
        preserved.inert = true;
        document.body.append(preserved);
      });
      const root = page.locator("#storybook-root");
      for (let cycle = 0; cycle < 2; cycle++) {
        await trigger.focus();
        await page.keyboard.press("Enter");
        await expect(root).toHaveAttribute("inert", "");
        await page
          .locator("#storybook-root button")
          .last()
          .evaluate((el) => el.focus());
        expect(await root.evaluate((el) => el.contains(document.activeElement))).toBe(false);
        if (kind === "dropdownmenu") {
          await page.getByRole("menuitem", { name: "Invite users" }).focus();
          await page.keyboard.press("ArrowRight");
          await expect(page.getByRole("menuitem", { name: "Email", exact: true })).toBeVisible();
        }
        const result = await new AxeBuilder({ page }).withRules(["aria-hidden-focus"]).analyze();
        await info.attach(`axe-${cycle}`, {
          body: JSON.stringify(result),
          contentType: "application/json",
        });
        expect(result.violations).toEqual([]);
        if (kind === "dropdownmenu") {
          await page.keyboard.press("ArrowLeft");
          await expect(root).toHaveAttribute("inert", "");
        }
        await page.keyboard.press("Escape");
        await expect(trigger).toBeFocused();
        await expect(root).not.toHaveAttribute("inert");
        await expect(page.locator("#already-inert")).toHaveAttribute("inert", "");
      }
    });
  }
}
