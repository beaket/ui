import { Table } from "../../components/table";

// Sample data
const invoices = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: "¥25,000" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "¥15,000" },
  { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "¥35,000" },
  { id: "INV004", status: "Paid", method: "Credit Card", amount: "¥45,000" },
  { id: "INV005", status: "Paid", method: "PayPal", amount: "¥55,000" },
];

export default () => (
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
