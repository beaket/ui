import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, within } from "storybook/test";
import { Tabs } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A set of layered sections of content, known as tab panels, that display one panel at a time.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="max-w-md">
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <div className="p-4">
          <h3 className="font-medium">Account Settings</h3>
          <p className="text-fg-muted mt-2 text-sm">
            Manage your account settings and preferences.
          </p>
        </div>
      </Tabs.Content>
      <Tabs.Content value="password">
        <div className="p-4">
          <h3 className="font-medium">Password Settings</h3>
          <p className="text-fg-muted mt-2 text-sm">Update your password and security settings.</p>
        </div>
      </Tabs.Content>
    </Tabs>
  ),
};

export const MultipleTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="max-w-lg">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
        <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">
        <div className="text-fg-muted p-4 text-sm">Overview content</div>
      </Tabs.Content>
      <Tabs.Content value="analytics">
        <div className="text-fg-muted p-4 text-sm">Analytics content</div>
      </Tabs.Content>
      <Tabs.Content value="reports">
        <div className="text-fg-muted p-4 text-sm">Reports content</div>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <div className="text-fg-muted p-4 text-sm">Settings content</div>
      </Tabs.Content>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="active" className="max-w-md">
      <Tabs.List>
        <Tabs.Trigger value="active">Active</Tabs.Trigger>
        <Tabs.Trigger value="disabled" disabled>
          Disabled
        </Tabs.Trigger>
        <Tabs.Trigger value="another">Another</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="active">
        <div className="text-fg-muted p-4 text-sm">This tab is active.</div>
      </Tabs.Content>
      <Tabs.Content value="disabled">
        <div className="text-fg-muted p-4 text-sm">You cannot see this.</div>
      </Tabs.Content>
      <Tabs.Content value="another">
        <div className="text-fg-muted p-4 text-sm">Another tab content.</div>
      </Tabs.Content>
    </Tabs>
  ),
};

export const AllStates = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-medium">Two Tabs</h3>
      <Tabs defaultValue="tab1" className="max-w-sm">
        <Tabs.List>
          <Tabs.Trigger value="tab1">First</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <div className="text-fg-muted p-4 text-sm">First tab content</div>
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <div className="text-fg-muted p-4 text-sm">Second tab content</div>
        </Tabs.Content>
      </Tabs>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">With Disabled Tab</h3>
      <Tabs defaultValue="enabled1" className="max-w-md">
        <Tabs.List>
          <Tabs.Trigger value="enabled1">Enabled</Tabs.Trigger>
          <Tabs.Trigger value="disabled" disabled>
            Disabled
          </Tabs.Trigger>
          <Tabs.Trigger value="enabled2">Also Enabled</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="enabled1">
          <div className="text-fg-muted p-4 text-sm">First enabled tab</div>
        </Tabs.Content>
        <Tabs.Content value="enabled2">
          <div className="text-fg-muted p-4 text-sm">Second enabled tab</div>
        </Tabs.Content>
      </Tabs>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Many Tabs</h3>
      <Tabs defaultValue="t1" className="max-w-lg">
        <Tabs.List>
          <Tabs.Trigger value="t1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="t2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="t3">Tab 3</Tabs.Trigger>
          <Tabs.Trigger value="t4">Tab 4</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="t1">
          <div className="text-fg-muted p-4 text-sm">Content 1</div>
        </Tabs.Content>
        <Tabs.Content value="t2">
          <div className="text-fg-muted p-4 text-sm">Content 2</div>
        </Tabs.Content>
        <Tabs.Content value="t3">
          <div className="text-fg-muted p-4 text-sm">Content 3</div>
        </Tabs.Content>
        <Tabs.Content value="t4">
          <div className="text-fg-muted p-4 text-sm">Content 4</div>
        </Tabs.Content>
      </Tabs>
    </div>
  </div>
);

export const InteractionTest: Story = {
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <Tabs defaultValue="first" className="max-w-md" {...args}>
      <Tabs.List>
        <Tabs.Trigger value="first">First</Tabs.Trigger>
        <Tabs.Trigger value="second">Second</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="first">
        <div className="p-4" data-testid="first-content">
          First content
        </div>
      </Tabs.Content>
      <Tabs.Content value="second">
        <div className="p-4" data-testid="second-content">
          Second content
        </div>
      </Tabs.Content>
    </Tabs>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially first tab is active
    await expect(canvas.getByTestId("first-content")).toBeVisible();

    // Click second tab
    const secondTab = canvas.getByRole("tab", { name: "Second" });
    await userEvent.click(secondTab);

    // Verify callback was called
    await expect(args.onValueChange).toHaveBeenCalledWith("second");

    // Verify content changed
    await expect(canvas.getByTestId("second-content")).toBeVisible();
  },
};

export const DisabledTabTest: Story = {
  render: () => (
    <Tabs defaultValue="first" className="max-w-md">
      <Tabs.List>
        <Tabs.Trigger value="first">First</Tabs.Trigger>
        <Tabs.Trigger value="disabled" disabled>
          Disabled
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="first">
        <div className="p-4" data-testid="first-content">
          First content
        </div>
      </Tabs.Content>
      <Tabs.Content value="disabled">
        <div className="p-4" data-testid="disabled-content">
          Disabled content
        </div>
      </Tabs.Content>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const disabledTab = canvas.getByRole("tab", { name: "Disabled" });
    await expect(disabledTab).toBeDisabled();
  },
};
