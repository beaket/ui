import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "./table";

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
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head className="text-right">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.status}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell className="text-right">{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <Table.Caption>A list of recent invoices.</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head className="text-right">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.slice(0, 3).map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.status}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell className="text-right">{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head className="text-right">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.status}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell className="text-right">{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={3}>Total</Table.Cell>
          <Table.Cell className="text-right">¥175,000</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  ),
};

export const WithShadow: Story = {
  render: () => (
    <Table shadow>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head className="text-right">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.slice(0, 3).map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell className="font-medium">{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.status}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell className="text-right">{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const WithSectionHeader: Story = {
  render: () => (
    <Table shadow>
      <Table.Header>
        <Table.Row>
          <Table.Head>SKU</Table.Head>
          <Table.Head>Product</Table.Head>
          <Table.Head>Category</Table.Head>
          <Table.Head className="text-right">Price</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell className="font-mono text-xs">SPEC-001</Table.Cell>
          <Table.Cell>Widget Pro</Table.Cell>
          <Table.Cell>Hardware</Table.Cell>
          <Table.Cell className="text-right font-mono">¥7,500</Table.Cell>
        </Table.Row>
        <Table.SectionHeader>
          <th colSpan={4}>Accessories</th>
        </Table.SectionHeader>
        <Table.Row>
          <Table.Cell className="font-mono text-xs">SPEC-002</Table.Cell>
          <Table.Cell>USB Cable</Table.Cell>
          <Table.Cell>Accessory</Table.Cell>
          <Table.Cell className="text-right font-mono">Incl.</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell className="font-mono text-xs">SPEC-003</Table.Cell>
          <Table.Cell>Power Adapter</Table.Cell>
          <Table.Cell>Accessory</Table.Cell>
          <Table.Cell className="text-right font-mono">¥1,500</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

// Composition for documentation
export const AllVariants = () => (
  <div className="space-y-8">
    <div>
      <h3 className="mb-2 text-sm font-medium">Basic Table</h3>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Role</Table.Head>
            <Table.Head className="text-right">Salary</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>Developer</Table.Cell>
            <Table.Cell className="text-right">¥12,000,000</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Bob</Table.Cell>
            <Table.Cell>Designer</Table.Cell>
            <Table.Cell className="text-right">¥10,000,000</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
    <div>
      <h3 className="mb-2 text-sm font-medium">With Footer</h3>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Item</Table.Head>
            <Table.Head className="text-right">Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Product A</Table.Cell>
            <Table.Cell className="text-right">¥5,000</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Product B</Table.Cell>
            <Table.Cell className="text-right">¥7,500</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell>Total</Table.Cell>
            <Table.Cell className="text-right">¥12,500</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  </div>
);
