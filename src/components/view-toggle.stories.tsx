import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ViewToggle } from "./view-toggle";

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const items = [
  { value: "grid" as const, icon: <GridIcon />, label: "Grid view" },
  { value: "list" as const, icon: <ListIcon />, label: "List view" },
];

const meta: Meta<typeof ViewToggle> = {
  title: "Components/ViewToggle",
  component: ViewToggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ViewToggle>;

export const Default = () => {
  const [value, setValue] = useState<"grid" | "list">("grid");
  return <ViewToggle value={value} onChange={setValue} items={items} />;
};

export const ListSelected = () => {
  const [value, setValue] = useState<"grid" | "list">("list");
  return <ViewToggle value={value} onChange={setValue} items={items} />;
};

export const AllStates = () => {
  const [value, setValue] = useState<"grid" | "list">("grid");
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-steel mb-2 text-xs font-medium">Interactive</p>
        <ViewToggle value={value} onChange={setValue} items={items} />
        <p className="text-steel mt-1 text-xs">Selected: {value}</p>
      </div>
    </div>
  );
};

export const ClickTest: Story = {
  args: {
    value: "grid",
    onChange: fn(),
    items,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const listBtn = canvas.getByRole("button", { name: "List view" });

    await userEvent.click(listBtn);
    await expect(args.onChange).toHaveBeenCalledWith("list");
  },
};
