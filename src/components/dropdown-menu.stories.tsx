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
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./button";
import { DropdownMenu } from "./dropdown-menu";

const meta: Meta<typeof DropdownMenu> = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

// The interactive playground — icons, labels, separators, and shortcuts. Every
// item variant (destructive, disabled, shortcuts) lives in the AllStates
// composition below.
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

// Nested submenus, grouped items, and a disabled item together.
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

// Inset items and labels align their text to the icon column even without an
// icon, so a mixed menu stays on one left edge.
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

// Composition for docs — item variants side by side: plain, icons + a
// destructive row, shortcuts, and disabled items.
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

// The trigger is neutral at rest and grows an accent edge while the menu is
// open (still pressable, now the active owner). Compare the two states.
export const TriggerOpenState: Story = {
  parameters: {
    a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } },
  },
  render: () => (
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
  ),
};

// One consolidated test folding the six former per-behavior tests: keyboard
// open, item render, disabled marking, plain-item selection closes, arrow-key
// highlight, Escape closes, and checkbox/radio state persisting across reopen.
function InteractionExample() {
  const [checked, setChecked] = useState(false);
  const [position, setPosition] = useState("one");

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Profile</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Disabled</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
          Toggle Option
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenu.RadioItem value="one">Option One</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="two">Option Two</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } },
  },
  render: () => <InteractionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open Menu" });

    // Opens on Enter; the first item takes the highlight and the disabled item is marked
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    let menu = await screen.findByRole("menu");
    await waitFor(() =>
      expect(within(menu).getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
        "data-highlighted",
      ),
    );
    await expect(within(menu).getByRole("menuitem", { name: "Profile" })).toHaveFocus();
    await expect(within(menu).getByRole("menuitem", { name: "Disabled" })).toHaveAttribute(
      "data-disabled",
    );

    // Arrow keys move the highlight through the menu
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      within(menu).getByRole("menuitemcheckbox", { name: "Toggle Option" }),
    ).toHaveFocus();

    // Escape closes
    await userEvent.keyboard("{Escape}");
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    // Selecting a plain item closes the menu
    await userEvent.click(trigger);
    menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Profile" }));
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    // Checkbox item toggles and persists across a reopen
    await userEvent.click(trigger);
    menu = await screen.findByRole("menu");
    const checkbox = within(menu).getByRole("menuitemcheckbox", { name: "Toggle Option" });
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await userEvent.click(checkbox);
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    menu = await screen.findByRole("menu");
    await expect(
      within(menu).getByRole("menuitemcheckbox", { name: "Toggle Option" }),
    ).toHaveAttribute("aria-checked", "true");

    // Radio item selects one of the group and persists across a reopen
    const optionTwo = within(menu).getByRole("menuitemradio", { name: "Option Two" });
    await expect(optionTwo).toHaveAttribute("aria-checked", "false");
    await userEvent.click(optionTwo);
    await userEvent.click(trigger);
    menu = await screen.findByRole("menu");
    await expect(within(menu).getByRole("menuitemradio", { name: "Option One" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await expect(within(menu).getByRole("menuitemradio", { name: "Option Two" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  },
};
