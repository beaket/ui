import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { ConfirmationDialog } from "./confirmation-dialog";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "Components/ConfirmationDialog",
  component: ConfirmationDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmationDialog>;

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Item
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

export const WithWarning = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete Project
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Project"
        description="This will permanently delete the project and all associated data."
        warning={{
          title: "Irreversible Action",
          message: "All documents, history, and settings will be permanently removed.",
        }}
        confirmLabel="Delete Project"
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

export const PrimaryVariant = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Publish</Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Publish Document"
        description="This will make the document visible to all team members."
        confirmLabel="Publish"
        confirmVariant="primary"
        onConfirm={() => setOpen(false)}
      />
    </>
  );
};

export const AllStates = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  return (
    <div className="flex gap-2">
      <Button variant="destructive" onClick={() => setOpen1(true)}>
        Destructive
      </Button>
      <ConfirmationDialog
        open={open1}
        onOpenChange={setOpen1}
        title="Confirm Delete"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => setOpen1(false)}
      />

      <Button onClick={() => setOpen2(true)}>With Warning</Button>
      <ConfirmationDialog
        open={open2}
        onOpenChange={setOpen2}
        title="Dangerous Action"
        description="Please review carefully."
        warning={{ message: "This will affect all users." }}
        confirmLabel="Proceed"
        onConfirm={() => setOpen2(false)}
      />
    </div>
  );
};

export const OpenCloseTest: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          title="Test Dialog"
          description="Test description"
          confirmLabel="Confirm"
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    await expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    await expect(screen.getByText("Test description")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const ConfirmTest: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    title: "Confirm Action",
    description: "Are you sure?",
    confirmLabel: "Yes, confirm",
    onConfirm: fn(),
  },
  play: async () => {
    const confirmBtn = await screen.findByRole("button", { name: "Yes, confirm" });
    await userEvent.click(confirmBtn);
  },
};
