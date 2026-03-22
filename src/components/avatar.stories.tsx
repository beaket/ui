import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Avatar } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
      <Avatar.Fallback>BK</Avatar.Fallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <Avatar.Image src="/broken-image.jpg" alt="User" />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <Avatar.Fallback>AB</Avatar.Fallback>
    </Avatar>
  ),
};

export const WithShadow: Story = {
  render: () => (
    <Avatar shadow>
      <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
      <Avatar.Fallback>BK</Avatar.Fallback>
    </Avatar>
  ),
};

// Compositions for docs
export const AllStates = () => (
  <div className="flex items-center gap-4">
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
        <Avatar.Fallback>BK</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">With Image</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">Fallback</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>A</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">Single Letter</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar shadow>
        <Avatar.Fallback>SH</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">Shadow</span>
    </div>
  </div>
);

export const CustomSizes = () => (
  <div className="flex items-end gap-4">
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-6">
        <Avatar.Fallback className="text-xs">XS</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">24px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-8">
        <Avatar.Fallback className="text-sm">SM</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">32px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar>
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">40px (default)</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-12">
        <Avatar.Fallback className="text-lg">LG</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">48px</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Avatar className="size-16">
        <Avatar.Fallback className="text-xl">XL</Avatar.Fallback>
      </Avatar>
      <span className="text-steel text-xs">64px</span>
    </div>
  </div>
);

export const AvatarGroup = () => (
  <div className="flex gap-2">
    <Avatar>
      <Avatar.Fallback>BK</Avatar.Fallback>
    </Avatar>
    <Avatar>
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
    <Avatar>
      <Avatar.Fallback>AB</Avatar.Fallback>
    </Avatar>
    <Avatar>
      <Avatar.Fallback>+3</Avatar.Fallback>
    </Avatar>
  </div>
);

// Interaction Tests
export const RenderTest: Story = {
  render: () => (
    <Avatar>
      <Avatar.Fallback>TT</Avatar.Fallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByText("TT");

    await expect(fallback).toBeInTheDocument();
  },
};

export const FallbackTest: Story = {
  render: () => (
    <Avatar>
      <Avatar.Image src="/broken-image.jpg" alt="User" />
      <Avatar.Fallback>FB</Avatar.Fallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // When image fails to load, fallback should be visible
    const fallback = canvas.getByText("FB");

    await expect(fallback).toBeInTheDocument();
  },
};

export const ShadowTest: Story = {
  render: () => (
    <Avatar shadow>
      <Avatar.Fallback>SH</Avatar.Fallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByText("SH").closest("[data-slot='avatar']");

    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveClass("shadow-offset");
  },
};

export const DataSlotTest: Story = {
  render: () => (
    <Avatar>
      <Avatar.Fallback>DS</Avatar.Fallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByText("DS").closest("[data-slot='avatar']");

    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveAttribute("data-slot", "avatar");
  },
};
