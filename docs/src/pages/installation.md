---
layout: ../layouts/doc.astro
title: Installation
---

# Installation

## Quick Start

```bash
npx @beaket/ui init
npx @beaket/ui add button
```

## Requirements

- React 18+
- Tailwind CSS 4+
- Path alias `@/` configured

## Tailwind CSS 4 Setup

### Vite / React Router v7

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Next.js

```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

### CSS

Add to your main CSS file:

```css
@import "tailwindcss";
```

## Path Alias Setup

Components use `@/` imports.

### Vite

```ts
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

```json
// tsconfig.json or tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Next.js

Already configured by default.

## What init does

- Creates `beaket.json` configuration
- Adds CSS variables to your stylesheet
- Creates `cn()` utility function
- Installs `clsx` and `tailwind-merge`
