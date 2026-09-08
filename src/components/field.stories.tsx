import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import AllStatesExample from "../examples/field/all-states";
import DefaultExample from "../examples/field/default";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Input } from "./input";
import { RadioGroup } from "./radio";
import { Select } from "./select";
import { Switch } from "./switch";

export default { title: "UI/Field", component: Field, tags: ["autodocs"] } satisfies Meta<
  typeof Field
>;
type Story = StoryObj<typeof Field>;
export const Default: Story = { render: () => <DefaultExample /> };
export const AllStates: Story = { render: () => <AllStatesExample /> };

export const ControlContract: Story = {
  render: () => (
    <div className="max-w-sm space-y-8">
      <Field invalid>
        <div>
          <Field.Label>Email</Field.Label>
        </div>
        <Field.Control>
          <Input />
        </Field.Control>
        <div>
          <Field.Hint>Account email.</Field.Hint>
          <Field.Error>Email is required.</Field.Error>
        </div>
      </Field>
      <Field invalid>
        <Field.Label>Category</Field.Label>
        <Select defaultValue="food">
          <Field.Control>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
          </Field.Control>
          <Select.Content>
            <Select.Item value="food">Food</Select.Item>
          </Select.Content>
        </Select>
        <Field.Hint>Choose a category.</Field.Hint>
        <Field.Error>Category needs review.</Field.Error>
      </Field>
      <Field invalid>
        <Field.Label>Terms</Field.Label>
        <Field.Control>
          <Checkbox />
        </Field.Control>
        <Field.Hint>Read the terms.</Field.Hint>
        <Field.Error>Accept the terms.</Field.Error>
      </Field>
      <Field invalid>
        <Field.Label>Alerts</Field.Label>
        <Field.Control>
          <Switch />
        </Field.Control>
        <Field.Hint>Manage notifications.</Field.Hint>
        <Field.Error>Review alerts.</Field.Error>
      </Field>
      <Field invalid>
        <Field.Label>Account type</Field.Label>
        <Field.Control>
          <RadioGroup defaultValue="personal" className="gap-8">
            <RadioGroup.Item value="personal" aria-label="Personal" />
            <RadioGroup.Item value="business" aria-label="Business" />
          </RadioGroup>
        </Field.Control>
        <Field.Hint>Select an account.</Field.Hint>
        <Field.Error>Review account type.</Field.Error>
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const contracts = [
      ["textbox", "Email", "Account email. Email is required."],
      ["combobox", "Category", "Choose a category. Category needs review."],
      ["checkbox", "Terms", "Read the terms. Accept the terms."],
      ["switch", "Alerts", "Manage notifications. Review alerts."],
      ["radiogroup", "Account type", "Select an account. Review account type."],
    ] as const;
    for (const [role, name, description] of contracts) {
      const control = await canvas.findByRole(role, { name });
      await expect(control).toHaveAttribute("aria-invalid", "true");
      await expect(control).toHaveAccessibleDescription(description);
      const label = canvas.getByText(name, { selector: "label" });
      await expect(label).toHaveAttribute("for", control.id);
    }
    await userEvent.click(canvas.getByText("Email", { selector: "label" }));
    await expect(canvas.getByRole("textbox")).toHaveFocus();
    await userEvent.click(canvas.getByText("Terms", { selector: "label" }));
    await expect(canvas.getByRole("checkbox")).toBeChecked();
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    await expect(await screen.findByRole("option", { name: "Food" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
  },
};

function DynamicExample() {
  const [invalid, setInvalid] = useState(true);
  const [hint, setHint] = useState(true);
  return (
    <div className="max-w-sm space-y-6">
      <p id="field-external">External instructions.</p>
      <Field asChild controlId="field-custom-email" invalid={invalid}>
        <section>
          <Field.Label asChild>
            <label htmlFor="field-custom-email">Email</label>
          </Field.Label>
          <div>
            <Field.Control aria-describedby="field-external">
              <Input />
            </Field.Control>
          </div>
          {hint && <Field.Hint>Private address.</Field.Hint>}
          <Field.Error>Invalid email.</Field.Error>
        </section>
      </Field>
      <button onClick={() => setInvalid(!invalid)}>Toggle error</button>
      <button onClick={() => setHint(!hint)}>Toggle hint</button>
      <Field label="Other email" hint="Separate IDs." error={invalid ? "Also invalid." : undefined}>
        {(id) => <Input id={id} />}
      </Field>
    </div>
  );
}
export const DynamicDescriptions: Story = {
  render: () => <DynamicExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("textbox", { name: "Email" });
    await expect(control.id).toBe("field-custom-email");
    await expect(control).toHaveAccessibleDescription(
      "Private address. Invalid email. External instructions.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Toggle error" }));
    await waitFor(() => expect(control).not.toHaveAttribute("aria-invalid"));
    await expect(control).toHaveAccessibleDescription("Private address. External instructions.");
    await expect(canvas.getByRole("textbox", { name: "Other email" })).not.toHaveAttribute(
      "aria-invalid",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Toggle hint" }));
    await expect(control).toHaveAccessibleDescription("External instructions.");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle hint" }));
    await expect(control).toHaveAccessibleDescription("Private address. External instructions.");
    const ids = [...canvasElement.querySelectorAll("[id]")].map((node) => node.id);
    await expect(new Set(ids).size).toBe(ids.length);
  },
};

export const SsrAssociations: Story = {
  tags: ["!autodocs"],
  render: () => <div data-testid="ssr-host" />,
  play: async ({ canvasElement }) => {
    const tree = (
      <Field invalid>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input />
        </Field.Control>
        <Field.Hint>Account email.</Field.Hint>
        <Field.Error>Email is required.</Field.Error>
      </Field>
    );
    const host = within(canvasElement).getByTestId("ssr-host");
    host.innerHTML = renderToString(tree);

    const control = host.querySelector("[data-slot='field-control']");
    const label = host.querySelector("[data-slot='field-label']");
    const hint = host.querySelector("[data-slot='field-hint']");
    const error = host.querySelector("[data-slot='field-error']");
    expect(control).toHaveAttribute("aria-labelledby", label?.id);
    expect(control).toHaveAttribute("aria-describedby", `${hint?.id} ${error?.id}`);
  },
};
