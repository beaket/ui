---
"@beaket/ui": major
---

Breaking: `Tooltip` no longer mounts its own `TooltipProvider`

`Tooltip` wrapped every instance in its own `TooltipPrimitive.Provider`, so a
`TooltipProvider` placed around a group was shadowed by the inner one and its
`delayDuration` could never reach a tooltip. The provider is now what it is in
Radix — required, and the single place the delay is configured.

```diff
- <Tooltip delayDuration={700}>…</Tooltip>
- <Tooltip delayDuration={700}>…</Tooltip>
+ <TooltipProvider delayDuration={700}>
+   <Tooltip>…</Tooltip>
+   <Tooltip>…</Tooltip>
+ </TooltipProvider>
```

Every `Tooltip` must now sit inside a `TooltipProvider`; Radix throws otherwise.
Mount one near the root of your app. `delayDuration` stays available on a single
`Tooltip` as a per-tooltip override of the provider's value, and the provider
still defaults to `0`.
