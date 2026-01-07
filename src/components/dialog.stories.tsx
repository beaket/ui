import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { Dialog } from "./dialog";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
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
        <p className="text-sm text-[var(--graphite)]">
          Dialog content goes here. You can put any content inside.
        </p>
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
            <label htmlFor="name" className="text-sm font-medium text-[var(--ink)]">
              Name
            </label>
            <input
              id="name"
              defaultValue="John Doe"
              className="h-9 border border-[var(--chrome)] bg-[var(--paper)] px-3 text-sm text-[var(--ink)] placeholder:text-[var(--steel)] focus:ring-2 focus:ring-[var(--signal-blue)] focus:outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              defaultValue="john@example.com"
              className="h-9 border border-[var(--chrome)] bg-[var(--paper)] px-3 text-sm text-[var(--ink)] placeholder:text-[var(--steel)] focus:ring-2 focus:ring-[var(--signal-blue)] focus:outline-none"
            />
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

export const Destructive: Story = {
  args: {
    trigger: <Button variant="destructive">Delete Account</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button variant="destructive">Delete Account</Button>
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
        <span className="self-center text-sm text-[var(--steel)]">
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
          className="h-9 w-full border border-[var(--chrome)] bg-[var(--paper)] px-3 text-sm"
        />
      </div>
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="outline">Cancel</Button>
        </Dialog.Close>
        <Button>Submit</Button>
      </Dialog.Footer>
    </Dialog>

    <Dialog preventClose trigger={<Button variant="stark">Prevent Close</Button>}>
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

// Interaction Tests
export const OpenCloseTest: Story = {
  args: {
    trigger: <Button>Open Dialog</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Test Dialog</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button variant="outline">Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dialog
    const trigger = canvas.getByRole("button", { name: "Open Dialog" });
    await userEvent.click(trigger);

    // Wait for dialog to be visible
    const dialogElement = await screen.findByRole("dialog");
    await expect(dialogElement).toBeInTheDocument();

    // Close dialog via close button
    const closeButton = within(dialogElement).getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);

    // Verify dialog is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const CloseViaXButtonTest: Story = {
  args: {
    trigger: <Button>Open Dialog</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Test Dialog</Dialog.Title>
        </Dialog.Header>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dialog
    const trigger = canvas.getByRole("button", { name: "Open Dialog" });
    await userEvent.click(trigger);

    // Wait for dialog to be visible
    const dialogElement = await screen.findByRole("dialog");
    await expect(dialogElement).toBeInTheDocument();

    // Close via X button
    const xButton = within(dialogElement).getByRole("button", { name: "Close dialog" });
    await userEvent.click(xButton);

    // Verify dialog is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const PreventCloseTest: Story = {
  args: {
    preventClose: true,
    trigger: <Button>Open Dialog</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>Cannot dismiss by escape</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Close via button</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dialog
    const trigger = canvas.getByRole("button", { name: "Open Dialog" });
    await userEvent.click(trigger);

    // Wait for dialog to be visible
    const dialogElement = await screen.findByRole("dialog");
    await expect(dialogElement).toBeInTheDocument();

    // Try to close with Escape - should not close due to preventClose
    await userEvent.keyboard("{Escape}");

    // Dialog should still be visible
    await expect(screen.queryByRole("dialog")).toBeInTheDocument();

    // Close via button - should work
    const closeButton = within(dialogElement).getByRole("button", { name: "Close via button" });
    await userEvent.click(closeButton);

    // Verify dialog is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const HideCloseButtonTest: Story = {
  args: {
    hideCloseButton: true,
    trigger: <Button>Open Dialog</Button>,
    children: (
      <>
        <Dialog.Header>
          <Dialog.Title>No X Button</Dialog.Title>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close>
            <Button>Close</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dialog
    const trigger = canvas.getByRole("button", { name: "Open Dialog" });
    await userEvent.click(trigger);

    // Wait for dialog to be visible
    const dialogElement = await screen.findByRole("dialog");
    await expect(dialogElement).toBeInTheDocument();

    // Verify X button does not exist
    const xButton = within(dialogElement).queryByRole("button", { name: "Close dialog" });
    await expect(xButton).not.toBeInTheDocument();

    // Close via action button - should work
    const closeButton = within(dialogElement).getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);

    // Verify dialog is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
