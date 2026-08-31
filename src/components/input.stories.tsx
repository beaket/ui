import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eye, EyeOff, Mail, Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
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
export const AllStates = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <div className="space-y-1.5">
      <Label htmlFor="input-normal">Normal</Label>
      <Input id="input-normal" placeholder="Email address" />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="input-disabled">Disabled</Label>
      <Input id="input-disabled" placeholder="Disabled input" disabled />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="input-readonly">Read-only</Label>
      <Input id="input-readonly" defaultValue="Read-only value" readOnly />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="input-invalid">Invalid</Label>
      <Input id="input-invalid" defaultValue="invalid@" aria-invalid={true} />
      <span className="text-danger-fg text-xs">This field is required</span>
    </div>
  </div>
);

export const AllTypes = () => (
  <div className="flex w-64 flex-col gap-4">
    <Input type="text" placeholder="Text" />
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    <Input type="number" placeholder="Number" />
    <Input type="tel" placeholder="Telephone" />
    <Input type="url" placeholder="URL" />
    <Input type="search" placeholder="Search" />
  </div>
);

// Prefix/suffix slots — static icons and interactive controls (clearable,
// password toggle) all read as one grammar: the affix sits inside the frame,
// the caret stays the only vivid voice.
export const Affixes = () => {
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="input-prefix">Prefix icon</Label>
        <Input id="input-prefix" placeholder="Email address" prefix={<Mail />} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-suffix">Suffix icon</Label>
        <Input id="input-suffix" placeholder="Search..." suffix={<Search />} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-clearable">Clearable (prefix + suffix)</Label>
        <Input
          id="input-clearable"
          placeholder="Search..."
          prefix={<Search />}
          suffix={
            search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-fg focus-visible:outline-border-focus cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-label="Clear"
              >
                <X />
              </button>
            )
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="input-password">Password toggle</Label>
        <Input
          id="input-password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-fg focus-visible:outline-border-focus cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
        />
      </div>
    </div>
  );
};

// One consolidated interaction test — folds typing/onChange, focus/blur,
// disabled no-op, clear, and ref-focus across both render branches (the bare
// <input> and the affix-wrapped <div>). Per-input data-testid because several
// fields share the canvas (and a password field isn't role "textbox").
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
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
