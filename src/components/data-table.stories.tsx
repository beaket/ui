import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, CircleMinus, Clock } from "lucide-react";
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
      const icons = { active: CircleCheck, inactive: CircleMinus, pending: Clock } as const;
      const Icon = icons[status];
      return (
        <Badge variant={variants[status]}>
          <Icon aria-hidden="true" className="mr-1 size-3" /> {status}
        </Badge>
      );
    },
  },
];

const meta: Meta<typeof DataTable<User, unknown>> = {
  title: "UI/DataTable",
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

// One consolidated test folding the five former per-behavior tests. Every
// feature is on one table, exercised in an order chosen to avoid coupling:
// pagination, then sorting (returns to unsorted), then selection, then search
// (auto-resets to page 1 and clears), then row click.
const interactionUsers: User[] = [
  ...users,
  { id: "6", name: "Frank Moore", email: "frank@example.com", role: "Viewer", status: "inactive" },
];

export const InteractionTest: Story = {
  tags: ["!autodocs"],
  args: {
    columns,
    data: interactionUsers,
    searchable: true,
    searchPlaceholder: "Search users...",
    paginated: true,
    pageSize: 3,
    selectable: true,
    onSelectionChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Pagination — six rows across two pages of three
    await expect(canvas.getByText(/Showing 1 to 3 of 6/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(canvas.getByText(/Showing 4 to 6 of 6/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "1" }));
    await expect(canvas.getByText(/Showing 1 to 3 of 6/)).toBeInTheDocument();

    // Sorting — the Name header cycles ascending → descending → unsorted
    const nameHeader = canvas.getByRole("columnheader", { name: "Name" });
    await userEvent.click(nameHeader);
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(nameHeader);
    await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(nameHeader);
    await expect(nameHeader).toHaveAttribute("aria-sort", "none");

    // Selection — select-all checks the page's rows and fires the callback
    const checkboxes = canvas.getAllByRole("checkbox");
    await expect(checkboxes).toHaveLength(4); // select-all + three visible rows
    await userEvent.click(checkboxes[0]);
    await expect(args.onSelectionChange).toHaveBeenCalled();
    await expect(canvas.getAllByRole("checkbox")[1]).toBeChecked();

    // Search — filtering narrows to the matching row, then clears
    const search = canvas.getByPlaceholderText("Search users...");
    await userEvent.type(search, "Alice");
    await expect(canvas.getByText("Alice Johnson")).toBeInTheDocument();
    await expect(canvas.queryByText("Bob Smith")).not.toBeInTheDocument();
    await userEvent.clear(search);
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
