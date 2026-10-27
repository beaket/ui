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

// Keyboard path through a submenu: ArrowRight opens it and lands on its first
// row, ArrowLeft closes it and hands focus back to the sub-trigger. A separate
// story so WithSubmenus keeps its visual baseline (play stories are not captured).
export const SubmenuKeyboardTest: Story = {
  tags: ["!autodocs"],
  render: WithSubmenus.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open Menu" }));
    const menu = await screen.findByRole("menu");
    const subTrigger = within(menu).getByRole("menuitem", { name: "Invite users" });
    await expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(subTrigger).toHaveAttribute("aria-expanded", "false");

    subTrigger.focus();
    await expect(subTrigger).toHaveFocus();

    // ArrowRight opens the submenu and moves focus to its first item
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(2));
    await expect(subTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(subTrigger).toHaveAttribute("data-state", "open");
    const email = screen.getByRole("menuitem", { name: "Email" });
    await waitFor(() => expect(email).toHaveFocus());

    // ArrowLeft closes the submenu and returns focus to the sub-trigger
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(screen.getAllByRole("menu")).toHaveLength(1));
    await expect(screen.queryByRole("menuitem", { name: "Email" })).not.toBeInTheDocument();
    await expect(subTrigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(subTrigger).toHaveFocus());

    // The parent menu is still the one open
    await expect(screen.getByRole("menu")).toBe(menu);
  },
};

export const NonModalIsolation: Story = {
  tags: ["!autodocs"],
  render: () => (
    <>
      <button>Background action</button>
      <DropdownMenu modal={false}>
        <DropdownMenu.Trigger>Non-modal menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Non-modal menu" }));
    await screen.findByRole("menu");
    const background = canvas.getByRole("button", { name: "Background action" });
    await expect(background.closest("[inert]")).toBeNull();
    background.focus();
    await expect(background).toHaveFocus();
  },
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

// Controlled mode: the parent owns `open` and hears every change through
// `onOpenChange`, so an outside control can open the menu and the menu's own
// close paths (Escape, selection) report back to that state.
function ControlledExample() {
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState<boolean[]>([]);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open from outside
        </Button>
        <DropdownMenu
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            setChanges((previous) => [...previous, next]);
          }}
        >
          <DropdownMenu.Trigger asChild>
            <Button variant="outline">Controlled Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Item>Settings</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <p className="text-fg-muted text-sm" data-testid="controlled-state">
        {`open: ${open} · onOpenChange: [${changes.join(", ")}]`}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Controlled Menu" });
    const state = canvas.getByTestId("controlled-state");
    await expect(state).toHaveTextContent("open: false · onOpenChange: []");

    // Setting `open` from outside opens the menu without calling onOpenChange
    await userEvent.click(canvas.getByRole("button", { name: "Open from outside" }));
    let menu = await screen.findByRole("menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(state).toHaveTextContent("open: true · onOpenChange: []");

    // Escape asks the parent to close through onOpenChange(false)
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(state).toHaveTextContent("open: false · onOpenChange: [false]");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // The trigger asks the parent to open through onOpenChange(true)
    await userEvent.click(trigger);
    menu = await screen.findByRole("menu");
    await expect(state).toHaveTextContent("open: true · onOpenChange: [false, true]");

    // Selecting an item asks the parent to close through onOpenChange(false)
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Settings" }));
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(state).toHaveTextContent("open: false · onOpenChange: [false, true, false]");
  },
};

// One consolidated test folding the six former per-behavior tests: keyboard
// open, item render, disabled marking, plain-item selection closes, arrow-key
// highlight, Escape closes, and checkbox/radio state persisting across reopen.
function InteractionExample() {
  const [checked, setChecked] = useState(false);
  const [position, setPosition] = useState("one");
  const [activations, setActivations] = useState(0);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => setActivations((count) => count + 1)}>
            Profile
          </DropdownMenu.Item>
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
      <p data-testid="activations">{`Profile activated ${activations} times`}</p>
    </>
  );
}

export const InteractionTest: Story = {
  tags: ["!autodocs"],
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

    // ArrowDown skips the disabled item: the highlight goes from Profile
    // straight to the checkbox, never resting on Disabled
    const disabled = within(menu).getByRole("menuitem", { name: "Disabled" });
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      within(menu).getByRole("menuitemcheckbox", { name: "Toggle Option" }),
    ).toHaveFocus();
    await expect(disabled).not.toHaveFocus();
    await expect(disabled).not.toHaveAttribute("data-highlighted");

    // Escape closes
    await userEvent.keyboard("{Escape}");
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    // Enter activates the highlighted item and closes the menu
    const activations = canvas.getByTestId("activations");
    await expect(activations).toHaveTextContent("Profile activated 0 times");
    await userEvent.keyboard("{Enter}");
    menu = await screen.findByRole("menu");
    await waitFor(() =>
      expect(within(menu).getByRole("menuitem", { name: "Profile" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(activations).toHaveTextContent("Profile activated 1 times");
    await waitFor(() => expect(trigger).toHaveFocus());

    // Space activates the highlighted item and closes the menu
    await userEvent.keyboard("{Enter}");
    menu = await screen.findByRole("menu");
    await waitFor(() =>
      expect(within(menu).getByRole("menuitem", { name: "Profile" })).toHaveFocus(),
    );
    await userEvent.keyboard(" ");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(activations).toHaveTextContent("Profile activated 2 times");

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
