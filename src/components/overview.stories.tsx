import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";

import { Alert } from "./alert";
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Blockquote } from "./blockquote";
import { Breadcrumb } from "./breadcrumb";
import { Button } from "./button";
import { Card } from "./card";
import { Checkbox } from "./checkbox";
import { type ColumnDef, DataTable } from "./data-table";
import { Dialog } from "./dialog";
import { DropdownMenu } from "./dropdown-menu";
import { Input } from "./input";
import { Label } from "./label";
import { Navigation } from "./navigation";
import { NavigationProgress } from "./navigation-progress";
import { Pagination } from "./pagination";
import { RadioGroup, RadioItem } from "./radio";
import { Select } from "./select";
import { Separator } from "./separator";
import { Sheet } from "./sheet";
import { Skeleton } from "./skeleton";
import { Switch } from "./switch";
import { Table } from "./table";
import { Tabs } from "./tabs";
import { Textarea } from "./textarea";
import { Tooltip } from "./tooltip";

/**
 * A single-page "kitchen sink" of every component in representative states.
 *
 * Its job is theme QA: flip the **Theme** and **Scheme** toolbars and scan the
 * whole system at once for a token that recolors wrong. The page uses `bg-bg` /
 * `text-fg` so switching palettes recolors it end to end. This is not a
 * replacement for each component's own story — those keep the Controls, docs,
 * and interaction tests.
 */
