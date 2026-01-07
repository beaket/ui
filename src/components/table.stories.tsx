import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSectionHeader,
} from "./table";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A semantic HTML table with styled components for header, body, footer, rows, and cells.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const invoices = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: "¥25,000" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "¥15,000" },
  { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "¥35,000" },
  { id: "INV004", status: "Paid", method: "Credit Card", amount: "¥45,000" },
  { id: "INV005", status: "Paid", method: "PayPal", amount: "¥55,000" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">¥175,000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const WithShadow: Story = {
  render: () => (
    <Table shadow>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithSectionHeader: Story = {
  render: () => (
    <Table shadow>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-xs">SPEC-001</TableCell>
          <TableCell>Widget Pro</TableCell>
          <TableCell>Hardware</TableCell>
          <TableCell className="text-right font-mono">¥7,500</TableCell>
        </TableRow>
        <TableSectionHeader>
          <th colSpan={4}>Accessories</th>
        </TableSectionHeader>
        <TableRow>
          <TableCell className="font-mono text-xs">SPEC-002</TableCell>
          <TableCell>USB Cable</TableCell>
          <TableCell>Accessory</TableCell>
          <TableCell className="text-right font-mono">Incl.</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-xs">SPEC-003</TableCell>
          <TableCell>Power Adapter</TableCell>
          <TableCell>Accessory</TableCell>
          <TableCell className="text-right font-mono">¥1,500</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Composition for documentation
export const AllVariants = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-2 text-sm font-medium">Basic Table</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Salary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>Developer</TableCell>
            <TableCell className="text-right">¥12,000,000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>Designer</TableCell>
            <TableCell className="text-right">¥10,000,000</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div>
      <h3 className="mb-2 text-sm font-medium">With Footer</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Product A</TableCell>
            <TableCell className="text-right">¥5,000</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Product B</TableCell>
            <TableCell className="text-right">¥7,500</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">¥12,500</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  </div>
);
