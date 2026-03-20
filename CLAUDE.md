# CLAUDE.md

Copy-paste component library (like shadcn/ui). Package: `@beaket/ui`.

**When creating or updating components, read `.impeccable.md` for design context and principles.**

## Architecture

- **Self-contained**: Each component includes its own `cn` utility. No shared imports.
- **Dependencies in registry**: List npm packages in `registry/registry.json`.
- **CSS tokens**: `src/css-variables.css` (injected by CLI), `src/styles.css` (Storybook only).

## Design Rules

Brutalist design system. No gradients, no border-radius (except Radio), no blur shadows, no opacity for styling. Use design tokens from `styles.css`.

| Do                                                                                         | Don't                                  |
| ------------------------------------------------------------------------------------------ | -------------------------------------- |
| `bg-paper`, `text-ink`, `border-chrome`                                                    | `bg-white`, `opacity-50`, `rounded-lg` |
| `shadow-offset` / `shadow-offset-dark`                                                     | `shadow-md`, `shadow-lg` (blur)        |
| `focus-visible:outline-2 focus-visible:outline-signal-blue focus-visible:outline-offset-2` | Inconsistent focus patterns            |
| `disabled:border-dashed disabled:border-chrome disabled:bg-frost disabled:text-steel`      | Inconsistent disabled patterns         |
| `before:absolute before:inset-[-14px] before:content-['']` on small controls               | Touch targets below 44px               |

Shadow states: default `2px 2px`, hover `3px 3px`, active `1px 1px`, disabled `none`.

## Component Template

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function ComponentName({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="component-name" className={cn("base-styles", className)} {...props} />;
}
```

**Compound pattern** for sub-components: `Dialog.Title`, `Dialog.Footer` — not individually exported.

**Controlled/uncontrolled**: Support both via internal state + `open`/`onOpenChange` props. Warn in dev if `open` provided without `onOpenChange`.

## Required Checklist

When creating a component, you **must** create all of:

- [ ] `src/components/[name].tsx` — Component with `data-slot`, `cn`, design tokens
- [ ] `src/components/[name].stories.tsx` — Storybook with `tags: ["autodocs"]` + interaction tests via `play` function
- [ ] `registry/registry.json` — Register with dependencies and docs sections
- [ ] `.changeset/*.md` — Package name must be `@beaket/ui` (minor for new/feature, patch for fix, major for breaking)

**Testing portals**: Use `screen` (not `canvasElement`) for Dialog, Popover, etc. Don't mock `onOpenChange` with `fn()`.
