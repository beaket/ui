import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { RadioGroup } from "./radio";
import { Switch } from "./switch";

export default { title: "Design/Instrument sizing", tags: ["!autodocs"] } satisfies Meta;

export const FilterPanel: StoryObj = {
  render: () => (
    <section className="border-border max-w-sm space-y-6 border p-6">
      <h2 className="font-semibold">Transaction filters</h2>
      <label htmlFor="instrument-receipts" className="flex min-h-11 items-center gap-4">
        <Checkbox id="instrument-receipts" defaultChecked /> Include receipts
      </label>
      <RadioGroup defaultValue="personal" className="flex-col gap-6" aria-label="Account type">
        {["Personal", "Business"].map((label) => (
          <label
            key={label}
            htmlFor={`instrument-${label}`}
            className="flex min-h-11 items-center gap-4"
          >
            <RadioGroup.Item id={`instrument-${label}`} value={label.toLowerCase()} /> {label}
          </label>
        ))}
      </RadioGroup>
      {(["sm", "md", "lg"] as const).map((size) => (
        <label
          key={size}
          htmlFor={`instrument-${size}`}
          className="flex min-h-11 items-center gap-4"
        >
          <Switch id={`instrument-${size}`} size={size} /> Notifications ({size})
        </label>
      ))}
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const control of [canvas.getByRole("checkbox"), ...canvas.getAllByRole("radio")]) {
      await expect(control.getBoundingClientRect().height).toBe(24);
      await expect(control.getBoundingClientRect().width).toBe(24);
    }
    const switches = canvas.getAllByRole("switch");
    for (const [index, control] of switches.entries()) {
      const chassis = control.getBoundingClientRect();
      await expect(chassis.height).toBe(16 + index * 4);
      await expect(chassis.width).toBe(28 + index * 8);
      const thumb = control.querySelector<HTMLElement>("[data-slot=switch-thumb]")!;
      await expect(thumb.getBoundingClientRect().height).toBe(8 + index * 4);
      await expect(thumb.getBoundingClientRect().left - chassis.left).toBe(3);
      await userEvent.click(control);
      await waitFor(() => expect(chassis.right - thumb.getBoundingClientRect().right).toBe(3));
      await expect(control.getBoundingClientRect().x).toBe(chassis.x);
      await expect(control.getBoundingClientRect().y).toBe(chassis.y);
    }
    for (const control of [
      canvas.getByRole("checkbox"),
      ...canvas.getAllByRole("radio"),
      ...switches,
    ]) {
      const hit = getComputedStyle(control, "::before");
      await expect(parseFloat(hit.width)).toBeGreaterThanOrEqual(44);
      await expect(parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
      const box = control.getBoundingClientRect();
      // Confirm the expanded top edge participates in real browser hit testing.
      await expect(
        document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2 - 21),
      ).toBe(control);
    }
  },
};
