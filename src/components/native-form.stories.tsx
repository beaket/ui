import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { RadioGroup } from "./radio";
import { Select } from "./select";
import { Switch } from "./switch";

export default { title: "Integration/Native form", tags: ["!autodocs"] } satisfies Meta;

export const FormDataContract: StoryObj = {
  render: () => (
    <form aria-label="Preferences" className="flex max-w-sm flex-col gap-8">
      <Select name="category" defaultValue="food">
        <Select.Trigger aria-label="Category">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="food">Food</Select.Item>
          <Select.Item value="travel">Travel</Select.Item>
        </Select.Content>
      </Select>
      <Checkbox name="receipts" value="yes" defaultChecked aria-label="Keep receipts" />
      <Checkbox name="disabled" value="yes" defaultChecked disabled aria-label="Disabled choice" />
      <Switch name="alerts" value="yes" defaultChecked aria-label="Enable alerts" />
      <RadioGroup
        name="account"
        defaultValue="personal"
        aria-label="Account type"
        className="gap-8"
      >
        <RadioGroup.Item value="personal" aria-label="Personal" />
        <RadioGroup.Item value="business" aria-label="Business" />
      </RadioGroup>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "Preferences" }) as HTMLFormElement;
    const values = () => Object.fromEntries(new FormData(form));
    await expect(values()).toEqual({
      category: "food",
      receipts: "yes",
      alerts: "yes",
      account: "personal",
    });
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    await userEvent.click(await screen.findByRole("option", { name: "Travel" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Keep receipts" }));
    await userEvent.click(canvas.getByRole("switch", { name: "Enable alerts" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Business" }));
    await waitFor(() => expect(values()).toEqual({ category: "travel", account: "business" }));
  },
};
