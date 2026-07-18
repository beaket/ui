import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RadioGroup, RadioItem } from "./radio";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// The interactive playground — toggle disabled/orientation via Controls.
// Orientation and disabled variants are shown together in AllStates (docs preview).
export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
};

// Compositions for docs
export const AllStates = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs tracking-wide uppercase">Horizontal</span>
      <RadioGroup defaultValue="option1" aria-label="Horizontal options">
        <div className="flex items-center gap-1">
          <RadioItem value="option1" id="h-opt1" />
          <label htmlFor="h-opt1" className="text-sm">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option2" id="h-opt2" />
          <label htmlFor="h-opt2" className="text-sm">
            Option 2
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option3" id="h-opt3" />
          <label htmlFor="h-opt3" className="text-sm">
            Option 3
          </label>
        </div>
      </RadioGroup>
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs tracking-wide uppercase">Vertical</span>
      <RadioGroup
        defaultValue="option2"
        orientation="vertical"
        className="flex-col"
        aria-label="Vertical options"
      >
        <div className="flex items-center gap-2">
          <RadioItem value="option1" id="v-opt1" />
          <label htmlFor="v-opt1" className="text-sm">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="option2" id="v-opt2" />
          <label htmlFor="v-opt2" className="text-sm">
            Option 2
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="option3" id="v-opt3" />
          <label htmlFor="v-opt3" className="text-sm">
            Option 3
          </label>
        </div>
      </RadioGroup>
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs tracking-wide uppercase">Disabled</span>
      <RadioGroup disabled defaultValue="option1" aria-label="Disabled options">
        <div className="flex items-center gap-1">
          <RadioItem value="option1" id="d-opt1" />
          <label htmlFor="d-opt1" className="text-fg-muted text-sm">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option2" id="d-opt2" />
          <label htmlFor="d-opt2" className="text-fg-muted text-sm">
            Option 2
          </label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

// One consolidated test — folds selection across items and the disabled no-op.
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: { onValueChange: fn() },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div data-testid="enabled-group">
        <RadioGroup aria-label="Enabled options" onValueChange={args.onValueChange}>
          <RadioItem value="option1" aria-label="Option 1" />
          <RadioItem value="option2" aria-label="Option 2" />
          <RadioItem value="option3" aria-label="Option 3" />
        </RadioGroup>
      </div>
      <div data-testid="disabled-group">
        <RadioGroup aria-label="Disabled options" disabled onValueChange={args.onValueChange}>
          <RadioItem value="option1" aria-label="Option A" />
          <RadioItem value="option2" aria-label="Option B" />
        </RadioGroup>
      </div>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Selecting each item fires onValueChange with its value
    const enabled = within(canvas.getByTestId("enabled-group"));
    const radios = enabled.getAllByRole("radio");
    await userEvent.click(radios[0]);
    await expect(args.onValueChange).toHaveBeenCalledWith("option1");
    await userEvent.click(radios[1]);
    await expect(args.onValueChange).toHaveBeenCalledWith("option2");
    await userEvent.click(radios[2]);
    await expect(args.onValueChange).toHaveBeenCalledWith("option3");

    // Disabled group is a no-op — still only the three calls above
    const disabled = within(canvas.getByTestId("disabled-group"));
    await userEvent.click(disabled.getAllByRole("radio")[0]);
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
  },
};
