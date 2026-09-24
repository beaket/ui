import type { ReactNode } from "react";

import { Alert } from "@/components/alert";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Navigation } from "@/components/navigation";
import { Progress } from "@/components/progress";
import { RadioGroup } from "@/components/radio";
import { Select } from "@/components/select";
import { Separator } from "@/components/separator";
import { Switch } from "@/components/switch";
import { Table } from "@/components/table";
import { Tabs } from "@/components/tabs";
import { Textarea } from "@/components/textarea";

const ORDERS = [
  { id: "#1042", customer: "Sofia Martinez", status: "Shipped", tone: "success" as const },
  { id: "#1041", customer: "Liam O'Connor", status: "Pending", tone: "warning" as const },
  { id: "#1040", customer: "Aisha Rahman", status: "Failed", tone: "danger" as const },
  { id: "#1039", customer: "Noah Williams", status: "Shipped", tone: "success" as const },
];

function Screen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="app-screen">
      <div className="border-border-strong bg-bg border">{children}</div>
      <p className="app-screen-label">{label}</p>
    </div>
  );
}

function Chrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <header className="bg-bg-overlay border-border-strong flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="text-fg text-sm font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          <Badge variant="success">Live</Badge>
          <Avatar className="size-7">
            <Avatar.Fallback>AM</Avatar.Fallback>
          </Avatar>
        </div>
      </header>
      {children}
    </>
  );
}

/**
 * Two phone-width app screens built only from the registry. The themes page
 * claims "same components, different world" — so the specimen proving it has
 * to be made of the components. Nothing here is drawn with a bare div: every
 * part is the one a consumer installs, reading the palette through the
 * semantic layer, and every one renders on the server with no island.
 *
 * Phone width on purpose. The old mock forced a desktop dashboard into a
 * documentation column, where every panel was too narrow to read.
 */
export function ThemeAppMock() {
  return (
    <div className="app-mock">
      <Screen label="Overview">
        <Chrome title="Acme">
          <Navigation value="/overview" className="border-border-muted block border-b px-3 py-2">
            <Navigation.List>
              <Navigation.Item>
                <Navigation.Link href="#overview" value="/overview">
                  Overview
                </Navigation.Link>
              </Navigation.Item>
              <Navigation.Item>
                <Navigation.Link href="#orders" value="/orders">
                  Orders
                </Navigation.Link>
              </Navigation.Item>
              <Navigation.Item>
                <Navigation.Link href="#users" value="/users">
                  Users
                </Navigation.Link>
              </Navigation.Item>
            </Navigation.List>
          </Navigation>

          <div className="flex flex-col gap-4 p-3">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <Card.Header>
                  <Card.Description>Revenue</Card.Description>
                  <Card.Title>$12,840</Card.Title>
                </Card.Header>
              </Card>
              <Card>
                <Card.Header>
                  <Card.Description>Users</Card.Description>
                  <Card.Title>1,284</Card.Title>
                </Card.Header>
              </Card>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-fg-muted flex items-center justify-between text-xs">
                <span>Monthly target</span>
                <span>64%</span>
              </div>
              <Progress value={64} aria-label="Monthly target" />
            </div>

            <Alert variant="note">
              <Alert.Description>One payment failed in the last hour.</Alert.Description>
            </Alert>

            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Order</Table.Head>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ORDERS.map((order) => (
                  <Table.Row key={order.id}>
                    <Table.Cell className="font-mono text-xs">{order.id}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">{order.customer}</Table.Cell>
                    <Table.Cell>
                      <Badge variant={order.tone}>{order.status}</Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Chrome>
      </Screen>

      <Screen label="Settings">
        <Chrome title="Account">
          <Tabs defaultValue="profile" className="p-3">
            <Tabs.List>
              <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
              <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile" className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mock-name">Workspace</Label>
                <Input id="mock-name" defaultValue="Acme Inc." />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mock-region">Region</Label>
                <Select defaultValue="iad1">
                  <Select.Trigger id="mock-region">
                    <Select.Value>Washington</Select.Value>
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="iad1">Washington</Select.Item>
                    <Select.Item value="icn1">Seoul</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mock-note">Notes</Label>
                <Textarea id="mock-note" rows={2} placeholder="Internal notes…" />
              </div>

              <Separator />

              <fieldset className="flex flex-col gap-2">
                <legend className="text-fg mb-1 text-sm font-medium">Plan</legend>
                <RadioGroup defaultValue="team">
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="team" id="mock-team" />
                    <Label htmlFor="mock-team">Team</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="solo" id="mock-solo" />
                    <Label htmlFor="mock-solo">Solo</Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <div className="flex items-center gap-2">
                <Checkbox id="mock-archive" defaultChecked />
                <Label htmlFor="mock-archive">Include archived</Label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-fg text-sm">Email receipts</span>
                <Switch defaultChecked aria-label="Email receipts" />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button size="sm">Save</Button>
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
                <Button size="sm" variant="danger" className="ml-auto">
                  Delete
                </Button>
              </div>
            </Tabs.Content>
          </Tabs>
        </Chrome>
      </Screen>
    </div>
  );
}
