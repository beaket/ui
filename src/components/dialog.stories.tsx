import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Input } from "./input";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    preventClose: {
      control: "boolean",
      description: "Prevents closing via ESC or clicking outside",
    },
    hideCloseButton: {
      control: "boolean",
      description: "Hides the X close button",
    },
    open: {
      control: "boolean",
      description: "Controlled open state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Dialog</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>
            This is a dialog description that provides additional context.
          </Dialog.Description>
        </Dialog.Header>
        <p className="text-fg text-sm">Dialog content goes here. You can put any content inside.</p>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button>Confirm</Button>
        </Dialog.Footer>
      </>
    ),
  },
};

export const PreventClose: Story = {
  args: {
    preventClose: true,
    trigger: <Button>Open (Cannot dismiss by clicking outside)</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Important Action</Dialog.Title>
          <Dialog.Description>
            This dialog cannot be dismissed by pressing ESC or clicking outside.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button variant="destructive">Delete</Button>
        </Dialog.Footer>
      </>
    ),
  },
};

export const HideCloseButton: Story = {
  args: {
    hideCloseButton: true,
    preventClose: true,
    trigger: <Button>Open (No X button)</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Action Required</Dialog.Title>
          <Dialog.Description>
            This dialog has no X button. You must use the action buttons below.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button>Confirm</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </>
    ),
  },
};

export const WithForm: Story = {
  args: {
    trigger: <Button>Edit Profile</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Description>
            Make changes to your profile here. Click save when you're done.
          </Dialog.Description>
        </Dialog.Header>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-fg text-sm font-medium">
              Name
            </label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-fg text-sm font-medium">
              Email
            </label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
        </div>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button>Save changes</Button>
        </Dialog.Footer>
      </>
    ),
  },
};

function ControlledDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <span className="text-fg-muted self-center text-sm">
          Dialog is {open ? "open" : "closed"}
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Header>
          <Dialog.Title>Controlled Dialog</Dialog.Title>
          <Dialog.Description>This dialog's state is controlled externally.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDialogExample />,
};

export const AllStates = () => (
  <div className="flex flex-wrap gap-4">
    <Dialog trigger={<Button>Default</Button>}>
      <Dialog.Header>
        <Dialog.Title>Default Dialog</Dialog.Title>
        <Dialog.Description>A standard dialog with title and description.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="outline">Close</Button>
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog>

    <Dialog trigger={<Button variant="outline">With Form</Button>}>
      <Dialog.Header>
        <Dialog.Title>Form Dialog</Dialog.Title>
        <Dialog.Description>Dialog containing a form.</Dialog.Description>
      </Dialog.Header>
      <div className="py-4">
        <input
          placeholder="Enter something..."
          className="border-border bg-bg h-9 w-full border px-3 text-sm"
        />
      </div>
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="outline">Cancel</Button>
        </Dialog.Close>
        <Button>Submit</Button>
      </Dialog.Footer>
    </Dialog>

    <Dialog preventClose trigger={<Button variant="outline">Prevent Close</Button>}>
      <Dialog.Header>
        <Dialog.Title>Cannot Dismiss</Dialog.Title>
        <Dialog.Description>Must use buttons to close.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          <Button>Got it</Button>
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog>

    <Dialog trigger={<Button variant="destructive">Destructive</Button>}>
      <Dialog.Header>
        <Dialog.Title>Confirm Deletion</Dialog.Title>
        <Dialog.Description>This action is irreversible.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="outline">Cancel</Button>
        </Dialog.Close>
        <Dialog.Close>
          <Button variant="destructive">Delete</Button>
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog>

    <Dialog hideCloseButton preventClose trigger={<Button variant="secondary">No X Button</Button>}>
      <Dialog.Header>
        <Dialog.Title>Action Required</Dialog.Title>
        <Dialog.Description>No X button, must use actions.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          <Button>Acknowledge</Button>
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog>
  </div>
);

// One consolidated test folding the four former per-behavior tests across
// three instances: the default dialog (closes via the X button and via an
// action button), preventClose (Escape is a no-op, action still closes), and
// hideCloseButton (no X button, action still closes).
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <div className="flex gap-2">
      <Dialog trigger={<Button>Open default</Button>}>
        <Dialog.Header>
          <Dialog.Title>Default</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>

      <Dialog preventClose trigger={<Button>Open prevent-close</Button>}>
        <Dialog.Header>
          <Dialog.Title>Prevent close</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Close via button</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>

      <Dialog hideCloseButton trigger={<Button>Open no-X</Button>}>
        <Dialog.Header>
          <Dialog.Title>No X button</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Default dialog: opens on trigger, closes via its X button
    await userEvent.click(canvas.getByRole("button", { name: "Open default" }));
    let dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Close dialog" }));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // ...and via an action button
    await userEvent.click(canvas.getByRole("button", { name: "Open default" }));
    dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // preventClose: Escape is a no-op; the action button still closes
    await userEvent.click(canvas.getByRole("button", { name: "Open prevent-close" }));
    dialog = await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close via button" }));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // hideCloseButton: no X button; the action button closes
    await userEvent.click(canvas.getByRole("button", { name: "Open no-X" }));
    dialog = await screen.findByRole("dialog");
    await expect(
      within(dialog).queryByRole("button", { name: "Close dialog" }),
    ).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
