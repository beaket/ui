---
"@beaket/paper": minor
---

Rename the React component from `BeaketPaper` to `Paper` (and its types `BeaketPaperHandle` → `PaperHandle`, `BeaketPaperProps` → `PaperProps`). The package scope (`@beaket/paper`) already namespaces the export, so the prefix was redundant.

**Breaking:** update imports from `@beaket/paper/react`:

```diff
-import { BeaketPaper, type BeaketPaperHandle } from "@beaket/paper/react";
+import { Paper, type PaperHandle } from "@beaket/paper/react";
```

If `Paper` collides with another import in your code, alias it: `import { Paper as BeaketPaper } from "@beaket/paper/react"`.
