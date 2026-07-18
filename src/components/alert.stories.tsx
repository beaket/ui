import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Alert } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["note", "tip", "important", "warning", "caution"],
      description: "Visual style variant with associated icon and color",
    },
    title: {
      control: "text",
      description: "Custom title text (defaults to variant name)",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A callout component for displaying important information, tips, warnings, or cautions. Includes semantic icons and colors for each variant.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// The interactive playground — pick any variant and a custom title via Controls.
// Every variant lives in AllVariants; custom titles and rich content in AllStates.
export const Default: Story = {
  args: {
    children: "This is a note providing additional information.",
  },
};

// Compositions for docs
export const AllVariants = () => (
  <div className="max-w-lg space-y-4">
    <Alert variant="note">
      <p>This is a note. Use it for general information.</p>
    </Alert>

    <Alert variant="tip">
      <p>This is a tip. Use it for helpful suggestions.</p>
    </Alert>

    <Alert variant="important">
      <p>This is important. Use it for key information.</p>
    </Alert>

    <Alert variant="warning">
      <p>This is a warning. Use it for cautionary messages.</p>
    </Alert>

    <Alert variant="caution">
      <p>This is caution. Use it for dangerous actions.</p>
    </Alert>
  </div>
);

export const AllStates = () => (
  <div className="max-w-lg space-y-6">
    <div>
      <h3 className="mb-4 text-sm font-medium">All Variants</h3>
      <div className="space-y-3">
        <Alert variant="note">Note: General information.</Alert>
        <Alert variant="tip">Tip: Helpful suggestion.</Alert>
        <Alert variant="important">Important: Key information.</Alert>
        <Alert variant="warning">Warning: Be careful.</Alert>
        <Alert variant="caution">Caution: Dangerous action.</Alert>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Custom Titles</h3>
      <div className="space-y-3">
        <Alert variant="note" title="Did you know?">
          Custom titles can make alerts more contextual.
        </Alert>
        <Alert variant="warning" title="Before you proceed">
          Make sure you have saved your work.
        </Alert>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Rich Content</h3>
      <Alert variant="important">
        <p>You can include multiple paragraphs in an alert.</p>
        <p className="mt-2">This allows for more detailed explanations when needed.</p>
      </Alert>
    </div>
  </div>
);

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    variant: "warning",
    title: "Test Warning",
    children: "This is test content",
  },
  render: (args) => <Alert data-testid="test-alert" {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const alert = canvas.getByTestId("test-alert");
    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute("role", "alert");

    const title = canvas.getByText("Test Warning");
    await expect(title).toBeInTheDocument();

    const content = canvas.getByText("This is test content");
    await expect(content).toBeInTheDocument();
  },
};
