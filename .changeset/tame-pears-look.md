---
"@beaket/ui": minor
---

`Navigation` takes a root `value`; `Navigation.Link` derives its own active state

The consumer answered "is this the current page?" by hand on every single link. The root now holds that one answer and each link compares its own `value`:

```tsx
<Navigation value={pathname}>
  <Navigation.Link href="/docs" value="/docs">
    Docs
  </Navigation.Link>
</Navigation>
```

Additive: the root's `value` is optional, an explicit `active` still overrides the derived state, and a `Navigation.Link` used with no root `value` behaves exactly as before. The context accessor deliberately does not throw when there is no provider — throwing would require more of existing callers.
