import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { NavigationProgress } from "./navigation-progress";

const meta: Meta<typeof NavigationProgress> = {
  title: "Components/NavigationProgress",
  component: NavigationProgress,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof NavigationProgress>;

export const Default: Story = {
  args: {
    active: true,
  },
};

export const Inactive: Story = {
  args: {
    active: false,
  },
};

export const AllStates = () => (
  <div className="relative min-h-[100px]">
    <NavigationProgress active={true} />
    <div className="p-6">
      <p className="text-steel text-sm">The progress bar is shown at the top of the viewport.</p>
    </div>
  </div>
);

export const RenderTest: Story = {
  args: {
    active: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeInTheDocument();
    await expect(progressbar).toHaveAttribute("aria-label", "Loading");
  },
};

export const InactiveRenderTest: Story = {
  args: {
    active: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.queryByRole("progressbar");
    await expect(progressbar).not.toBeInTheDocument();
  },
};
