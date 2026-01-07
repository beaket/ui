import type { Meta, StoryObj } from "@storybook/react-vite";
import { Package } from "lucide-react";
import { expect, within } from "storybook/test";
import { BlankSlate } from "./blank-slate";
import { Button } from "./button";

const meta: Meta<typeof BlankSlate> = {
  title: "UI/BlankSlate",
  component: BlankSlate,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: [
        undefined,
        "inbox",
        "alert-circle",
        "search",
        "file-question",
        "folder-open",
        "users",
      ],
      description: "Icon to display above the title",
    },
    title: {
      control: "text",
      description: "Main heading text",
    },
    description: {
      control: "text",
      description: "Supporting description text",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "An empty state component for displaying placeholder content when there is no data to show.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BlankSlate>;

export const Default: Story = {
  args: {
    icon: "inbox",
    title: "No messages",
    description: "You don't have any messages yet. Start a conversation!",
  },
};

export const WithAction: Story = {
  args: {
    icon: "inbox",
    title: "No messages",
    description: "You don't have any messages yet.",
  },
  render: (args) => (
    <BlankSlate {...args}>
      <Button>Create New</Button>
    </BlankSlate>
  ),
};

export const WithMultipleActions: Story = {
  args: {
    icon: "file-question",
    title: "No documents found",
    description: "There are no documents matching your search criteria.",
  },
  render: (args) => (
    <BlankSlate {...args}>
      <Button variant="outline">Clear Filters</Button>
      <Button>Upload Document</Button>
    </BlankSlate>
  ),
};

export const SearchEmpty: Story = {
  args: {
    icon: "search",
    title: "No results found",
    description: "Try adjusting your search terms or filters.",
  },
};

export const FolderEmpty: Story = {
  args: {
    icon: "folder-open",
    title: "This folder is empty",
    description: "Upload files or create new documents to get started.",
  },
};

export const UsersEmpty: Story = {
  args: {
    icon: "users",
    title: "No team members",
    description: "Invite people to collaborate on this project.",
  },
};

export const ErrorState: Story = {
  args: {
    icon: "alert-circle",
    title: "Something went wrong",
    description: "We couldn't load your data. Please try again later.",
  },
  render: (args) => (
    <BlankSlate {...args}>
      <Button variant="outline">Retry</Button>
    </BlankSlate>
  ),
};

export const WithoutIcon: Story = {
  args: {
    title: "Getting started",
    description: "Complete the steps below to set up your workspace.",
  },
};

export const CustomIcon: Story = {
  args: {
    icon: Package,
    title: "No packages",
    description: "You haven't added any packages to your project yet.",
  },
};

export const AllStates = () => (
  <div className="space-y-12">
    <div>
      <h3 className="mb-4 text-sm font-medium">With Icon Presets</h3>
      <div className="grid gap-8 md:grid-cols-2">
        <BlankSlate icon="inbox" title="No messages" description="Your inbox is empty." />
        <BlankSlate icon="search" title="No results" description="Try different search terms." />
        <BlankSlate
          icon="folder-open"
          title="Empty folder"
          description="No files in this folder."
        />
        <BlankSlate icon="users" title="No members" description="Invite people to join." />
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Actions</h3>
      <BlankSlate
        icon="file-question"
        title="No documents"
        description="Create your first document to get started."
      >
        <Button>Create Document</Button>
      </BlankSlate>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Error State</h3>
      <BlankSlate
        icon="alert-circle"
        title="Failed to load"
        description="There was an error loading the content."
      >
        <Button variant="outline">Retry</Button>
      </BlankSlate>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Without Icon</h3>
      <BlankSlate title="Welcome" description="Get started by exploring the features below." />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Custom Icon</h3>
      <BlankSlate icon={Package} title="No packages" description="Add packages to your project." />
    </div>
  </div>
);

export const InteractionTest: Story = {
  args: {
    icon: "inbox",
    title: "Test Title",
    description: "Test description text",
  },
  render: (args) => (
    <BlankSlate data-testid="blank-slate" {...args}>
      <Button data-testid="action-button">Action</Button>
    </BlankSlate>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check title is rendered
    const title = canvas.getByRole("heading", { name: "Test Title" });
    await expect(title).toBeInTheDocument();

    // Check description is rendered
    const description = canvas.getByText("Test description text");
    await expect(description).toBeInTheDocument();

    // Check action button is rendered
    const button = canvas.getByTestId("action-button");
    await expect(button).toBeInTheDocument();
  },
};
