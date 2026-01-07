import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { Sheet } from "./sheet";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["left", "right", "top", "bottom"],
      description: "Side from which the sheet slides in",
    },
    preventClose: {
      control: "boolean",
      description: "Prevents closing via ESC or clicking outside",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A slide-out panel that can appear from any edge of the screen. Built on Radix Dialog.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Sheet</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Sheet Title</Sheet.Title>
          <Sheet.Description>
            This is a sheet description that provides additional context.
          </Sheet.Description>
        </Sheet.Header>
        <div className="py-4">
          <p className="text-sm text-[var(--steel)]">Sheet content goes here.</p>
        </div>
        <Sheet.Footer>
          <Sheet.Close>
            <Button variant="outline">Cancel</Button>
          </Sheet.Close>
          <Button>Save</Button>
        </Sheet.Footer>
      </>
    ),
  },
};

export const LeftSide: Story = {
  args: {
    side: "left",
    trigger: <Button>Open Left</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Left Sheet</Sheet.Title>
          <Sheet.Description>This sheet slides in from the left.</Sheet.Description>
        </Sheet.Header>
        <div className="py-4">
          <p className="text-sm text-[var(--steel)]">Navigation menu or sidebar content.</p>
        </div>
      </>
    ),
  },
};

export const TopSide: Story = {
  args: {
    side: "top",
    trigger: <Button>Open Top</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Top Sheet</Sheet.Title>
          <Sheet.Description>This sheet slides in from the top.</Sheet.Description>
        </Sheet.Header>
      </>
    ),
  },
};

export const BottomSide: Story = {
  args: {
    side: "bottom",
    trigger: <Button>Open Bottom</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Bottom Sheet</Sheet.Title>
          <Sheet.Description>This sheet slides in from the bottom.</Sheet.Description>
        </Sheet.Header>
      </>
    ),
  },
};

export const PreventClose: Story = {
  args: {
    preventClose: true,
    trigger: <Button>Open (Cannot dismiss outside)</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Important Action</Sheet.Title>
          <Sheet.Description>
            This sheet cannot be dismissed by clicking outside or pressing ESC.
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Footer>
          <Sheet.Close>
            <Button>Close via button</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </>
    ),
  },
};

function ControlledSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <span className="self-center text-sm text-[var(--steel)]">
          Sheet is {open ? "open" : "closed"}
        </span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Header>
          <Sheet.Title>Controlled Sheet</Sheet.Title>
          <Sheet.Description>This sheet's state is controlled externally.</Sheet.Description>
        </Sheet.Header>
        <Sheet.Footer>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Sheet.Footer>
      </Sheet>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledSheetExample />,
};

export const AllStates = () => (
  <div className="flex flex-wrap gap-4">
    <Sheet trigger={<Button>Right (Default)</Button>}>
      <Sheet.Header>
        <Sheet.Title>Right Sheet</Sheet.Title>
        <Sheet.Description>Default position.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet side="left" trigger={<Button variant="outline">Left</Button>}>
      <Sheet.Header>
        <Sheet.Title>Left Sheet</Sheet.Title>
        <Sheet.Description>Slides from left.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet side="top" trigger={<Button variant="outline">Top</Button>}>
      <Sheet.Header>
        <Sheet.Title>Top Sheet</Sheet.Title>
        <Sheet.Description>Slides from top.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet side="bottom" trigger={<Button variant="outline">Bottom</Button>}>
      <Sheet.Header>
        <Sheet.Title>Bottom Sheet</Sheet.Title>
        <Sheet.Description>Slides from bottom.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button variant="outline">Close</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>

    <Sheet preventClose trigger={<Button variant="stark">Prevent Close</Button>}>
      <Sheet.Header>
        <Sheet.Title>Cannot Dismiss</Sheet.Title>
        <Sheet.Description>Must use buttons to close.</Sheet.Description>
      </Sheet.Header>
      <Sheet.Footer>
        <Sheet.Close>
          <Button>Got it</Button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet>
  </div>
);

export const OpenCloseTest: Story = {
  args: {
    trigger: <Button>Open Sheet</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Test Sheet</Sheet.Title>
        </Sheet.Header>
        <Sheet.Footer>
          <Sheet.Close>
            <Button variant="outline">Close</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open sheet
    const trigger = canvas.getByRole("button", { name: "Open Sheet" });
    await userEvent.click(trigger);

    // Wait for sheet to be visible
    const sheetElement = await screen.findByRole("dialog");
    await expect(sheetElement).toBeInTheDocument();

    // Close sheet via close button
    const closeButton = within(sheetElement).getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);

    // Verify sheet is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const CloseViaXButtonTest: Story = {
  args: {
    trigger: <Button>Open Sheet</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Test Sheet</Sheet.Title>
        </Sheet.Header>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open sheet
    const trigger = canvas.getByRole("button", { name: "Open Sheet" });
    await userEvent.click(trigger);

    // Wait for sheet to be visible
    const sheetElement = await screen.findByRole("dialog");
    await expect(sheetElement).toBeInTheDocument();

    // Close via X button
    const xButton = within(sheetElement).getByRole("button", { name: "Close sheet" });
    await userEvent.click(xButton);

    // Verify sheet is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const PreventCloseTest: Story = {
  args: {
    preventClose: true,
    trigger: <Button>Open Sheet</Button>,
    children: (
      <>
        <Sheet.Header>
          <Sheet.Title>Cannot dismiss by escape</Sheet.Title>
        </Sheet.Header>
        <Sheet.Footer>
          <Sheet.Close>
            <Button>Close via button</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open sheet
    const trigger = canvas.getByRole("button", { name: "Open Sheet" });
    await userEvent.click(trigger);

    // Wait for sheet to be visible
    const sheetElement = await screen.findByRole("dialog");
    await expect(sheetElement).toBeInTheDocument();

    // Try to close with Escape - should not close due to preventClose
    await userEvent.keyboard("{Escape}");

    // Sheet should still be visible
    await expect(screen.queryByRole("dialog")).toBeInTheDocument();

    // Close via button - should work
    const closeButton = within(sheetElement).getByRole("button", { name: "Close via button" });
    await userEvent.click(closeButton);

    // Verify sheet is closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
