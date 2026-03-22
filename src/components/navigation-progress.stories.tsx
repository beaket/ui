import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { NavigationProgress } from "./navigation-progress";

const meta: Meta<typeof NavigationProgress> = {
  title: "UI/NavigationProgress",
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
  render: (args) => (
    <div className="border-chrome bg-paper relative h-32 border">
      <NavigationProgress {...args} className="!relative" />
      <div className="p-6 pt-4">
        <p className="text-steel text-sm">
          The progress bar animates at the top. In production it uses <code>fixed</code>{" "}
          positioning.
        </p>
      </div>
    </div>
  ),
};

export const Inactive: Story = {
  args: {
    active: false,
  },
};

export const AllStates = () => (
  <div className="border-chrome bg-paper relative h-32 border">
    <NavigationProgress active={true} className="!relative" />
    <div className="p-6 pt-4">
      <p className="text-steel text-sm">
        Active state — the bar slides across the top of the container.
      </p>
    </div>
  </div>
);

export const Preview = () => (
  <div className="relative h-6">
    <NavigationProgress active={true} className="!relative" />
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
