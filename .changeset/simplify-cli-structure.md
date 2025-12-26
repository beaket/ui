---
"@beaket/ui": major
---

Simplify CLI and component structure

**Breaking changes:**

- `beaket.json` now only requires `components` path (removed `tailwind`, `aliases`, `paths.utils`)
- Components are now single files (e.g., `button.tsx` instead of `button/button.tsx`)
- `cn` utility is now inlined in each component

**New `beaket.json` format:**

```json
{
  "components": "src/components/ui"
}
```

**Migration:**

1. Update `beaket.json` to new format
2. Add CSS variables manually (see docs)
3. Re-add components with `--overwrite` flag
