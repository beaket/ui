---
layout: ../layouts/doc.astro
title: Installation
---

# Installation

## Requirements

- React 18+
- Tailwind CSS 4+
- TypeScript

Beaket UI adds components to an existing React and Tailwind project. If you
don't have one yet, create a Vite app first:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm install tailwindcss @tailwindcss/vite
```

## Setup

### Vite

Add Tailwind and the `@` alias to `vite.config.ts`. The TypeScript path below
only helps TypeScript; Vite needs its own alias too.

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

Then add Tailwind to `src/index.css`:

```css
@import "tailwindcss";
```

Finally, configure the matching TypeScript alias:

```json
// tsconfig.app.json → compilerOptions
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

### Next.js

Apps created with the default `@/*` alias work without extra configuration.
Make sure Tailwind CSS 4 is already installed and that your global CSS file is
loaded by the app.

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

With the Vite setup above, the default destination is `src/components/ui/`, so
you can import a component like this:

```tsx
import { Button } from "@/components/ui/button";
```

If you chose a different component directory during `init`, import from that
directory instead.

See [CLI](/ui/cli) for all options.
