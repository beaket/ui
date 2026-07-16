import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "./button";
import { Card } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A versatile container component for grouping related content and actions. Uses a compound component pattern with Header, Title, Description, Action, Content, and Footer sub-components.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>Card description text goes here.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">
          This is the card content. You can put any content here.
        </p>
      </Card.Content>
      <Card.Footer>
        <Button>Action</Button>
      </Card.Footer>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Card.Header>
        <Card.Title>Project Settings</Card.Title>
        <Card.Description>Manage your project configuration.</Card.Description>
        <Card.Action>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">
          Configure project name, description, and visibility settings.
        </p>
      </Card.Content>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Card.Content>
        <p className="text-sm">A simple card with only content, no header or footer.</p>
      </Card.Content>
    </Card>
  ),
};

export const AllStates = () => (
  <div className="grid max-w-2xl gap-6">
    <Card>
      <Card.Header>
        <Card.Title>Basic Card</Card.Title>
        <Card.Description>A simple card with header and content.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">Card content goes here.</p>
      </Card.Content>
    </Card>

    <Card>
      <Card.Header>
        <Card.Title>With Footer</Card.Title>
        <Card.Description>Card with action buttons in footer.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">Some content here.</p>
      </Card.Content>
      <Card.Footer>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </Card.Footer>
    </Card>

    <Card>
      <Card.Header>
        <Card.Title>With Action Button</Card.Title>
        <Card.Description>Header contains an action button.</Card.Description>
        <Card.Action>
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">Content with header action.</p>
      </Card.Content>
    </Card>

    <Card>
      <Card.Header className="border-border border-b">
        <Card.Title>With Bordered Header</Card.Title>
        <Card.Description>The header has a bottom border.</Card.Description>
      </Card.Header>
      <Card.Content>
        <p className="text-fg-muted text-sm">Content below bordered header.</p>
      </Card.Content>
    </Card>
  </div>
);

export const InteractionTest: Story = {
  render: () => (
    <Card className="max-w-sm" data-testid="test-card">
      <Card.Header>
        <Card.Title data-testid="card-title">Test Title</Card.Title>
        <Card.Description data-testid="card-description">Test description</Card.Description>
      </Card.Header>
      <Card.Content data-testid="card-content">
        <p>Test content</p>
      </Card.Content>
      <Card.Footer data-testid="card-footer">
        <Button>Test Action</Button>
      </Card.Footer>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const card = canvas.getByTestId("test-card");
    await expect(card).toBeInTheDocument();

    const title = canvas.getByTestId("card-title");
    await expect(title).toHaveTextContent("Test Title");

    const description = canvas.getByTestId("card-description");
    await expect(description).toHaveTextContent("Test description");

    const content = canvas.getByTestId("card-content");
    await expect(content).toHaveTextContent("Test content");

    const footer = canvas.getByTestId("card-footer");
    await expect(footer).toBeInTheDocument();
  },
};
