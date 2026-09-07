import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import AllStatesExample from "../examples/slider/all-states";
import DefaultExample from "../examples/slider/default";
import { Slider } from "./slider";

export default { title: "UI/Slider", component: Slider, tags: ["autodocs"] } satisfies Meta<
  typeof Slider
>;
type Story = StoryObj<typeof Slider>;
export const Default: Story = { render: () => <DefaultExample /> };
export const AllStates: Story = { render: () => <AllStatesExample /> };

function ControlledExample() {
  const [value, setValue] = useState([20, 80]);
  return (
    <Slider
      value={value}
      onValueChange={setValue}
      step={5}
      minStepsBetweenThumbs={1}
      thumbLabels={["Minimum", "Maximum"]}
    />
  );
}
export const KeyboardAndRange: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("slider", { name: "Minimum" });
    first.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(first).toHaveAttribute("aria-valuenow", "25");
    await userEvent.keyboard("{Home}");
    await expect(first).toHaveAttribute("aria-valuenow", "0");
    const second = canvas.getByRole("slider", { name: "Maximum" });
    second.focus();
    await userEvent.keyboard("{End}");
    await expect(second).toHaveAttribute("aria-valuenow", "100");
    const hit = getComputedStyle(second, "::before");
    await expect(parseFloat(hit.width)).toBeGreaterThanOrEqual(44);
    await expect(parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
  },
};
export const OrientationAndForm: Story = {
  render: () => (
    <form aria-label="Settings" className="flex gap-12">
      <Slider name="volume" orientation="vertical" defaultValue={[40]} step={5}>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumb aria-label="Vertical volume" />
      </Slider>
      <Slider dir="rtl" defaultValue={[40]} thumbLabels={["RTL volume"]} />
      <Slider disabled defaultValue={[40]} thumbLabels={["Disabled volume"]} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const vertical = canvas.getByRole("slider", { name: "Vertical volume" });
    vertical.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(vertical).toHaveAttribute("aria-valuenow", "45");
    const form = canvas.getByRole("form", { name: "Settings" }) as HTMLFormElement;
    await waitFor(() => expect(new FormData(form).get("volume")).toBe("45"));
    const rtl = canvas.getByRole("slider", { name: "RTL volume" });
    rtl.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(rtl).toHaveAttribute("aria-valuenow", "41");
    await expect(canvas.getByRole("slider", { name: "Disabled volume" })).toHaveAttribute(
      "data-disabled",
    );
  },
};
