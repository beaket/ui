---
"@beaket/ui": minor
---

`Tabs.Content` takes `keepMounted`

Radix unmounts inactive tab panels, so scroll position, uncommitted form input and any in-panel state are destroyed on every tab switch. `forceMount` was the only escape and it keeps the panel **fully live** — the opposite extreme.

```tsx
<Tabs.Content value="draft" keepMounted>
  <textarea /> {/* survives a trip to another tab */}
</Tabs.Content>
```

`keepMounted` is React 19.2's `<Activity mode="hidden">`: state preserved, effects torn down, re-render deprioritized. **Off by default** — this adds a way out, it does not change what Tabs already does.

Under `keepMounted` the panel is hidden with `data-[state=inactive]:hidden` rather than Radix's `hidden` attribute, which `forceMount` disables — so an inactive panel leaves no empty box in the layout or the accessibility tree.

Requires React >= 19.2, which the `tabs` entry in `registry.json` now declares; `add` warns if your project is below it.
