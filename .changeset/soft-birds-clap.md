---
"@beaket/ui": minor
---

`Alert.Title` and `Alert.Description` parts

`Alert` took its title as a content prop — `title?: string` — which forced the props type to `Omit<…, "title">` and could only ever be extended by another content prop: `title` invites `titleIcon`, then `titleClassName`, then `renderTitle`. A `string` title also cannot be reordered, wrapped, conditionally rendered or styled.

```tsx
<Alert variant="warning">
  <Alert.Title className="uppercase">
    Deploy blocked <Badge>3</Badge>
  </Alert.Title>
  <Alert.Description>Two required checks have not reported yet.</Alert.Description>
</Alert>
```

Namespacing, not context — the parts share no state, so a provider would be pure machinery. The variant icon stays on the root, where the variant lives.

Additive: `title` keeps working as the sugar over the parts, including the variant-name default (`"Warning"`, `"Note"`, …), and bare children are still wrapped as the description. Parts must be direct children of `Alert`.
