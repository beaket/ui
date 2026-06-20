# CLAUDE.md

Copy-paste component library (like shadcn/ui). Package: `@beaket/ui`.

**When creating or updating components, read `.impeccable.md` for design context and principles.**

## Two kinds of packages in this monorepo

1. **Registry components** (`src/components/*`) — copy-paste, distributed via the CLI's `add`, self-contained with their own `cn`. These follow the **Required Checklist** below.
2. **Standalone npm packages** (`packages/*`) — published to npm and `npm install`ed, not copied. Currently `@beaket/ui` (the CLI, in `packages/cli`) and `@beaket/paper` (the markdown editor, in `packages/paper`).

The editor (`@beaket/paper`) is **exempt from the component checklist** — no registry entry, no `.stories.tsx`, no `cn`/Tailwind. It ships its own CodeMirror theme + types. Its docs are a **standalone Astro site** at `sites/paper/` (own landing/brand + live playground), separate from the `@beaket/ui` docs in `docs/`. Both kinds release through the same changeset flow.

**`@beaket/paper` decisions:** read `packages/paper/docs/DECISIONS.md` for load-bearing decisions, and follow `packages/paper/docs/adr/README.md` for when/how to write an ADR (decisions only — routine bug/perf fixes get a changeset whose body states the root cause, not an ADR).

## Architecture

- **Self-contained**: Each component includes its own `cn` utility. No shared imports.
- **Dependencies in registry**: List npm packages in `registry/registry.json`.
- **CSS tokens**: `src/themes/*.css`. Single source of truth — Storybook imports `porcelain.css` via `src/styles.css`; CLI injects the chosen theme at `init`.

## Design Rules

Brutalist design system. No gradients, no border-radius (except Radio), no blur shadows, no opacity for styling. Use design tokens from `styles.css`.

| Do                                                                                         | Don't                                  |
| ------------------------------------------------------------------------------------------ | -------------------------------------- |
| `bg-paper`, `text-ink`, `border-chrome`                                                    | `bg-white`, `opacity-50`, `rounded-lg` |
| `shadow-offset` / `shadow-offset-dark`                                                     | `shadow-md`, `shadow-lg` (blur)        |
| `focus-visible:outline-2 focus-visible:outline-signal-blue focus-visible:outline-offset-2` | Inconsistent focus patterns            |
| `disabled:border-dashed disabled:border-chrome disabled:bg-frost disabled:text-steel`      | Inconsistent disabled patterns         |
| `before:absolute before:inset-[-14px] before:content-['']` on small controls               | Touch targets below 44px               |
| `bg-branch` for active nav/tabs/pagination/badges, `bg-ink` for text/tooltips/checked      | Using `bg-ink` for brand surfaces      |

Shadow states: default, hover (grows), active (shrinks), disabled `none`. Sizes vary by theme.

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
- [ ] `.changeset/*.md` — Package name must be `@beaket/ui` (minor for new/feature, patch for fix). **NEVER use `major` — see `docs/git-rules.md`**

**Testing portals**: Use `screen` (not `canvasElement`) for Dialog, Popover, etc. Don't mock `onOpenChange` with `fn()`.
