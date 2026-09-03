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

// The interactive playground — toggle checked/disabled via Controls. Every
// state is shown together in the AllStates composition below (docs preview).
export const Default: Story = {};

// Compositions for docs
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

// One consolidated test — folds the toggle path and the disabled no-op.
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  args: { onCheckedChange: fn() },
  render: (args) => (
    <div className="flex flex-col gap-4">
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
