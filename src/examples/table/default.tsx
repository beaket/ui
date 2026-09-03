import { Table } from "../../components/table";

// Sample data
const invoices = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: "¥25,000" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "¥15,000" },
  { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "¥35,000" },
];

const args = {};

const render = () => (
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
);

export default function Example() {
  return render();
}
