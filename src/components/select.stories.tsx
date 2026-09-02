import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Label } from "./label";
import { Select } from "./select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A dropdown select component built on Radix UI primitives. Supports grouped options, validation states, and controlled/uncontrolled modes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <div className="w-full">
      <Select>
        <Select.Trigger aria-label="Select a fruit">
          <Select.Value placeholder="Select a fruit" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="orange">Orange</Select.Item>
          <Select.Item value="grape">Grape</Select.Item>
        </Select.Content>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div className="max-w-sm space-y-1.5">
      <Label htmlFor="select-with-groups">Food category</Label>
      <Select>
        <Select.Trigger id="select-with-groups">
          <Select.Value placeholder="Select food" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Fruits</Select.Label>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>Vegetables</Select.Label>
            <Select.Item value="carrot">Carrot</Select.Item>
            <Select.Item value="potato">Potato</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="select-normal">Normal</Label>
        <Select>
          <Select.Trigger id="select-normal">
            <Select.Value placeholder="Normal select" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="1">Option 1</Select.Item>
            <Select.Item value="2">Option 2</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="select-disabled">Disabled</Label>
        <Select disabled>
          <Select.Trigger id="select-disabled">
            <Select.Value placeholder="Disabled select" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="1">Option 1</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="select-invalid">Invalid</Label>
        <Select>
          <Select.Trigger id="select-invalid" aria-invalid={true}>
            <Select.Value placeholder="Invalid select" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="1">Option 1</Select.Item>
          </Select.Content>
        </Select>
      </div>
    </div>
  ),
};

export const LongList: Story = {
  render: () => (
    <div className="max-w-sm">
      <Select>
        <Select.Trigger aria-label="Select a country">
          <Select.Value placeholder="Select a country" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="us">United States</Select.Item>
          <Select.Item value="uk">United Kingdom</Select.Item>
          <Select.Item value="ca">Canada</Select.Item>
          <Select.Item value="au">Australia</Select.Item>
          <Select.Item value="nz">New Zealand</Select.Item>
          <Select.Item value="jp">Japan</Select.Item>
          <Select.Item value="kr">South Korea</Select.Item>
          <Select.Item value="cn">China</Select.Item>
          <Select.Item value="de">Germany</Select.Item>
          <Select.Item value="fr">France</Select.Item>
          <Select.Item value="it">Italy</Select.Item>
          <Select.Item value="es">Spain</Select.Item>
        </Select.Content>
      </Select>
    </div>
  ),
};

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
    a11y: {
      config: {
        rules: [{ id: "aria-hidden-focus", enabled: false }],
      },
    },
  },
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <div className="max-w-sm">
      <Label htmlFor="test-basic-select" className="sr-only">
        Basic select
      </Label>
      <Select {...args} defaultValue="apple">
        <Select.Trigger
          id="test-basic-select"
          data-testid="basic-select"
          aria-label="Select a fruit"
        >
          <Select.Value placeholder="Select a fruit" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="orange">Orange</Select.Item>
        </Select.Content>
      </Select>
      <Select disabled>
        <Select.Trigger aria-label="Disabled select">
          <Select.Value placeholder="Disabled select" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="disabled">Disabled option</Select.Item>
        </Select.Content>
      </Select>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const basicTrigger = canvas.getByTestId("basic-select");
    basicTrigger.focus();
    await userEvent.keyboard("{Enter}");

    // Select content is portaled, so search in document body
    const listbox = await body.findByRole("listbox");
    const bananaOption = within(listbox).getByRole("option", { name: "Banana" });

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onValueChange).toHaveBeenCalledWith("banana");
    await expect(basicTrigger).toHaveFocus();

    const disabledTrigger = canvas.getByRole("combobox", { name: "Disabled select" });
    await expect(disabledTrigger).toBeDisabled();
    await userEvent.click(disabledTrigger);
    await expect(body.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

// Radix representative: the open owner keeps an offset edge while keyboard
// navigation marks the current option with an inset rule. Both can exist at
// once because they describe different targets in different channels.
export const StatePrecedenceTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } },
  },
  render: () => (
    <div className="max-w-sm">
      <Select defaultValue="apple">
        <Select.Trigger aria-label="Precedence select">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
        </Select.Content>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    const listbox = await within(document.body).findByRole("listbox");
    const activeOption = within(listbox).getByRole("option", { name: "Apple" });
    await expect(trigger).toHaveAttribute("data-state", "open");
    await expect(activeOption).toHaveAttribute("data-highlighted");

    await expect(trigger.className).toContain("data-[state=open]:shadow-offset-action-hover");
    await expect(activeOption.className).toContain(
      "data-[highlighted]:shadow-[inset_2px_0_0_0_var(--color-accent-solid)]",
    );
  },
};
