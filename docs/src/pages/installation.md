---
layout: ../layouts/doc.astro
section: Manual
title: Installation
---

# Installation

Beaket UI adds components to an existing React and Tailwind project. Point the
`@` alias at your source directory, run `init` to write the tokens, then copy in
the parts you need.

## Requirements

- React >=19.0.0 (`tabs` requires React >=19.2.0; `data-table` requires React >=19.2.0)
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
"paths": {
  "@/*": ["./src/*"]
}
```

### Next.js

Keep the default `@/*` alias, Tailwind CSS 4, and the global CSS import in your
App Router layout. Hook-based components already declare `"use client"`; your
page can stay a Server Component.

In a server page, import compound parts **by name**. Attached properties such
as `Tabs.List` do not cross a client-module boundary:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Page() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
    </Tabs>
  );
}
```

Run `npx @beaket/ui add tabs` for this example. `Tabs.List` and the other
compound forms still work inside Client Components. Event handlers and
function props (for example, DataTable cell renderers or Pagination's
`buildPageUrl`) belong in a Client Component too. For Dialog and Sheet in a
server page, use `trigger={<Button>Open</Button>}` with named content parts.

### PostCSS alternative

Tailwind's PostCSS plugin is supported too. On Vite, use it **instead of**
`@tailwindcss/vite`; keep the React plugin and both alias configurations above.
Next.js projects created with Tailwind already include this PostCSS setup.

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

```js
// postcss.config.mjs
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

Keep `@import "tailwindcss";` in your global CSS and import that stylesheet
from your app entry or layout. See the [Tailwind PostCSS setup](https://tailwindcss.com/docs/installation/using-postcss).

## Initialize

```bash
npx @beaket/ui init
```

`init` writes the complete Beaket foundation into that CSS file: type scale,
font stacks and weights, line heights, spacing, borders, radii, semantic
tokens, and the selected color and shadow palette. The generated block is
marked so later `add` and `theme` commands can update it without touching the
rest of your stylesheet.

Or with a [theme](/ui/themes):

```bash
npx @beaket/ui init --theme tobacco
```

## Add Components

```bash
npx @beaket/ui add button
```

With the Vite setup above, the default destination is `src/components/ui/`, so
you can import a component like this. This import requires the matching
TypeScript **and bundler** aliases from [Vite setup](#vite), or Next.js's default alias:

```tsx
import { Button } from "@/components/ui/button";
```

If you chose a different component directory during `init`, import from that
directory instead.

See [CLI](/ui/cli) for all options.

## Icons

Beaket UI does not ship an icon set of its own. Components that draw a fixed
glyph — the check in Checkbox, the chevrons in Select and Pagination, the close
button in Dialog and Sheet — import it from
[Lucide](https://lucide.dev/), and `add` installs `lucide-react` for exactly
those components. Nothing else requires it.

Where you supply the icon — an Input `prefix` or `suffix`, the children of a
menu item or button — you pass a React element, so any icon library works. Lucide is the
default only because the shipped components already use it.

An icon-only control still needs an accessible name, and the icon inside it is
decoration, hidden from assistive technology:

```tsx
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddRowButton() {
  return (
    <Button size="icon" aria-label="Add row">
      <Plus aria-hidden="true" />
    </Button>
  );
}
```
