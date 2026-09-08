import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import AllStatesExample from "../examples/progress/all-states";
import DefaultExample from "../examples/progress/default";
import { Progress } from "./progress";

export default { title: "UI/Progress", component: Progress, tags: ["autodocs"] } satisfies Meta<
  typeof Progress
>;
type Story = StoryObj<typeof Progress>;
export const Default: Story = { render: () => <DefaultExample /> };
export const AllStates: Story = { render: () => <AllStatesExample /> };

function ProgressExample() {
  const [value, setValue] = useState<number | null>(50);
  return (
    <div className="space-y-4">
      <Progress value={value} max={200} aria-label="Upload">
        <Progress.Indicator data-testid="fill" />
      </Progress>
      <button onClick={() => setValue(200)}>Complete</button>
      <button onClick={() => setValue(null)}>Unknown</button>
      <Progress value={Number.NaN} max={0} aria-label="Invalid data" />
    </div>
  );
}
export const ValueContract: Story = {
  render: () => <ProgressExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("progressbar", { name: "Upload" });
    const fill = canvas.getByTestId("fill");
    await expect(root).toHaveAttribute("aria-valuenow", "50");
    await expect(root).toHaveAttribute("aria-valuemax", "200");
    await expect(root.style.getPropertyValue("--progress-scale")).toBe("0.25");
    await expect(getComputedStyle(fill).transform).toBe("matrix(0.25, 0, 0, 1, 0, 0)");
    await userEvent.click(canvas.getByRole("button", { name: "Complete" }));
    await expect(root).toHaveAttribute("data-state", "complete");
    await expect(root.style.getPropertyValue("--progress-scale")).toBe("1");
    await userEvent.click(canvas.getByRole("button", { name: "Unknown" }));
    await expect(root).not.toHaveAttribute("aria-valuenow");
    await expect(root).toHaveAttribute("data-state", "indeterminate");
    await expect(canvas.getByRole("progressbar", { name: "Invalid data" })).not.toHaveAttribute(
      "aria-valuenow",
    );
  },
};
