import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Navigation } from "./navigation";

const meta: Meta<typeof Navigation> = {
  title: "UI/Navigation",
  component: Navigation,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Default: Story = {
  render: () => (
    <Navigation>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/" active>
            Home
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/docs">Docs</Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/about">About</Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
};

export const NoActiveItem: Story = {
  render: () => (
    <Navigation>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/">Home</Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/docs">Docs</Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/about">About</Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
};

export const ManyItems: Story = {
  render: () => (
    <Navigation>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/" active>
            Home
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/products">Products</Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/services">Services</Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/pricing">Pricing</Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/contact">Contact</Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
};

export const VerticalLayout: Story = {
  render: () => (
    <Navigation>
      <Navigation.List className="w-48 flex-col [&>li+li]:-mt-px [&>li+li]:border-l">
        <Navigation.Item>
          <Navigation.Link href="/" active className="w-full">
            Dashboard
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/settings" className="w-full">
            Settings
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/profile" className="w-full">
            Profile
          </Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
};

// Compositions for docs
export const AllVariants = () => (
  <div className="space-y-6">
    <div>
      <p className="text-fg-muted mb-2 text-xs">Horizontal navigation</p>
      <Navigation>
        <Navigation.List>
          <Navigation.Item>
            <Navigation.Link href="/" active>
              Home
            </Navigation.Link>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Link href="/docs">Docs</Navigation.Link>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Link href="/about">About</Navigation.Link>
          </Navigation.Item>
        </Navigation.List>
      </Navigation>
    </div>
    <div>
      <p className="text-fg-muted mb-2 text-xs">Vertical navigation</p>
      <Navigation>
        <Navigation.List className="w-48 flex-col [&>li+li]:-mt-px [&>li+li]:border-l">
          <Navigation.Item>
            <Navigation.Link href="/" active className="w-full">
              Dashboard
            </Navigation.Link>
          </Navigation.Item>
          <Navigation.Item>
            <Navigation.Link href="/settings" className="w-full">
              Settings
            </Navigation.Link>
          </Navigation.Item>
        </Navigation.List>
      </Navigation>
    </div>
  </div>
);

// Interaction Tests
export const RenderTest: Story = {
  render: () => (
    <Navigation>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/" active>
            Home
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/about">About</Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation");
    const activeLink = canvas.getByRole("link", { name: "Home" });
    const inactiveLink = canvas.getByRole("link", { name: "About" });

    await expect(nav).toBeInTheDocument();
    await expect(activeLink).toHaveAttribute("aria-current", "page");
    await expect(inactiveLink).not.toHaveAttribute("aria-current");
  },
};

export const HoverTest: Story = {
  render: () => (
    <Navigation>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/">Home</Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Home" });

    await userEvent.hover(link);
    await expect(link).toBeInTheDocument();
  },
};
