import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eye, EyeOff, Mail, Search, X } from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Input } from "./input";

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

export const Default: Story = {
  args: {
    placeholder: "Email address",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "john@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Password",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    defaultValue: "Cannot edit this",
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: "Read-only value",
    readOnly: true,
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "invalid@",
    "aria-invalid": true,
  },
};

export const WithPrefix: Story = {
  args: {
    placeholder: "Search...",
    prefix: <Search />,
  },
};

export const WithSuffix: Story = {
  args: {
    placeholder: "Email address",
    suffix: <Mail />,
  },
};

export const WithPrefixAndSuffix: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Input
        placeholder="Search..."
        prefix={<Search />}
        suffix={
          value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="hover:text-ink cursor-pointer"
            >
              <X />
            </button>
          )
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const PasswordToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-ink cursor-pointer"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        }
      />
    );
  },
};

// Compositions for docs
export const AllStates = () => (
  <div className="flex flex-col gap-3">
    <Input placeholder="Enter text..." aria-label="Text input" />
    <div>
      <Input defaultValue="Invalid" aria-invalid="true" aria-label="Invalid input example" />
      <span className="text-signal-red-text mt-1 block text-xs">This field is required</span>
    </div>
    <Input disabled placeholder="Disabled" />
    <Input placeholder="Search" suffix={<Search />} aria-label="Search" />
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

// Interaction Tests
export const TypeTest: Story = {
  args: {
    placeholder: "Type here",
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await userEvent.type(input, "Hello");
    await expect(input).toHaveValue("Hello");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const FocusTest: Story = {
  args: {
    placeholder: "Focus me",
    onFocus: fn(),
    onBlur: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await userEvent.click(input);
    await expect(args.onFocus).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    await expect(args.onBlur).toHaveBeenCalledTimes(1);
  },
};

export const DisabledTest: Story = {
  args: {
    placeholder: "Disabled",
    disabled: true,
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await expect(input).toBeDisabled();
    await userEvent.type(input, "test");
    await expect(input).toHaveValue("");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ClearTest: Story = {
  args: {
    defaultValue: "Clear me",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await expect(input).toHaveValue("Clear me");
    await userEvent.clear(input);
    await expect(input).toHaveValue("");
  },
};
