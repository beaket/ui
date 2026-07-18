import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
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
          "Pagination component supporting both link and button modes. Use link mode for SSR-friendly navigation, button mode for client-side pagination.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const buildPageUrl = (page: number) => `?page=${page}`;

// The interactive playground — set page/totalPages/maxPageButtons via Controls.
// Every position (first/middle/last, few/many, single, button mode) is shown
// together in AllStates below; ButtonMode is the interactive client-side demo.
export const Default: Story = {
  args: {
    page: 1,
    totalPages: 10,
    buildPageUrl,
  },
};

// Compositions for docs
export const AllStates = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-4 text-sm font-medium">First Page (Link Mode)</h3>
      <Pagination page={1} totalPages={10} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Middle Page (Link Mode)</h3>
      <Pagination page={5} totalPages={10} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Last Page (Link Mode)</h3>
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
      <p className="text-fg-muted text-sm">Pagination is hidden when totalPages = 1</p>
      <Pagination page={1} totalPages={1} buildPageUrl={buildPageUrl} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Button Mode — First Page</h3>
      <Pagination mode="button" page={1} totalPages={10} onPageChange={() => {}} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Button Mode — Middle Page</h3>
      <Pagination mode="button" page={5} totalPages={10} onPageChange={() => {}} />
    </div>

    <div>
      <h3 className="mb-4 text-sm font-medium">Button Mode — Last Page</h3>
      <Pagination mode="button" page={10} totalPages={10} onPageChange={() => {}} />
    </div>
  </div>
);

const ButtonModeWrapper = ({ initialPage = 1, totalPages = 10 }) => {
  const [page, setPage] = useState(initialPage);
  return (
    <div className="space-y-2">
      <p className="text-fg-muted text-sm" data-testid="page-info">
        Page {page} of {totalPages}
      </p>
      <Pagination mode="button" page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

// Button mode — client-side pagination you can click through.
export const ButtonMode = {
  render: () => <ButtonModeWrapper initialPage={3} totalPages={10} />,
};

// One consolidated test — folds the link-mode edges (first/middle/last: current
// marker, prev/next hrefs, disabled-as-span) and the button-mode click-through
// (first/last disabled edges, current marker, live page changes).
export const InteractionTest: Story = {
  tags: ["!autodocs"],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => (
    <div className="space-y-8">
      <div data-testid="link-first">
        <Pagination page={1} totalPages={10} buildPageUrl={buildPageUrl} />
      </div>
      <div data-testid="link-middle">
        <Pagination page={5} totalPages={10} buildPageUrl={buildPageUrl} />
      </div>
      <div data-testid="link-last">
        <Pagination page={10} totalPages={10} buildPageUrl={buildPageUrl} />
      </div>
      <div data-testid="button-mode">
        <ButtonModeWrapper initialPage={1} totalPages={5} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Link mode — middle page: nav landmark, current marker, prev/next + edge hrefs
    const middle = within(canvas.getByTestId("link-middle"));
    await expect(middle.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    await expect(middle.getByRole("link", { name: "5" })).toHaveAttribute("aria-current", "page");
    await expect(middle.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "?page=4",
    );
    await expect(middle.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "?page=6",
    );
    await expect(middle.getByRole("link", { name: "1" })).toHaveAttribute("href", "?page=1");
    await expect(middle.getByRole("link", { name: "10" })).toHaveAttribute("href", "?page=10");

    // Link mode — first page: prev collapses to a disabled span, next stays active
    const first = within(canvas.getByTestId("link-first"));
    const prevSpan = first.getByLabelText("Previous page");
    await expect(prevSpan.tagName).toBe("SPAN");
    await expect(prevSpan).toHaveAttribute("aria-disabled", "true");
    await expect(first.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "?page=2");

    // Link mode — last page: next collapses to a disabled span, prev stays active
    const last = within(canvas.getByTestId("link-last"));
    const nextSpan = last.getByLabelText("Next page");
    await expect(nextSpan.tagName).toBe("SPAN");
    await expect(nextSpan).toHaveAttribute("aria-disabled", "true");
    await expect(last.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "?page=9",
    );

    // Button mode — click-through with live page changes
    const btn = within(canvas.getByTestId("button-mode"));
    const pageInfo = btn.getByTestId("page-info");
    // First page: prev disabled, page 1 current
    await expect(btn.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(btn.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    // Next → page 2, prev becomes enabled
    await userEvent.click(btn.getByRole("button", { name: "Next page" }));
    await expect(pageInfo).toHaveTextContent("Page 2 of 5");
    await expect(btn.getByRole("button", { name: "Previous page" })).toBeEnabled();
    // Jump to page 4
    await userEvent.click(btn.getByRole("button", { name: "4" }));
    await expect(pageInfo).toHaveTextContent("Page 4 of 5");
    // Next → page 5 (last): next disabled, page 5 current
    await userEvent.click(btn.getByRole("button", { name: "Next page" }));
    await expect(pageInfo).toHaveTextContent("Page 5 of 5");
    await expect(btn.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(btn.getByRole("button", { name: "5" })).toHaveAttribute("aria-current", "page");
    // Prev → page 4
    await userEvent.click(btn.getByRole("button", { name: "Previous page" }));
    await expect(pageInfo).toHaveTextContent("Page 4 of 5");
  },
};
