import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text...",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A multi-line text input component with auto-resize support. Automatically grows based on content by default.",
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
    autoResize: true,
    rows: 4,
  },
  argTypes: {
    autoResize: {
      control: "boolean",
      description: "Automatically resize based on content",
    },
    rows: {
      control: { type: "number", min: 1, max: 20 },
      description: "Initial number of visible rows",
    },
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

export const AutoResize: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="textarea-auto">Auto Resize (default)</Label>
        <Textarea
          id="textarea-auto"
          placeholder="Type multiple lines and watch it grow..."
          defaultValue={"Line 1\nLine 2\nLine 3"}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textarea-resizable">Auto Resize + Manual (resizable)</Label>
        <Textarea
          id="textarea-resizable"
          resizable
          placeholder="Grows with content — drag the handle to make it taller."
          defaultValue={"Line 1\nLine 2"}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="textarea-fixed">Fixed Height (autoResize=false)</Label>
        <Textarea
          id="textarea-fixed"
          autoResize={false}
          rows={4}
          placeholder="Fixed height with manual resize handle"
        />
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
      <div>
        <Label htmlFor="test-resizable-textarea" className="sr-only">
          Resizable textarea
        </Label>
        <Textarea
          id="test-resizable-textarea"
          resizable
          placeholder="Resizable"
          data-testid="resizable-textarea"
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

    const resizableTextarea = canvas.getByTestId("resizable-textarea") as HTMLTextAreaElement;
    await expect(resizableTextarea).toHaveClass("resize-y");
    await userEvent.type(resizableTextarea, "A\nB\nC");
    await expect(resizableTextarea).toHaveValue("A\nB\nC");
  },
};
