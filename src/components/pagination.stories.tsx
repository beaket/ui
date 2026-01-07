import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Pagination } from "./pagination";

const meta: Meta<typeof Pagination> = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {
    page: {
      control: { type: "number", min: 1 },
      description: "Current page number (1-indexed)",
    },
    totalPages: {
      control: { type: "number", min: 1 },
      description: "Total number of pages",
    },
    maxPageButtons: {
      control: { type: "number", min: 3 },
      description: "Maximum number of page buttons to show",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Server-side pagination component using links. Works with React Router's Link component for SSR-friendly navigation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const buildPageUrl = (page: number) => `?page=${page}`;

export const Default: Story = {
  args: {
    page: 1,
    totalPages: 10,
    buildPageUrl,
  },
};

export const MiddlePage: Story = {
  args: {
    page: 5,
    totalPages: 10,
    buildPageUrl,
  },
};

export const LastPage: Story = {
  args: {
    page: 10,
    totalPages: 10,
    buildPageUrl,
  },
};

export const FewPages: Story = {
  args: {
    page: 2,
    totalPages: 3,
    buildPageUrl,
  },
};

export const ManyPages: Story = {
  args: {
    page: 15,
    totalPages: 100,
    buildPageUrl,
  },
};

export const SinglePage: Story = {
  args: {
    page: 1,
    totalPages: 1,
    buildPageUrl,
  },
};

export const AllStates = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-medium">First Page</h3>
      <Pagination page={1} totalPages={10} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Middle Page</h3>
      <Pagination page={5} totalPages={10} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Last Page</h3>
      <Pagination page={10} totalPages={10} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Few Pages (3)</h3>
      <Pagination page={2} totalPages={3} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Many Pages with Ellipsis</h3>
      <Pagination page={50} totalPages={100} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Single Page (Hidden)</h3>
      <p className="text-sm text-[var(--steel)]">Pagination is hidden when totalPages = 1</p>
      <Pagination page={1} totalPages={1} buildPageUrl={buildPageUrl} />
    </div>
  </div>
);

export const InteractionTest: Story = {
  args: {
    page: 5,
    totalPages: 10,
    buildPageUrl,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check navigation exists
    const nav = canvas.getByRole("navigation", { name: "Pagination" });
    await expect(nav).toBeInTheDocument();

    // Check current page is marked
    const currentPage = canvas.getByRole("link", { name: "5" });
    await expect(currentPage).toHaveAttribute("aria-current", "page");

    // Check prev/next links exist and have correct hrefs
    const prevLink = canvas.getByRole("link", { name: "Previous page" });
    await expect(prevLink).toHaveAttribute("href", "?page=4");

    const nextLink = canvas.getByRole("link", { name: "Next page" });
    await expect(nextLink).toHaveAttribute("href", "?page=6");

    // Check page links
    const page1 = canvas.getByRole("link", { name: "1" });
    await expect(page1).toHaveAttribute("href", "?page=1");

    const page10 = canvas.getByRole("link", { name: "10" });
    await expect(page10).toHaveAttribute("href", "?page=10");
  },
};

export const FirstPageTest: Story = {
  args: {
    page: 1,
    totalPages: 10,
    buildPageUrl,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Previous button should be disabled (span, not link)
    const prevSpan = canvas.getByLabelText("Previous page");
    await expect(prevSpan.tagName).toBe("SPAN");
    await expect(prevSpan).toHaveAttribute("aria-disabled", "true");

    // Next link should be active
    const nextLink = canvas.getByRole("link", { name: "Next page" });
    await expect(nextLink).toHaveAttribute("href", "?page=2");
  },
};

export const LastPageTest: Story = {
  args: {
    page: 10,
    totalPages: 10,
    buildPageUrl,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Next button should be disabled (span, not link)
    const nextSpan = canvas.getByLabelText("Next page");
    await expect(nextSpan.tagName).toBe("SPAN");
    await expect(nextSpan).toHaveAttribute("aria-disabled", "true");

    // Previous link should be active
    const prevLink = canvas.getByRole("link", { name: "Previous page" });
    await expect(prevLink).toHaveAttribute("href", "?page=9");
  },
};
