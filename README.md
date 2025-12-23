# Beaket UI CLI

Beaket UI uses a CLI to add components to your project. Components are copied directly into your codebase, giving you full control.

## Installation

No installation required. Use `npx` to run the CLI.

## Commands

### `init`

Initialize Beaket UI in your project:

```bash
npx beaket-ui init
```

This will:

1. Create `beaket.json` configuration file
2. Create `src/lib/utils.ts` with the `cn()` utility function
3. Install `clsx` and `tailwind-merge` dependencies

### `add`

Add a component to your project:

```bash
npx beaket-ui add button
```

This will copy the component files to your configured components directory.

## Configuration

The `beaket.json` file stores your project configuration:

```json
{
  "$schema": "https://beaket.dev/schema.json",
  "tailwind": {
    "css": "src/styles.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib"
  },
  "paths": {
    "components": "src/components",
    "utils": "src/lib"
  }
}
```

## Available Components

- `button` - Button component with variants (primary, secondary, outline) and sizes (sm, md, lg)

## Example Usage

After adding a component:

```tsx
import { Button } from "@/components/button";

export function MyComponent() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```
