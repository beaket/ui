import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Navigation } from "./navigation";

const meta: Meta<typeof Navigation> = {
  title: "UI/Navigation",
  component: Navigation,
  tags: ["autodocs"],
};

export default meta;

export const PrefixMatching: Story = {
  render: () => {
    const [value, setValue] = useState("/transactions/new");
    const [showNew, setShowNew] = useState(true);
    return (
      <div>
        <button onClick={() => setValue("/transactions-old")}>Similar segment</button>
        <button onClick={() => setValue("/transactions/123")}>Transaction detail</button>
        <button
          onClick={() => {
            setValue("/transactions/new");
            setShowNew(false);
          }}
        >
          Remove deepest link
        </button>
        <Navigation value={value} match="prefix">
          <Navigation.List>
            <Navigation.Item>
              <Navigation.Link href="/" value="/">
                Home
              </Navigation.Link>
            </Navigation.Item>
            <Navigation.Item>
              <Navigation.Link href="/transactions" value="/transactions">
                Transactions
              </Navigation.Link>
            </Navigation.Item>
            {showNew && (
              <Navigation.Item>
                <Navigation.Link href="/transactions/new" value="/transactions/new">
                  New transaction
                </Navigation.Link>
              </Navigation.Item>
            )}
            <Navigation.Item>
              <Navigation.Link href="/transactions/123" value="/transactions/123" active={false}>
                Explicitly inactive
              </Navigation.Link>
            </Navigation.Item>
          </Navigation.List>
        </Navigation>
        <Navigation
          aria-label="Custom matching"
          value="CUSTOM"
          isActive={(pathname, linkValue) => pathname.toLowerCase() === linkValue}
        >
          <Navigation.Link href="/custom" value="custom">
            Custom route
          </Navigation.Link>
        </Navigation>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Main" });
    await waitFor(() =>
      expect(within(nav).getByRole("link", { name: "New transaction" })).toHaveAttribute(
        "aria-current",
        "page",
      ),
    );
    await expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    await expect(canvas.getByRole("link", { name: "Custom route" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Similar segment" }));
    await expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Transaction detail" }));
    await expect(within(nav).getByRole("link", { name: "Transactions" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      within(nav).getByRole("link", { name: "Explicitly inactive" }),
    ).not.toHaveAttribute("aria-current");
    await userEvent.click(canvas.getByRole("button", { name: "Remove deepest link" }));
    await waitFor(() =>
      expect(within(nav).getByRole("link", { name: "Transactions" })).toHaveAttribute(
        "aria-current",
        "page",
      ),
    );
    await expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  },
};
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

// The root answers "which page is current?" once; each Link derives its own
// state — and an explicit `active` still wins. `asChild` hands the element to
// the consumer's router, injecting nothing of ours into it.
export const RootValueAndAsChildTest: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Navigation value="/docs">
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/" value="/">
            Home
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/docs" value="/docs">
            Docs
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          {/* Explicit `active` overrides the derived answer */}
          <Navigation.Link href="/about" value="/about" active>
            About
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link asChild value="/blog">
            <a href="/blog" data-testid="as-child-link">
              Blog
            </a>
          </Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Derived from the root's value
    await expect(canvas.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");

    // Explicit `active` wins over the derived answer
    await expect(canvas.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // asChild renders the consumer's element, carrying our styling hook…
    const asChild = canvas.getByTestId("as-child-link");
    await expect(asChild).toHaveAttribute("data-slot", "navigation-link");
    await expect(asChild).toHaveAttribute("href", "/blog");

    // …and nothing of ours inside it: the press-travel wrapper is skipped.
    await expect(asChild.querySelector("span")).toBeNull();
    await expect(asChild).toHaveTextContent("Blog");
  },
};

// A Link with an explicit `active` and no root `value` behaves exactly as it
// did before the root gained one — the context is optional, never required.
export const NoRootValueTest: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Navigation>
      <Navigation.List>
        <Navigation.Item>
          <Navigation.Link href="/" active>
            Home
          </Navigation.Link>
        </Navigation.Item>
        <Navigation.Item>
          <Navigation.Link href="/docs" value="/docs">
            Docs
          </Navigation.Link>
        </Navigation.Item>
      </Navigation.List>
    </Navigation>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    // A `value` with nothing to compare against is not current.
    await expect(canvas.getByRole("link", { name: "Docs" })).not.toHaveAttribute("aria-current");
  },
};
