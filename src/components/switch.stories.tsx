import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Label } from "./label";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A toggle switch component for binary on/off states. Built on Radix UI Switch primitive with full keyboard navigation and accessibility support.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    defaultChecked: false,
    disabled: false,
    size: "md",
    "aria-label": "Toggle switch",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Switch size="sm" defaultChecked aria-label="Small switch" />
        <span className="text-steel text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="md" defaultChecked aria-label="Medium switch" />
        <span className="text-steel text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="lg" defaultChecked aria-label="Large switch" />
        <span className="text-steel text-xs">Large</span>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch defaultChecked={false} aria-label="Unchecked switch" />
        <span className="text-sm">Unchecked</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch defaultChecked={true} aria-label="Checked switch" />
        <span className="text-sm">Checked</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch disabled aria-label="Disabled unchecked switch" />
        <span className="text-sm">Disabled (unchecked)</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch disabled defaultChecked={true} aria-label="Disabled checked switch" />
        <span className="text-sm">Disabled (checked)</span>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => {
    const ControlledSwitch = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch id="airplane-mode" checked={checked} onCheckedChange={setChecked} />
            <Label htmlFor="airplane-mode" className="cursor-pointer">
              Airplane mode
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="wifi" defaultChecked />
            <Label htmlFor="wifi" className="cursor-pointer">
              Wi-Fi
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="bluetooth" disabled />
            <Label htmlFor="bluetooth" className="cursor-pointer opacity-50">
              Bluetooth (disabled)
            </Label>
          </div>
        </div>
      );
    };
    return <ControlledSwitch />;
  },
};

export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [enabled, setEnabled] = useState(false);
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Notifications toggle"
            />
            <span className="text-sm">Notifications are {enabled ? "enabled" : "disabled"}</span>
          </div>
        </div>
      );
    };
    return <ControlledExample />;
  },
};

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: { onCheckedChange: fn() },
  render: (args) => (
    <div className="flex gap-3">
      <Switch
        data-testid="basic-switch"
        aria-label="Basic toggle"
        onCheckedChange={args.onCheckedChange}
      />
      <Switch
        data-testid="checked-switch"
        aria-label="Checked toggle"
        defaultChecked={true}
        onCheckedChange={args.onCheckedChange}
      />
      <Switch
        data-testid="disabled-switch"
        aria-label="Disabled toggle"
        disabled
        onCheckedChange={args.onCheckedChange}
      />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Basic toggle functionality
    const basicSwitch = canvas.getByTestId("basic-switch");
    await userEvent.click(basicSwitch);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Test 2: Toggle checked switch to unchecked
    const checkedSwitch = canvas.getByTestId("checked-switch");
    await userEvent.click(checkedSwitch);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(false);

    // Test 3: Verify disabled switch is not clickable
    const disabledSwitch = canvas.getByTestId("disabled-switch");
    await userEvent.click(disabledSwitch);
    // Should still be 2, not incremented
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);

    // Test 4: Keyboard interaction (Space key)
    basicSwitch.focus();
    await userEvent.keyboard(" ");
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(3);
  },
};
