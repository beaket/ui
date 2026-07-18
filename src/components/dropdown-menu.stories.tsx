import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Cloud,
  Code,
  CreditCard,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { DropdownMenu } from "./dropdown-menu";

const meta: Meta<typeof DropdownMenu> = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>My Account</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <User className="size-4" />
          Profile
          <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <CreditCard className="size-4" />
          Billing
          <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Settings className="size-4" />
          Settings
          <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Keyboard className="size-4" />
          Keyboard shortcuts
          <DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <LogOut className="size-4" />
          Log out
          <DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

export const WithSubmenus: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.Label>My Account</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <User className="size-4" />
            Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <CreditCard className="size-4" />
            Billing
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <Settings className="size-4" />
            Settings
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <Users className="size-4" />
            Team
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <UserPlus className="size-4" />
              Invite users
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>
                <Mail className="size-4" />
                Email
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <MessageSquare className="size-4" />
                Message
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                <PlusCircle className="size-4" />
                More...
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Item>
            <Plus className="size-4" />
            New Team
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <Code className="size-4" />
          GitHub
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <LifeBuoy className="size-4" />
          Support
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled>
          <Cloud className="size-4" />
          API
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <LogOut className="size-4" />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

function CheckboxItemsExample() {
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showActivityBar, setShowActivityBar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">View Options</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.Label>Appearance</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
          Status Bar
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
          Activity Bar
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
          Panel
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const WithCheckboxItems: Story = {
  render: () => <CheckboxItemsExample />,
};

function RadioItemsExample() {
  const [position, setPosition] = useState("bottom");

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Panel Position</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.Label>Panel Position</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenu.RadioItem value="top">Top</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="bottom">Bottom</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="right">Right</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const WithRadioItems: Story = {
  render: () => <RadioItemsExample />,
};

export const DestructiveItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Copy (Disabled)</DropdownMenu.Item>
        <DropdownMenu.Item>Paste</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item disabled>Delete (Disabled)</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

export const InsetItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.Item>
          <User className="size-4" />
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item inset>Inset Item (no icon)</DropdownMenu.Item>
        <DropdownMenu.Item>
          <Settings className="size-4" />
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label inset>Inset Label</DropdownMenu.Label>
        <DropdownMenu.Item inset>Another Inset Item</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

export const AllStates = () => (
  <div className="flex flex-wrap gap-4">
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Default</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>View</DropdownMenu.Item>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Item>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">With Icons</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          <User className="size-4" />
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Settings className="size-4" />
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive">
          <LogOut className="size-4" />
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">With Shortcuts</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          Copy
          <DropdownMenu.Shortcut>⌘C</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          Paste
          <DropdownMenu.Shortcut>⌘V</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          Cut
          <DropdownMenu.Shortcut>⌘X</DropdownMenu.Shortcut>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">Disabled Items</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Enabled</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Disabled</DropdownMenu.Item>
        <DropdownMenu.Item>Enabled</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  </div>
);

// The trigger holds its hover state while the menu is open: the accent edge
// stays grown (still pressable, now the active owner of the menu). Left is at
// rest, right is held open — compare the edge.
export const TriggerOpenState = () => (
  <div className="flex items-start gap-16">
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">At rest</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item>Log out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>

    <DropdownMenu defaultOpen>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Held open</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item>Log out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  </div>
);

// Interaction Tests
export const OpenCloseTest: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item>Log out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dropdown
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    const menu = await screen.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Verify menu items are present
    await expect(within(menu).getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    await expect(within(menu).getByRole("menuitem", { name: "Settings" })).toBeInTheDocument();

    // Close with Escape key
    await userEvent.keyboard("{Escape}");

    // Verify menu is closed
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const ItemSelectionTest: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item>Log out</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dropdown
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    const menu = await screen.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Click on an item
    const profileItem = within(menu).getByRole("menuitem", { name: "Profile" });
    await userEvent.click(profileItem);

    // Menu should close after selection
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const KeyboardNavigationTest: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>First</DropdownMenu.Item>
        <DropdownMenu.Item>Second</DropdownMenu.Item>
        <DropdownMenu.Item>Third</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus trigger and open with Enter
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");

    // Wait for menu to be visible
    const menu = await screen.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Navigate with arrow keys
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");

    // Close with Escape
    await userEvent.keyboard("{Escape}");

    // Verify menu is closed
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const DisabledItemTest: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Enabled</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Disabled</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dropdown
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    const menu = await screen.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Verify disabled item has correct attribute
    const disabledItem = within(menu).getByRole("menuitem", { name: "Disabled" });
    await expect(disabledItem).toHaveAttribute("data-disabled");
  },
};

function CheckboxTestExample() {
  const [checked, setChecked] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
          Toggle Option
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const CheckboxItemTest: Story = {
  render: () => <CheckboxTestExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dropdown
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    const menu = await screen.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Find and click checkbox item
    const checkboxItem = within(menu).getByRole("menuitemcheckbox", { name: "Toggle Option" });
    await expect(checkboxItem).toHaveAttribute("aria-checked", "false");
    await userEvent.click(checkboxItem);

    // Re-open menu to verify state
    await userEvent.click(trigger);
    const menuAfter = await screen.findByRole("menu");
    const checkboxItemAfter = within(menuAfter).getByRole("menuitemcheckbox", {
      name: "Toggle Option",
    });
    await expect(checkboxItemAfter).toHaveAttribute("aria-checked", "true");
  },
};

function RadioTestExample() {
  const [value, setValue] = useState("one");

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup value={value} onValueChange={setValue}>
          <DropdownMenu.RadioItem value="one">Option One</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="two">Option Two</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const RadioItemTest: Story = {
  render: () => <RadioTestExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dropdown
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await userEvent.click(trigger);

    // Wait for menu to be visible
    const menu = await screen.findByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Verify initial selection
    const optionOne = within(menu).getByRole("menuitemradio", { name: "Option One" });
    const optionTwo = within(menu).getByRole("menuitemradio", { name: "Option Two" });
    await expect(optionOne).toHaveAttribute("aria-checked", "true");
    await expect(optionTwo).toHaveAttribute("aria-checked", "false");

    // Select option two
    await userEvent.click(optionTwo);

    // Re-open menu to verify state
    await userEvent.click(trigger);
    const menuAfter = await screen.findByRole("menu");
    const optionOneAfter = within(menuAfter).getByRole("menuitemradio", { name: "Option One" });
    const optionTwoAfter = within(menuAfter).getByRole("menuitemradio", { name: "Option Two" });
    await expect(optionOneAfter).toHaveAttribute("aria-checked", "false");
    await expect(optionTwoAfter).toHaveAttribute("aria-checked", "true");
  },
};
