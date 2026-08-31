import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import AllSizesExample from "../examples/button/all-sizes";
import AllStatesExample from "../examples/button/all-states";
import AllVariantsExample from "../examples/button/all-variants";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "success",
        "warning",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
    loading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// The interactive playground — pick any variant/size/state via Controls.
// Per-variant/size/state examples live in the AllVariants/AllSizes/AllStates
// compositions below (also what the docs site renders).
export const Default: Story = {
  args: {
    children: "Button",
  },
};

// Public examples stay consumer-ready. Storybook only wraps them with its own QA metadata.
export const AllVariants = () => <AllVariantsExample />;
export const AllSizes = () => <AllSizesExample />;
export const AllStates = () => <AllStatesExample />;

// Native representative: focus is allowed to coexist with an open-owner edge
// because the channels are spatially distinct (outer outline vs offset edge).
export const StatePrecedenceTest: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Button variant="outline" data-state="open">
      Focused open owner
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await userEvent.tab();
    await expect(button).toHaveFocus();

    await expect(button.className).toContain("focus-visible:outline-2");
    await expect(button.className).toContain("data-[state=open]:shadow-offset-action-hover");
  },
};

// Interaction Tests
export const ClickTest: Story = {
  args: {
    children: "Click Me",
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledClickTest: Story = {
  args: {
    children: "Disabled",
    disabled: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // Disabled button should not trigger onClick
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingClickTest: Story = {
  args: {
    children: "Loading",
    loading: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // Loading button should not trigger onClick
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
