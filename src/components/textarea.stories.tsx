import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text...",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A multi-line text input component with support for validation states. Extends native textarea with consistent styling and accessibility features.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type something...",
    disabled: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="textarea-normal">Normal</Label>
        <Textarea id="textarea-normal" placeholder="Normal textarea" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textarea-disabled">Disabled</Label>
        <Textarea id="textarea-disabled" placeholder="Disabled textarea" disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textarea-readonly">Read Only</Label>
        <Textarea id="textarea-readonly" value="Read-only content" readOnly />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textarea-invalid">Invalid</Label>
        <Textarea id="textarea-invalid" placeholder="Invalid textarea" aria-invalid={true} />
      </div>
    </div>
  ),
};

export const WithRows: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="textarea-small">Small (3 rows)</Label>
        <Textarea id="textarea-small" rows={3} placeholder="3 rows" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textarea-large">Large (8 rows)</Label>
        <Textarea id="textarea-large" rows={8} placeholder="8 rows" />
      </div>
    </div>
  ),
};

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: { onChange: fn() },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="test-basic-textarea" className="sr-only">
          Basic textarea
        </Label>
        <Textarea
          id="test-basic-textarea"
          onChange={args.onChange}
          placeholder="Type here"
          data-testid="basic-textarea"
        />
      </div>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const basicTextarea = canvas.getByTestId("basic-textarea");
    await userEvent.type(basicTextarea, "Hello\nWorld");
    await expect(args.onChange).toHaveBeenCalled();
    await expect(basicTextarea).toHaveValue("Hello\nWorld");
  },
};
