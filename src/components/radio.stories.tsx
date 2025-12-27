import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RadioGroup, RadioItem } from "./radio";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Radio",
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

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="option2" aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <RadioGroup {...args} orientation="vertical" className="flex-col" aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <RadioGroup {...args} disabled aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
};

export const DisabledWithValue: Story = {
  render: (args) => (
    <RadioGroup {...args} disabled defaultValue="option2" aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
};

export const AllStates = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-wide text-[var(--steel)] uppercase">Horizontal</span>
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
      <span className="text-xs tracking-wide text-[var(--steel)] uppercase">Vertical</span>
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
      <span className="text-xs tracking-wide text-[var(--steel)] uppercase">Disabled</span>
      <RadioGroup disabled defaultValue="option1" aria-label="Disabled options">
        <div className="flex items-center gap-1">
          <RadioItem value="option1" id="d-opt1" />
          <label htmlFor="d-opt1" className="text-sm text-[var(--steel)]">
            Option 1
          </label>
        </div>
        <div className="flex items-center gap-1">
          <RadioItem value="option2" id="d-opt2" />
          <label htmlFor="d-opt2" className="text-sm text-[var(--steel)]">
            Option 2
          </label>
        </div>
      </RadioGroup>
    </div>
  </div>
);

// Interaction Tests
export const ClickTest: Story = {
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <RadioGroup {...args} aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
      <RadioItem value="option3" aria-label="Option 3" />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");

    await userEvent.click(radios[0]);
    await expect(args.onValueChange).toHaveBeenCalledWith("option1");

    await userEvent.click(radios[1]);
    await expect(args.onValueChange).toHaveBeenCalledWith("option2");

    await userEvent.click(radios[2]);
    await expect(args.onValueChange).toHaveBeenCalledWith("option3");
  },
};

export const DisabledClickTest: Story = {
  args: {
    disabled: true,
    onValueChange: fn(),
  },
  render: (args) => (
    <RadioGroup {...args} aria-label="Options">
      <RadioItem value="option1" aria-label="Option 1" />
      <RadioItem value="option2" aria-label="Option 2" />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");

    await userEvent.click(radios[0]);
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
