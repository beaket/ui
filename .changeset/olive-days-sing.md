---
"@beaket/ui": minor
---

`Pagination` is a flexible compound component: `Pagination.Previous`, `.Item`, `.Ellipsis`, `.Next`

Pagination was one function with configuration props, a discriminated union with `never` guards, and hardcoded `<a href>`s — so the consumer's router was unusable and the page-number algorithm was entangled with rendering.

The root now holds `page` / `totalPages` / navigation mode in context and the parts read it, each taking `asChild`:

```tsx
<Pagination page={page} totalPages={10} buildPageUrl={(p) => `/page/${p}`}>
  <Pagination.Previous />
  <Pagination.Item page={1} />
  <Pagination.Ellipsis />
  <Pagination.Item page={10} asChild>
    <Link href="/page/10">10</Link>
  </Pagination.Item>
  <Pagination.Next />
</Pagination>
```

Additive: `mode="link"` / `mode="button"` keep working unchanged and are now sugar that lays the same parts out for you. `PaginationBaseProps`, `PaginationLinkProps` and `PaginationButtonProps` are exported alongside the new `PaginationItemProps` and `PaginationEllipsisProps`.
