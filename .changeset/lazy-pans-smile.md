---
"@beaket/ui": minor
---

`Dialog.Trigger` and `Sheet.Trigger` parts

Dialog and Sheet accepted the trigger as a `ReactNode` prop and exposed no `Trigger` part, so the sugar **was** the API. A consumer who needed two triggers, or a conditional one, or a trigger that is not the first child, had nowhere to go — and a `ReactNode` prop is structurally invisible: nothing in the type says `trigger` must be focusable.

```tsx
<Dialog>
  <Dialog.Trigger>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Trigger>
    <Button variant="ghost">Also open</Button>
  </Dialog.Trigger>
  <Dialog.Title>…</Dialog.Title>
</Dialog>
```

Radix's context was already mounted here; the wrapper simply did not expose the part. `asChild` defaults to `true`, matching `Dialog.Close`, so the natural nesting keeps the consumer's own element.

Additive: `trigger` keeps working unchanged and is now literally sugar that renders this part. A `Trigger` child is placed as a sibling of the portal rather than as content inside it, so triggers and content each land where they are legal.
