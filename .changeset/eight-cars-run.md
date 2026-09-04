---
"@beaket/ui": minor
---

DataTable defers its global filter, and the render-time ref writes are gone

**F6** — typing in the search field re-ran filtering and re-rendered the whole table in the same commit. The input is now bound to the immediate value and the table receives a `useDeferredValue` of it: typing stays responsive and the expensive pass lags by design.

**F2** — `data-table.tsx` carried two hand-rolled "latest ref" writes _during render_ (`tableRef.current = table`, `onSelectionChangeRef.current = onSelectionChange`) — a shape React tells you not to write and that React Compiler, which runs in **your** build, refuses to optimize past. `useEffectEvent` replaces both: it is the official answer for an Effect calling the freshest callback, and it closes over the freshest `table` as well, so the second ref disappears with the first.

`textarea.tsx` had the same render-time write for its forwarded-ref merge. That is not an Effect callback, so `useEffectEvent` does not apply; the ref is simply gone and the merge depends on `ref` directly.

`data-table` now declares `"react": ">=19.2.0"` in the registry (`useEffectEvent`); `add` warns if your project is below it. `useDeferredValue` is a React 18 API and needs no floor.
