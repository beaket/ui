import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { Tooltip, TooltipProvider } from "./tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>This is a tooltip</p>
      </Tooltip.Content>
    </Tooltip>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-8 py-12">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Top</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="top">Tooltip on top</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Bottom</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">Tooltip on bottom</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Left</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">Tooltip on left</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button variant="outline">Right</Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">Tooltip on right</Tooltip.Content>
      </Tooltip>
    </div>
  ),
};

export const AllStates = () => (
  <TooltipProvider>
    <div className="flex flex-col gap-8 py-12">
      <div className="flex items-center gap-4">
        <span className="text-fg-muted w-24 text-sm">Default</span>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Hover</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Default tooltip</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-fg-muted w-24 text-sm">On icon</span>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <button
              className="border-border text-fg-muted hover:text-fg inline-flex size-8 items-center justify-center border"
              aria-label="Help"
            >
              ?
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>Help information</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-fg-muted w-24 text-sm">Long text</span>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button variant="outline">Long tooltip</Button>
          </Tooltip.Trigger>
          <Tooltip.Content className="max-w-xs">
            This is a longer tooltip that demonstrates how the component handles more content.
          </Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  </TooltipProvider>
);

export const InteractionTest: Story = {
  render: () => (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>This is a tooltip</p>
      </Tooltip.Content>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: "Hover me" });
    await userEvent.hover(trigger);

    const tooltip = await screen.findByRole("tooltip");
    await expect(tooltip).toBeInTheDocument();
    await expect(tooltip).toHaveTextContent("This is a tooltip");

    await userEvent.unhover(trigger);
  },
};
