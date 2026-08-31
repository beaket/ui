import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
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

// Compositions for docs
export const AllVariants = () => (
  <div className="flex flex-wrap gap-2">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
    <Button variant="success">Success</Button>
    <Button variant="warning">Warning</Button>
  </div>
);

export const AllSizes = () => (
  <div className="flex items-center gap-2">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">+</Button>
  </div>
);

// Interaction states across the hierarchy. Rest is neutral, held-open owns the
// grown edge, and pressing drops onto it. Hover itself is best inspected in the
// canvas because it intentionally uses the thinner edge.
//   Pressed: the active declarations reconstructed with the component's own
//     tokens; box-shadow and transform go inline, as :active can't hold statically.
const StateCell = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col items-center gap-2">
    {children}
    <span className="text-fg-subtle text-xs">{label}</span>
  </div>
);

const StateRow = ({
  variant,
  pressedClassName,
}: {
  variant: "primary" | "outline";
  pressedClassName: string;
}) => (
  <div className="flex flex-col gap-3">
    <span className="text-fg-muted text-sm font-medium">{variant}</span>
    <div className="flex flex-wrap items-start gap-6">
      <StateCell label="Rest">
        <Button variant={variant}>Button</Button>
      </StateCell>
      <StateCell label="Held-open">
        <Button variant={variant} data-state="open">
          Button
        </Button>
      </StateCell>
      <StateCell label="Pressed">
        <Button
          variant={variant}
          className={pressedClassName}
          style={{ boxShadow: "none", transform: "translate(1px, 1px)" }}
        >
          Button
        </Button>
      </StateCell>
      <StateCell label="Disabled">
        <Button variant={variant} disabled>
          Button
        </Button>
      </StateCell>
      <StateCell label="Loading">
        <Button variant={variant} loading>
          Button
        </Button>
      </StateCell>
    </div>
  </div>
);

export const AllStates = () => (
  <div className="flex flex-col gap-8">
    <StateRow variant="primary" pressedClassName="bg-bg-emphasis-active" />
    <StateRow variant="outline" pressedClassName="bg-bg-active" />
  </div>
);

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
