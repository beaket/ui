import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { useRef } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import InputAffixesExample from "../examples/input/affixes";
import InputAllStatesExample from "../examples/input/all-states";
import InputAllTypesExample from "../examples/input/all-types";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
    readOnly: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// The interactive playground — pick any type/state via Controls. Per-state and
// per-type examples live in the AllStates/AllTypes/Affixes compositions below
// (also what the docs site renders).
export const Default: Story = {
  args: {
    placeholder: "Email address",
  },
};

// Compositions for docs
export const AllStates = () => <InputAllStatesExample />;
export const AllTypes = () => <InputAllTypesExample />;
export const Affixes = () => <InputAffixesExample />;

// One consolidated interaction test — folds typing/onChange, focus/blur,
// disabled no-op, clear, and ref-focus across both render branches (the bare
// <input> and the affix-wrapped <div>). Per-input data-testid because several
// fields share the canvas (and a password field isn't role "textbox").
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  args: { onChange: fn(), onFocus: fn(), onBlur: fn() },
  render: (args) => {
    const bareRef = useRef<HTMLInputElement>(null);
    const prefixRef = useRef<HTMLInputElement>(null);
    return (
      <div className="flex flex-col gap-4">
        <Input
          data-testid="basic-input"
          placeholder="Type here"
          onChange={args.onChange}
          onFocus={args.onFocus}
          onBlur={args.onBlur}
        />
        <Input data-testid="disabled-input" placeholder="Disabled" disabled />
        <Input data-testid="clear-input" defaultValue="Clear me" aria-label="Clearable" />
        <div className="flex items-center gap-2">
          <Input ref={bareRef} data-testid="ref-input" placeholder="Ref (bare)" />
          <button
            type="button"
            data-testid="focus-bare"
            onClick={() => bareRef.current?.focus()}
            className="border-border-strong focus-visible:outline-border-focus border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Focus
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            ref={prefixRef}
            data-testid="ref-prefix-input"
            placeholder="Ref (prefix)"
            prefix={<Search />}
          />
          <button
            type="button"
            data-testid="focus-prefix"
            onClick={() => prefixRef.current?.focus()}
            className="border-border-strong focus-visible:outline-border-focus border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Focus
          </button>
        </div>
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Type + onChange, then focus/blur
    const basic = canvas.getByTestId("basic-input");
    await userEvent.type(basic, "Hello");
    await expect(basic).toHaveValue("Hello");
    await expect(args.onChange).toHaveBeenCalled();
    await expect(args.onFocus).toHaveBeenCalled();
    await userEvent.tab();
    await expect(args.onBlur).toHaveBeenCalled();

    // Disabled is a no-op
    const disabled = canvas.getByTestId("disabled-input");
    await expect(disabled).toBeDisabled();
    await userEvent.type(disabled, "nope");
    await expect(disabled).toHaveValue("");

    // Clear
    const clearable = canvas.getByTestId("clear-input");
    await expect(clearable).toHaveValue("Clear me");
    await userEvent.clear(clearable);
    await expect(clearable).toHaveValue("");

    // Ref-focus — bare <input> branch
    const refBare = canvas.getByTestId("ref-input");
    await expect(refBare).not.toHaveFocus();
    await userEvent.click(canvas.getByTestId("focus-bare"));
    await expect(refBare).toHaveFocus();

    // Ref-focus — affix-wrapped <div> branch
    const refPrefix = canvas.getByTestId("ref-prefix-input");
    await expect(refPrefix).not.toHaveFocus();
    await userEvent.click(canvas.getByTestId("focus-prefix"));
    await expect(refPrefix).toHaveFocus();
  },
};
