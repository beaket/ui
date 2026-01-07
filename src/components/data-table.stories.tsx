import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Badge } from "./badge";
import { DataTable, type ColumnDef } from "./data-table";

// Sample data type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
}

// Sample data
const users: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "active" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "Viewer", status: "inactive" },
  { id: "4", name: "David Brown", email: "david@example.com", role: "Editor", status: "pending" },
  { id: "5", name: "Eve Davis", email: "eve@example.com", role: "Admin", status: "active" },
];

// Column definitions
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 180,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 220,
  },
  {
    accessorKey: "role",
    header: "Role",
    size: 120,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue("status") as User["status"];
      const variants = {
        active: "default",
        inactive: "secondary",
        pending: "outline",
      } as const;
      return <Badge variant={variants[status]}>{status}</Badge>;
    },
  },
];

const meta: Meta<typeof DataTable<User, unknown>> = {
  title: "Components/DataTable",
  component: DataTable<User, unknown>,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A data table component built on TanStack Table. Features sorting, filtering, pagination, and row selection.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns,
    data: users,
  },
};

export const WithSearch: Story = {
  args: {
    columns,
    data: users,
    searchable: true,
    searchPlaceholder: "Search users...",
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: [
      ...users,
      ...users.map((u, i) => ({
        ...u,
        id: `${u.id}-copy-${i}`,
        email: `${u.name.toLowerCase().replace(" ", ".")}.${i}@example.com`,
      })),
    ],
    paginated: true,
    pageSize: 3,
  },
};

export const WithSelection: Story = {
  args: {
    columns,
    data: users,
    selectable: true,
    onSelectionChange: fn(),
  },
};

export const WithRowClick: Story = {
  args: {
    columns,
    data: users,
    onRowClick: fn((row: User) => {
      console.log("Row clicked:", row);
    }),
  },
};

export const Compact: Story = {
  args: {
    columns,
    data: users,
    compact: true,
  },
};

export const EmptyState: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: "No users found.",
  },
};

export const FullFeatured: Story = {
  args: {
    columns,
    data: [
      ...users,
      ...users.map((u, i) => ({
        ...u,
        id: `${u.id}-copy-${i}`,
        email: `${u.name.toLowerCase().replace(" ", ".")}.${i}@example.com`,
      })),
    ],
    searchable: true,
    searchPlaceholder: "Search users...",
    paginated: true,
    pageSize: 5,
    selectable: true,
    onRowClick: fn(),
    onSelectionChange: fn(),
  },
};

// Composition for documentation
export const AllFeatures = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-2 text-sm font-medium">Basic Table</h3>
      <DataTable columns={columns} data={users.slice(0, 3)} />
    </div>
    <div>
      <h3 className="mb-2 text-sm font-medium">With Search</h3>
      <DataTable
        columns={columns}
        data={users.slice(0, 3)}
        searchable
        searchPlaceholder="Search..."
      />
    </div>
    <div>
      <h3 className="mb-2 text-sm font-medium">With Selection</h3>
      <DataTable columns={columns} data={users.slice(0, 3)} selectable />
    </div>
    <div>
      <h3 className="mb-2 text-sm font-medium">Compact Mode</h3>
      <DataTable columns={columns} data={users.slice(0, 3)} compact />
    </div>
  </div>
);

// Interaction tests
export const SearchTest: Story = {
  args: {
    columns,
    data: users,
    searchable: true,
    searchPlaceholder: "Search users...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify search input is present
    const searchInput = canvas.getByPlaceholderText("Search users...");
    await expect(searchInput).toBeInTheDocument();

    // Type in search input
    await userEvent.type(searchInput, "Alice");

    // Verify filtered result (only Alice should be visible)
    const aliceRow = canvas.getByText("Alice Johnson");
    await expect(aliceRow).toBeInTheDocument();

    // Clear search
    await userEvent.clear(searchInput);
  },
};

export const SortingTest: Story = {
  args: {
    columns,
    data: users,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click the Name header to sort
    const nameHeader = canvas.getByText("Name");
    await userEvent.click(nameHeader);

    // Click again for descending sort
    await userEvent.click(nameHeader);

    // Click again to clear sort
    await userEvent.click(nameHeader);
  },
};

export const SelectionTest: Story = {
  args: {
    columns,
    data: users.slice(0, 3),
    selectable: true,
    onSelectionChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Get all checkboxes
    const checkboxes = canvas.getAllByRole("checkbox");
    await expect(checkboxes.length).toBe(4); // 1 select-all + 3 rows

    // Click first row checkbox (not select-all)
    await userEvent.click(checkboxes[1]);

    // Verify onSelectionChange was called
    await expect(args.onSelectionChange).toHaveBeenCalled();

    // Click select-all checkbox
    await userEvent.click(checkboxes[0]);
  },
};

export const PaginationTest: Story = {
  args: {
    columns,
    data: [
      ...users,
      ...users.map((u, i) => ({ ...u, id: `${u.id}-copy-${i}`, email: `copy.${i}@example.com` })),
    ],
    paginated: true,
    pageSize: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify pagination info is shown
    const paginationInfo = canvas.getByText(/Showing 1 to 3 of/);
    await expect(paginationInfo).toBeInTheDocument();

    // Find and click next page button
    const nextButton = canvas.getByRole("button", { name: "Next page" });
    await expect(nextButton).toBeEnabled();
    await userEvent.click(nextButton);

    // Verify we're on page 2
    const page2Info = canvas.getByText(/Page 2 of/);
    await expect(page2Info).toBeInTheDocument();

    // Go back to first page
    const firstPageButton = canvas.getByRole("button", { name: "First page" });
    await userEvent.click(firstPageButton);
  },
};

export const RowClickTest: Story = {
  args: {
    columns,
    data: users.slice(0, 2),
    onRowClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Find a row and click it
    const firstRow = canvas.getByText("Alice Johnson").closest("tr");
    if (firstRow) {
      await userEvent.click(firstRow);
      await expect(args.onRowClick).toHaveBeenCalledTimes(1);
    }
  },
};

// Wide content with text wrapping
interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Introduction to React Server Components",
    description:
      "React Server Components allow you to render components on the server, reducing the amount of JavaScript sent to the client and improving performance for data-heavy applications.",
    author: "Alice Johnson",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Building Accessible Web Applications",
    description:
      "Accessibility is not just about compliance—it's about creating inclusive experiences. This guide covers ARIA attributes, keyboard navigation, screen reader support, and semantic HTML best practices.",
    author: "Bob Smith",
    date: "2024-01-10",
  },
  {
    id: "3",
    title: "State Management Patterns in Modern React",
    description:
      "From useState to Zustand, exploring different approaches to managing application state. We compare Redux, Context API, Jotai, and other solutions for different use cases.",
    author: "Carol White",
    date: "2024-01-05",
  },
];

const wideColumns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: "Title",
    size: 200,
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 400,
    cell: ({ row }) => <div className="whitespace-normal">{row.getValue("description")}</div>,
  },
  {
    accessorKey: "author",
    header: "Author",
    size: 120,
  },
  {
    accessorKey: "date",
    header: "Date",
    size: 100,
  },
];

export const WithWideContent = {
  render: () => <DataTable columns={wideColumns} data={articles} />,
  parameters: {
    docs: {
      description: {
        story:
          "Table with wide content that wraps to multiple lines. Use `whitespace-normal` in cell renderer to allow text wrapping.",
      },
    },
  },
};
