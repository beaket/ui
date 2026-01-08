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

6. Add a component:

```bash
npx @beaket/ui add button
```

## Next.js

Tailwind CSS is pre-configured in Next.js.

1. Initialize Beaket UI:

```bash
npx @beaket/ui init
```

2. Add a component:

```bash
npx @beaket/ui add button
```
