import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { FormDialog } from "./form-dialog";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof FormDialog> = {
  title: "Components/FormDialog",
  component: FormDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormDialog>;

export const Default = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Item</Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Create New Item"
        description="Fill in the details below."
        isSubmitting={false}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter name..." />
          </div>
        </div>
        <FormDialog.Footer isSubmitting={false} submitLabel="Create" />
      </FormDialog>
    </>
  );
};

export const WithError = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Submit Form</Button>
      <FormDialog open={open} onOpenChange={setOpen} title="Update Settings" isSubmitting={false}>
        <div className="space-y-4">
          <FormDialog.Error error="Name is required and must be at least 3 characters." />
          <div className="space-y-2">
            <Label htmlFor="setting">Setting</Label>
            <Input id="setting" aria-invalid="true" />
          </div>
        </div>
        <FormDialog.Footer isSubmitting={false} submitLabel="Save" />
      </FormDialog>
    </>
  );
};

export const Submitting = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Submitting State</Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Saving..."
        description="The form is being submitted."
        isSubmitting={true}
      >
        <div className="space-y-2">
          <Label htmlFor="field">Field</Label>
          <Input id="field" value="Some value" disabled />
        </div>
        <FormDialog.Footer isSubmitting={true} submitLabel="Save" />
      </FormDialog>
    </>
  );
};

export const AllStates = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-2">
      <Button onClick={() => setOpen(true)}>Form Dialog</Button>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Create Item"
        description="Enter the item details."
        isSubmitting={false}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Name</Label>
            <Input id="item-name" placeholder="Item name" />
          </div>
        </div>
        <FormDialog.Footer isSubmitting={false} submitLabel="Create" />
      </FormDialog>
    </div>
  );
};

export const OpenCloseTest: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <FormDialog open={open} onOpenChange={setOpen} title="Test Form" isSubmitting={false}>
          <div className="space-y-2">
            <Label htmlFor="test-input">Test</Label>
            <Input id="test-input" />
          </div>
          <FormDialog.Footer isSubmitting={false} submitLabel="Submit" />
        </FormDialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    await expect(screen.getByText("Test Form")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
