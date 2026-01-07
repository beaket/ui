import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    "aria-label": "Accept terms",
  },
  argTypes: {
    disabled: {
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
  },
};

export const AllStates = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="normal" />
      <label htmlFor="normal" className="text-sm">
        Normal
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="checked" defaultChecked />
      <label htmlFor="checked" className="text-sm">
        Checked
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="disabled" disabled />
      <label htmlFor="disabled" className="text-sm">
        Disabled
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <label htmlFor="disabled-checked" className="text-sm">
        Disabled & Checked
      </label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="invalid" aria-invalid />
      <label htmlFor="invalid" className="text-sm">
        Invalid
      </label>
    </div>
  </div>
);

// Interaction Tests
export const ClickTest: Story = {
  args: {
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
};

export const DisabledClickTest: Story = {
  args: {
    disabled: true,
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
