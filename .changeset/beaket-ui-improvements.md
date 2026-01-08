---
"@beaket/ui": minor
---

### Breaking Changes

- **Table**: Migrated to compound component pattern
  - Before: `import { Table, TableBody, TableCell, ... } from "@beaket/ui"`
  - After: `import { Table } from "@beaket/ui"` and use `Table.Body`, `Table.Cell`, etc.

### New Features

- **Input**: Added `prefix` and `suffix` props for icon support
- **Sheet**: Added `fullScreen` prop for full-width mobile navigation
- **Button**: Hover/active states now use CSS variables for easier customization
  - Added `--signal-green-hover`, `--signal-green-active`
  - Added `--signal-red-hover`, `--signal-red-active`
  - Added `--signal-amber-hover`, `--signal-amber-active`
