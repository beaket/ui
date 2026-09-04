---
"@beaket/ui": minor
---

`Breadcrumb.Link` and `Navigation.Link` accept `asChild`

Both hardcoded a plain `<a href>`, so in Next.js or React Router a consumer had to either lose client-side navigation or rewrite the component — which, under Open Code, means forking the file forever. `asChild` renders the consumer's own element instead:

```tsx
<Breadcrumb.Link asChild>
  <Link href="/docs">Docs</Link>
</Breadcrumb.Link>
```

Under `asChild` the component injects nothing: the child owns its tag, and `Navigation.Link` skips its press-travel wrapper the way Button skips its spinner. Both components now list `@radix-ui/react-slot` in the registry.
