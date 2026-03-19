import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "./button";
import { PageHeader } from "./page-header";

const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Documents",
  },
};

export const WithCount: Story = {
  args: {
    title: "Documents",
    count: 42,
  },
};

export const WithAction: Story = {
  args: {
    title: "Documents",
    count: 42,
  },
  render: (args) => (
    <PageHeader {...args}>
      <Button size="sm">New Document</Button>
    </PageHeader>
  ),
};

export const AllStates = () => (
  <div className="border-chrome flex flex-col gap-4 border">
    <PageHeader title="Simple Title" />
    <PageHeader title="With Count" count={12} />
    <PageHeader title="With Action" count={99}>
      <Button size="sm">Create</Button>
    </PageHeader>
  </div>
);

export const RenderTest: Story = {
  args: {
    title: "Test Title",
    count: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Test Title")).toBeInTheDocument();
    await expect(canvas.getByText("(5)")).toBeInTheDocument();
  },
};
