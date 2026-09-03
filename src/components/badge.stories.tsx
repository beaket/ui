import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { expect, within } from "storybook/test";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "success", "error", "info", "outline", "warning", "code"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// The interactive playground — pick any variant via Controls. Every variant is
// shown together in the AllVariants composition below (also the docs preview).
export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

// Compositions for docs
export const AllVariants = () => (
  <div className="flex flex-wrap gap-2">
    <Badge variant="default">Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="success">
      <CircleCheck aria-hidden="true" className="mr-1 size-3" /> Success
    </Badge>
    <Badge variant="error">
      <CircleX aria-hidden="true" className="mr-1 size-3" /> Error
    </Badge>
    <Badge variant="info">
      <Info aria-hidden="true" className="mr-1 size-3" /> Info
    </Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="warning">
      <TriangleAlert aria-hidden="true" className="mr-1 size-3" /> Warning
    </Badge>
    <Badge variant="code">SPEC-001</Badge>
  </div>
);

// One consolidated test — folds render + the role/label accessibility path.
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  args: {
    children: "Status",
    role: "status",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole("status");

    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent("Status");
  },
};
