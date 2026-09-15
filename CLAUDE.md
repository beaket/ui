# CLAUDE.md

Copy-paste component library (like shadcn/ui). Package: `@beaket/ui`.

**When creating or updating components, read `DESIGN.md` for the visual system and `PRODUCT.md` for product truth.**

## Two kinds of packages in this monorepo

1. **Registry components** (`src/components/*`) — copy-paste, distributed via the CLI's `add`, self-contained with their own `cn`. These follow the **Required Checklist** below.
2. **Standalone npm packages** (`packages/*`) — published to npm and `npm install`ed, not copied. Currently `@beaket/ui` (the CLI, in `packages/cli`) and `@beaket/paper` (the markdown editor, in `packages/paper`).

The editor (`@beaket/paper`) is **exempt from the component checklist** — no registry entry, no `.stories.tsx`, no `cn`/Tailwind. It ships its own CodeMirror theme + types. Its docs are a **standalone Astro site** at `sites/paper/` (own landing/brand + live playground), separate from the `@beaket/ui` docs in `docs/`. Both kinds release through the same changeset flow.

**`@beaket/paper` decisions:** read `packages/paper/docs/CONTEXT.md` (orientation map — modules, glossary, invariants) before editing, `packages/paper/docs/DECISIONS.md` for load-bearing decisions, and follow `packages/paper/docs/adr/README.md` for when/how to write an ADR (decisions only — routine bug/perf fixes get a changeset whose body states the root cause, not an ADR). `packages/paper/docs/MAINTENANCE.md` describes the improvement queue, the `agent:ready` Definition of Ready, and the release cadence.

## Architecture

- **Self-contained**: Each component includes its own `cn` utility. No shared imports.
- **Dependencies in registry**: List npm packages in `registry/registry.json`.
- **CSS tokens, two layers**: `src/themes/semantic.css` holds the 69 semantic names components use (authored once, shared by every theme). Each theme (`solace`, `porcelain`, `tobacco`, `marigold`, `eucalyptus`) authors only its 30-value palette (`--surface-0…2`, `--tone-0…11`, `--signal-*`, `--signal-*-on`, `--shadow-size`, `--shadow-color`, `--shadow-color-overlay`) in `src/themes/<theme>.css`. Of those, 28 are functional dependencies of the semantic layer. `--tone-8` and `--tone-9` are reserved to preserve the public 12-step neutral-ramp contract and provide future deep-ink roles; components do not currently consume them. Storybook imports `semantic.css` + `solace.css` via `src/styles.css`; CLI injects semantic + chosen palette at `init`.
- **Semantic names only**: components read the semantic layer and nothing below it — never a theme palette value (`--tone-*`, `--surface-*`, `--signal-*`), never a raw color. This is what makes a palette swap total.

## Design Rules

**`DESIGN.md` at the repo root is the visual authority. Read it before writing or
changing any component style.** It holds the Ink & Instrument world, the palette
and its roles, the type scale, the elevation vocabulary, the state-precedence
table, the per-component specifications, and the Do's and Don'ts.
`.impeccable/design.json` is the same system in machine-readable form, and
`PRODUCT.md` holds the product truth behind it.

Nothing about the visual system is restated here. The one rule that is
architecture rather than aesthetics — semantic names only — lives in
§ Architecture above, because it decides file layout.

## Component Template

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function ComponentName({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="component-name" className={cn("base-styles", className)} {...props} />;
}
```

**Compound pattern** for sub-components: `Dialog.Title`, `Dialog.Footer`. Also export each part by name (`DialogTitle`, `DialogFooter`) for React Server Components; attached properties do not cross client-module boundaries (#923 supersedes #871).

**Controlled/uncontrolled**: Support both via internal state + `open`/`onOpenChange` props. Warn in dev if `open` provided without `onOpenChange`.

## Required Checklist

API shape is decided before this list starts: `docs/component-api-patterns.md` **Part 5 — Checklist for a new component** is the 14 steps that lead here (compound packaging, `asChild`, `data-slot`, `<Component>Props`, sugar over a compositional path). Step 14 is this list.

When creating a component, you **must** create all of:

- [ ] `src/components/[name].tsx` — Component with `data-slot`, `cn`, design tokens
- [ ] `src/components/[name].stories.tsx` — Storybook with `tags: ["autodocs"]` + interaction tests via `play` function
- [ ] `registry/registry.json` — Register with dependencies and docs sections
- [ ] `.changeset/*.md` — Package name must be `@beaket/ui`; a new component is `minor`, while any other release type follows `docs/git-rules.md`. `major` requires explicit maintainer approval.

**Testing portals**: Use `screen` (not `canvasElement`) for Dialog, Popover, etc. Don't mock `onOpenChange` with `fn()`.
