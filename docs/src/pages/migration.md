---
layout: ../layouts/doc.astro
title: Coming from native HTML
---

# Coming from native HTML

Keep the browser semantics you rely on, but do not assume a styled component
has the same API as the native element. These five differences are worth
checking before replacing a working screen.

## 1. Compound parts and server components

Both `Card.Header` and its named export `CardHeader` work. Inside a Next.js
App Router server page, import named parts instead of reading properties from
a client-component namespace:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>Account details</CardContent>
    </Card>
  );
}
```

Do not assume there is a `DialogContent` export or `Dialog.Content` part.
`Dialog` itself owns the content. Give it a `trigger` and children:

```tsx
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";

<Dialog trigger={<button>Open account</button>} size="lg">
  <DialogTitle>Account</DialogTitle>
  <DialogDescription>Update account details.</DialogDescription>
</Dialog>;
```

The legacy direct `Dialog.Trigger` child also works. Put callback handlers
and controlled client state in a `"use client"` component; named exports do
not make functions serializable across the server boundary. See
[Installation](/ui/installation) for the complete Next.js setup.

## 2. An empty Select item is not an “All” option

Native HTML accepts `<option value="">All</option>`. Radix Select reserves
the empty string for clearing the selection and displaying its placeholder;
`<Select.Item value="">` throws.

Use a non-empty sentinel that cannot collide with a real value:

```tsx
const ALL = "__all__";
const [category, setCategory] = useState(ALL);
const visible = rows.filter((row) => category === ALL || row.category === category);

<Select value={category} onValueChange={setCategory}>
  <Select.Trigger aria-label="Category">
    <Select.Value />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value={ALL}>All</Select.Item>
    <Select.Item value="food">Food</Select.Item>
  </Select.Content>
</Select>;
```

Translate the sentinel at your filter or submission boundary. Setting the
root's value to `""` is useful for a placeholder; it is not an empty-valued item.

## 3. Radix controls do participate in native forms

The visible controls are buttons or composite widgets, but Radix renders
hidden native form controls for Select, Checkbox, Switch and RadioGroup.
You do **not** need to add a second hidden input for each one.

Put the component inside the form, provide `name`, and use its own uncontrolled
default prop. Native `defaultValue` is not a checkbox's `defaultChecked`:

```tsx
<form>
  <Select name="category" defaultValue="food">
    <Select.Trigger aria-label="Category">
      <Select.Value />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="food">Food</Select.Item>
    </Select.Content>
  </Select>
  <Checkbox name="receipts" value="yes" defaultChecked aria-label="Keep receipts" />
  <Switch name="alerts" value="yes" defaultChecked aria-label="Enable alerts" />
  <RadioGroup name="account" defaultValue="personal" aria-label="Account type">
    <RadioGroup.Item value="personal" aria-label="Personal" />
    <RadioGroup.Item value="business" aria-label="Business" />
  </RadioGroup>
  <button type="submit">Save</button>
</form>
```

`new FormData(form)` initially contains category=food, receipts=yes,
alerts=yes and account=personal. Unchecked checkboxes/switches and disabled
controls are omitted, following native successful-control rules. Without
`name`, there is no submitted entry. Controlled components need
`onValueChange` or `onCheckedChange`, not a native input's `onChange`.

Keep visible labels in the real UI; the compact example uses accessible
names to make the wiring explicit. RadioGroup is the export from `radio.tsx`,
not a component named `Radio`.

## 4. Nested routes need segment-aware matching

An ad hoc `pathname.startsWith(href)` can highlight both `/transactions`
and `/transactions/new`, and incorrectly match `/transactions-old`.

```tsx
<Navigation value={pathname} match="prefix">
  <Navigation.Link value="/" href="/">
    Home
  </Navigation.Link>
  <Navigation.Link value="/transactions" href="/transactions">
    Transactions
  </Navigation.Link>
  <Navigation.Link value="/transactions/new" href="/transactions/new">
    New
  </Navigation.Link>
</Navigation>
```

Prefix mode chooses the longest mounted segment-boundary match. It ignores
query strings, hashes and trailing slashes. Exact matching remains the default.
Prefix selection appears after links mount; use explicit `active` or a custom
`isActive(pathname, value)` matcher when your router already knows the answer.
An explicit `active` prop wins and is excluded from automatic prefix selection.
Custom matchers are responsible for their own exclusivity.

## 5. Table owns horizontal scrolling

Do not put a wide table in a mobile page and let the whole document overflow.
`Table` now creates its own focusable, horizontally scrollable region:

```tsx
<Table aria-label="Invoices" scrollLabel="Scroll invoices">
  <Table.Header>{/* headings */}</Table.Header>
  <Table.Body>{/* rows */}</Table.Body>
</Table>
```

The table's `ref`, `className`, ARIA attributes and native props still target
the inner `<table>`. The scroll region inherits its accessible name from
`aria-label` or `aria-labelledby`; `scrollLabel` can override that name.
You usually no longer need an extra overflow wrapper. Preserve the region's
keyboard focus indicator when customizing.

Once migrated, use the [Updating guide](/ui/updating) to keep local changes
when taking upstream fixes.
