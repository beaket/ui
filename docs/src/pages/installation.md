---
layout: ../layouts/doc.astro
title: Installation
---

# Installation

## Requirements

- React 18+
- Tailwind CSS 4+

## Vite

1. Install Tailwind CSS:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

2. Update `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

3. Add to `compilerOptions` in `tsconfig.app.json`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

4. Add to `src/index.css`:

```css
@import "tailwindcss";
```

5. Initialize Beaket UI:

```bash
npx @beaket/ui init
```

6. Add components:

```bash
# Add a single component
npx @beaket/ui add button

# Add multiple components at once
npx @beaket/ui add alert button label
```

## Next.js

Tailwind CSS is pre-configured in Next.js.

1. Initialize Beaket UI:

```bash
npx @beaket/ui init
```

2. Add components:

```bash
npx @beaket/ui add button
```

## CLI Options

Use `--help` to see available options:

```bash
npx @beaket/ui --help
npx @beaket/ui init --help
npx @beaket/ui add --help
```

Common options:

- `init -y` - Skip prompts and use defaults
- `add --overwrite` - Overwrite existing component files
