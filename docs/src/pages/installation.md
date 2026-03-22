---
layout: ../layouts/doc.astro
title: Installation
---

# Installation

## Requirements

- React 18+
- Tailwind CSS 4+
- TypeScript

## Setup

### Vite

Configure the `@` path alias:

```json
// tsconfig.app.json → compilerOptions
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

### Next.js

Path aliases are pre-configured.

## Initialize

```bash
npx @beaket/ui init
```

Or with a [theme](/ui/themes):

```bash
npx @beaket/ui init --theme tobacco
```

## Add Components

```bash
npx @beaket/ui add button
```

Components are copied to `@/components/ui/`:

```tsx
import { Button } from "@/components/ui/button";
```

See [CLI](/ui/cli) for all options.
