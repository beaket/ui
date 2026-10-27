import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

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

// The interactive playground — toggle checked/disabled via Controls. Every
// state is shown together in the AllStates composition below (docs preview).
export const Default: Story = {};

// Compositions for docs
export const AllStates = () => (
  <div className="flex flex-col gap-7">
    <div className="flex items-center gap-2">
      <Checkbox id="normal" />
      <Label htmlFor="normal">Normal</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Checked</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="disabled" disabled />
      <Label htmlFor="disabled">Disabled</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <Label htmlFor="disabled-checked">Disabled & Checked</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="invalid" aria-invalid />
      <Label htmlFor="invalid">Invalid</Label>
    </div>
  </div>
);

// One consolidated test — folds the toggle path and the disabled no-op.
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  args: { onCheckedChange: fn() },
  render: (args) => (
    <div className="flex flex-col gap-7">
      <Checkbox
        data-testid="enabled-checkbox"
        aria-label="Toggle me"
        onCheckedChange={args.onCheckedChange}
      />
      <Checkbox
        data-testid="disabled-checkbox"
        aria-label="Disabled"
        disabled
        onCheckedChange={args.onCheckedChange}
      />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Toggle on, then off
    const enabled = canvas.getByTestId("enabled-checkbox");
    await userEvent.click(enabled);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.click(enabled);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);

    // Disabled is a no-op — still only the two calls above
    const disabled = canvas.getByTestId("disabled-checkbox");
    await userEvent.click(disabled);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};
