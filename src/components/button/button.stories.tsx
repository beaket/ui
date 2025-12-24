import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "destructive", "outline", "secondary", "ghost", "link", "success", "stark"],
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

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "primary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Button",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Button",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Success: Story = {
  args: {
    children: "Save",
    variant: "success",
  },
};

export const Stark: Story = {
  args: {
    children: "Button",
    variant: "stark",
  },
};

export const Loading: Story = {
  args: {
    children: "Loading",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
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
    <Button variant="stark">Stark</Button>
  </div>
);

export const AllSizes = () => (
  <div className="flex items-center gap-2">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">→</Button>
  </div>
);

export const AllStates = () => (
  <div className="flex gap-2">
    <Button disabled>Disabled</Button>
    <Button loading>Loading</Button>
  </div>
);
