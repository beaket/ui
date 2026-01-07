import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "A visual divider that separates content into distinct sections.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <div className="max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Section Title</h4>
        <p className="text-sm text-[var(--steel)]">Section description text.</p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Another Section</h4>
        <p className="text-sm text-[var(--steel)]">More content here.</p>
      </div>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="max-w-sm space-y-4">
      <p className="text-sm">Content above</p>
      <Separator />
      <p className="text-sm">Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <span className="text-sm">Item 1</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item 2</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item 3</span>
    </div>
  ),
};

export const AllStates = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-medium">Horizontal (default)</h3>
      <div className="max-w-sm space-y-4">
        <p className="text-sm text-[var(--steel)]">Section A</p>
        <Separator />
        <p className="text-sm text-[var(--steel)]">Section B</p>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Vertical</h3>
      <div className="flex h-6 items-center gap-4">
        <span className="text-sm text-[var(--steel)]">Home</span>
        <Separator orientation="vertical" />
        <span className="text-sm text-[var(--steel)]">About</span>
        <Separator orientation="vertical" />
        <span className="text-sm text-[var(--steel)]">Contact</span>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">In a card-like layout</h3>
      <div className="max-w-sm border border-[var(--chrome)] p-4">
        <h4 className="font-medium">Card Title</h4>
        <Separator className="my-3" />
        <p className="text-sm text-[var(--steel)]">Card content goes here.</p>
      </div>
    </div>
  </div>
);

export const InteractionTest: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4" data-testid="separator-container">
      <span>Left</span>
      <Separator orientation="vertical" data-testid="vertical-separator" />
      <span>Right</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const separator = canvas.getByTestId("vertical-separator");
    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute("data-orientation", "vertical");
  },
};
