import { CircleCheck, CircleMinus, Clock } from "lucide-react";

import { Badge } from "../../components/badge";

import { DataTable, type ColumnDef } from "../../components/data-table";

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
        <Badge variant={variants[status]} className="inline-flex w-24 justify-center">
          <Icon aria-hidden="true" className="mr-1 size-3" /> {status}
        </Badge>
      );
    },
  },
];

export default () => (
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
