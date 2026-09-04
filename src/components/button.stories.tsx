import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
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

// F5 — React 19's useFormStatus is a design-system hook: a submit button in a
// <form> reads the form's pending state directly, so the most common loading
// case there is needs no wiring by the consumer. The explicit prop still wins.
export const FormStatusTest: Story = {
  tags: ["!autodocs"],
  render: function Render() {
    const [done, setDone] = useState(false);
    return (
      <form
        action={async () => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          setDone(true);
        }}
        className="flex items-center gap-2"
      >
        <Button type="submit" data-testid="submit">
          Save
        </Button>
        <Button type="submit" loading={false} data-testid="override">
          Never spins
        </Button>
        <Button data-testid="plain">Plain</Button>
        {done && <span data-testid="done">done</span>}
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByTestId("submit");

    await expect(submit).not.toBeDisabled();
    await userEvent.click(submit);

    // The submit button follows the form with no `loading` prop in sight.
    await waitFor(() => expect(submit).toBeDisabled());
    await expect(submit.querySelector("[aria-live='polite']")).toBeInTheDocument();

    // An explicit `loading={false}` overrides the fallback…
    await expect(canvas.getByTestId("override")).not.toBeDisabled();
    // …and a button that is not a submit button is untouched.
    await expect(canvas.getByTestId("plain")).not.toBeDisabled();

    await waitFor(() => expect(canvas.getByTestId("done")).toBeInTheDocument(), { timeout: 5000 });
    await waitFor(() => expect(submit).not.toBeDisabled());
  },
};