const meta: Meta = {
  title: "Overview",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const SurfaceDepth: StoryObj = {
  render: () => (
    <div className="bg-bg text-fg min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Borderless surface depth</h1>
          <p className="text-fg-muted mt-1 text-sm">
            Page, raised, and overlay backgrounds shown without borders or shadows.
          </p>
        </div>
        <div className="bg-bg-raised border-0 p-8 shadow-none">
          <div className="text-fg-subtle mb-6 font-mono text-xs tracking-wide uppercase">
            Raised surface
          </div>
          <div className="bg-bg-overlay border-0 p-8 shadow-none">
            <div className="text-fg-subtle mb-2 font-mono text-xs tracking-wide uppercase">
              Overlay surface
            </div>
            <p className="text-fg-muted text-sm">
              Each nested sheet must remain legible through its background alone.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

// --- layout helpers (local to this story) ---------------------------------

function Cell({ label, span, children }: { label: string; span?: boolean; children: ReactNode }) {
  return (
    <div className={span ? "sm:col-span-2 lg:col-span-3" : undefined}>
      <div className="text-fg-subtle mb-2 font-mono text-xs tracking-wide uppercase">{label}</div>
      <div className="border-border-muted bg-bg-raised flex min-h-16 flex-wrap items-start gap-3 border border-dashed p-4">
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-fg text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

// --- demo wrappers for components that need state / triggers ----------------

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Header>
          <Dialog.Title>Dialog title</Dialog.Title>
          <Dialog.Description>A short description of the dialog.</Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(3);
  return <Pagination mode="button" page={page} totalPages={10} onPageChange={setPage} />;
}

interface Person {
  name: string;
  role: string;
  status: string;
}

const dtColumns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", size: 180 },
  { accessorKey: "role", header: "Role", size: 120 },
  { accessorKey: "status", header: "Status", size: 120 },
];

const dtData: Person[] = [
  { name: "Alice Johnson", role: "Admin", status: "active" },
  { name: "Bob Smith", role: "Editor", status: "active" },
  { name: "Carol White", role: "Viewer", status: "inactive" },
];

// --- the kitchen sink ------------------------------------------------------

export const AllComponents: StoryObj = {
  render: () => (
    <div className="bg-bg text-fg min-h-screen space-y-10 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Component overview</h1>
        <p className="text-fg-muted text-sm">
          Every component at once. Use the <strong>Theme</strong> and <strong>Scheme</strong>{" "}
          toolbars above to QA the whole system across palettes and light/dark.
        </p>
      </header>

      <Section title="Actions">
        <Cell label="Button" span>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </Cell>
        <Cell label="Badge" span>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="code">code</Badge>
        </Cell>
      </Section>

      <Section title="Forms">
        <Cell label="Input">
          <div className="w-full space-y-2">
            <Input placeholder="Email address" />
            <Input placeholder="Disabled" disabled />
          </div>
        </Cell>
        <Cell label="Textarea">
          <Textarea className="w-full" placeholder="Write a message…" rows={3} />
        </Cell>
        <Cell label="Label + Input">
          <div className="w-full space-y-1.5">
            <Label htmlFor="ov-email">Email</Label>
            <Input id="ov-email" placeholder="you@example.com" />
          </div>
        </Cell>
        <Cell label="Checkbox">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked aria-label="Checked" /> Checked
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox aria-label="Unchecked" /> Unchecked
            </label>
            <label className="text-fg-disabled flex items-center gap-2 text-sm">
              <Checkbox disabled aria-label="Disabled" /> Disabled
            </label>
          </div>
        </Cell>
        <Cell label="Radio">
          <RadioGroup defaultValue="option2" aria-label="Options" className="flex-col">
            <label className="flex items-center gap-2 text-sm">
              <RadioItem value="option1" aria-label="Option 1" /> Option 1
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioItem value="option2" aria-label="Option 2" /> Option 2
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioItem value="option3" aria-label="Option 3" /> Option 3
            </label>
          </RadioGroup>
        </Cell>
        <Cell label="Switch">
          <div className="flex items-center gap-4">
            <Switch defaultChecked aria-label="On" />
            <Switch aria-label="Off" />
            <Switch disabled aria-label="Disabled" />
          </div>
        </Cell>
        <Cell label="Select">
          <Select>
            <Select.Trigger aria-label="Choose a fruit" className="w-48">
              <Select.Value placeholder="Select a fruit" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">Apple</Select.Item>
              <Select.Item value="banana">Banana</Select.Item>
              <Select.Item value="orange">Orange</Select.Item>
            </Select.Content>
          </Select>
        </Cell>
      </Section>

      <Section title="Data display">
        <Cell label="Avatar">
          <Avatar>
            <Avatar.Image src="https://github.com/beaket.png" alt="@beaket" />
            <Avatar.Fallback>BK</Avatar.Fallback>
          </Avatar>
          <Avatar>
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
        </Cell>
        <Cell label="Separator">
          <div className="w-full">
            <p className="text-sm">Above the divider</p>
            <Separator className="my-3" />
            <p className="text-sm">Below the divider</p>
          </div>
        </Cell>
        <Cell label="Skeleton">
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Cell>
        <Cell label="Blockquote" span>
          <Blockquote>Simplicity is the ultimate sophistication.</Blockquote>
        </Cell>
        <Cell label="Card">
          <Card className="w-full">
            <Card.Header>
              <Card.Title>Card title</Card.Title>
              <Card.Description>Card description text.</Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-fg-muted text-sm">Any content lives here.</p>
            </Card.Content>
            <Card.Footer>
              <Button>Action</Button>
            </Card.Footer>
          </Card>
        </Cell>
        <Cell label="Table" span>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Invoice</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head className="text-right">Amount</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell className="font-medium">INV-001</Table.Cell>
                <Table.Cell>Paid</Table.Cell>
                <Table.Cell className="text-right">$250.00</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell className="font-medium">INV-002</Table.Cell>
                <Table.Cell>Pending</Table.Cell>
                <Table.Cell className="text-right">$150.00</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Cell>
        <Cell label="DataTable" span>
          <DataTable columns={dtColumns} data={dtData} />
        </Cell>
      </Section>

      <Section title="Feedback">
        <Cell label="Alert" span>
          <div className="w-full space-y-3">
            <Alert variant="note">A note providing additional information.</Alert>
            <Alert variant="tip">A helpful tip worth knowing.</Alert>
            <Alert variant="important">Something important to keep in mind.</Alert>
            <Alert variant="warning">A warning to consider before acting.</Alert>
            <Alert variant="caution">A cautionary message about risk.</Alert>
          </div>
        </Cell>
        <Cell label="Tooltip">
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="outline">Hover me</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>This is a tooltip</Tooltip.Content>
          </Tooltip>
        </Cell>
        <Cell label="NavigationProgress" span>
          <div className="w-full">
            <NavigationProgress active />
          </div>
        </Cell>
      </Section>

      <Section title="Navigation">
        <Cell label="Breadcrumb" span>
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Link href="/docs">Documentation</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Page>Components</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </Cell>
        <Cell label="Navigation" span>
          <Navigation>
            <Navigation.List>
              <Navigation.Item>
                <Navigation.Link href="/" active>
                  Home
                </Navigation.Link>
              </Navigation.Item>
              <Navigation.Item>
                <Navigation.Link href="/docs">Docs</Navigation.Link>
              </Navigation.Item>
              <Navigation.Item>
                <Navigation.Link href="/about">About</Navigation.Link>
              </Navigation.Item>
            </Navigation.List>
          </Navigation>
        </Cell>
        <Cell label="Tabs" span>
          <Tabs defaultValue="account" className="w-full max-w-md">
            <Tabs.List>
              <Tabs.Trigger value="account">Account</Tabs.Trigger>
              <Tabs.Trigger value="password">Password</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="account">
              <p className="text-fg-muted p-4 text-sm">Manage your account settings.</p>
            </Tabs.Content>
            <Tabs.Content value="password">
              <p className="text-fg-muted p-4 text-sm">Update your password.</p>
            </Tabs.Content>
          </Tabs>
        </Cell>
        <Cell label="Pagination" span>
          <PaginationDemo />
        </Cell>
      </Section>

      <Section title="Overlays">
        <Cell label="Dialog">
          <DialogDemo />
        </Cell>
        <Cell label="Sheet">
          <Sheet trigger={<Button variant="outline">Open sheet</Button>}>
            <Sheet.Header>
              <Sheet.Title>Sheet title</Sheet.Title>
              <Sheet.Description>Slides in from the side.</Sheet.Description>
            </Sheet.Header>
            <Sheet.Footer>
              <Sheet.Close>
                <Button variant="outline">Close</Button>
              </Sheet.Close>
            </Sheet.Footer>
          </Sheet>
        </Cell>
        <Cell label="Dropdown menu">
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>My account</DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                Profile
                <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                Billing
                <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>Log out</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </Cell>
      </Section>
    </div>
  ),
};
