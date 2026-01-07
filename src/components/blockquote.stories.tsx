import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Blockquote } from "./blockquote";

const meta: Meta<typeof Blockquote> = {
  title: "UI/Blockquote",
  component: Blockquote,
  tags: ["autodocs"],
  argTypes: {
    author: {
      control: "text",
    },
    authorTitle: {
      control: "text",
    },
    cite: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  args: {
    children: "Simplicity is the ultimate sophistication.",
  },
};

export const WithAuthor: Story = {
  args: {
    children: "Good design is as little design as possible.",
    author: "Dieter Rams",
  },
};

export const WithAuthorAndTitle: Story = {
  args: {
    children:
      "The interface should get out of the way and let users accomplish their goals efficiently.",
    author: "Product Team",
    authorTitle: "Design Lead",
  },
};

export const LongQuote: Story = {
  args: {
    children:
      "A well-designed system reveals its structure through use. Every element serves a purpose, every interaction teaches the user something new about the system they are navigating.",
    author: "Engineering Team",
    authorTitle: "Systems Architecture",
  },
};

// Compositions for docs
export const AllVariants = () => (
  <div className="space-y-6">
    <Blockquote>Simplicity is the ultimate sophistication.</Blockquote>
    <Blockquote author="Dieter Rams">Good design is as little design as possible.</Blockquote>
    <Blockquote author="Product Team" authorTitle="Design Lead">
      Clarity over decoration. Function before form. Every pixel accountable.
    </Blockquote>
  </div>
);

// Interaction Tests
export const RenderTest: Story = {
  args: {
    children: "Test quote content",
    author: "Test Author",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const quote = canvas.getByText("Test quote content");
    const author = canvas.getByText("Test Author");

    await expect(quote).toBeInTheDocument();
    await expect(author).toBeInTheDocument();
  },
};

export const AccessibilityTest: Story = {
  args: {
    children: "Accessibility test quote",
    cite: "https://example.com/source",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const blockquote = canvas.getByRole("blockquote");

    await expect(blockquote).toBeInTheDocument();
    await expect(blockquote).toHaveAttribute("cite", "https://example.com/source");
  },
};
