import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Label Text",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A form label component that integrates with Radix UI's Label primitive. Provides semantic labeling for form controls with proper accessibility support via htmlFor attribute.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-default" />
      <Label htmlFor="terms-default">I agree to the terms and conditions</Label>
    </div>
  ),
};

export const WithInput: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="email-required">
          Email
          <span className="text-danger-fg ml-1">*</span>
        </Label>
        <Input id="email-required" type="email" required placeholder="email@example.com" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="terms-1" />
        <Label htmlFor="terms-1">Default label with checkbox</Label>
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <Label htmlFor="input-1">Label with input</Label>
        <Input id="input-1" placeholder="Type here..." />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <Label htmlFor="input-required">
          Required field
          <span className="text-danger-fg ml-1">*</span>
        </Label>
        <Input id="input-required" required placeholder="Required" />
      </div>
    </div>
  ),
};

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="test-terms" data-testid="test-checkbox" />
      <Label htmlFor="test-terms">Accept terms and conditions</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const termsLabel = canvas.getByText("Accept terms and conditions");
    const termsCheckbox = canvas.getByTestId("test-checkbox");

    await expect(termsLabel).toHaveAttribute("for", "test-terms");
    await expect(termsCheckbox).toHaveAttribute("id", "test-terms");

    // Clicking label should toggle the checkbox
    await expect(termsCheckbox).not.toBeChecked();
    await userEvent.click(termsLabel);
    await expect(termsCheckbox).toBeChecked();
  },
};
