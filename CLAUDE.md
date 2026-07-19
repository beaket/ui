# CLAUDE.md

Copy-paste component library (like shadcn/ui). Package: `@beaket/ui`.

**When creating or updating components, read `.impeccable.md` for design context and principles.**

## Two kinds of packages in this monorepo

1. **Registry components** (`src/components/*`) — copy-paste, distributed via the CLI's `add`, self-contained with their own `cn`. These follow the **Required Checklist** below.
2. **Standalone npm packages** (`packages/*`) — published to npm and `npm install`ed, not copied. Currently `@beaket/ui` (the CLI, in `packages/cli`) and `@beaket/paper` (the markdown editor, in `packages/paper`).

The editor (`@beaket/paper`) is **exempt from the component checklist** — no registry entry, no `.stories.tsx`, no `cn`/Tailwind. It ships its own CodeMirror theme + types. Its docs are a **standalone Astro site** at `sites/paper/` (own landing/brand + live playground), separate from the `@beaket/ui` docs in `docs/`. Both kinds release through the same changeset flow.

**`@beaket/paper` decisions:** read `packages/paper/docs/CONTEXT.md` (orientation map — modules, glossary, invariants) before editing, `packages/paper/docs/DECISIONS.md` for load-bearing decisions, and follow `packages/paper/docs/adr/README.md` for when/how to write an ADR (decisions only — routine bug/perf fixes get a changeset whose body states the root cause, not an ADR). `packages/paper/docs/MAINTENANCE.md` describes the improvement queue, the `agent:ready` Definition of Ready, and the release cadence.

## Architecture

- **Self-contained**: Each component includes its own `cn` utility. No shared imports.
- **Dependencies in registry**: List npm packages in `registry/registry.json`.
- **CSS tokens, two layers**: `src/themes/semantic.css` holds the 68 semantic names components use (authored once, shared by every theme). Each theme (`solace`, `porcelain`, `tobacco`, `marigold`, `eucalyptus`) authors only its 32-value palette (`--surface-*`, `--tone-0…11`, `--signal-*`, `--signal-*-on`, `--shadow-*`) in `src/themes/<theme>.css`. Storybook imports `semantic.css` + `solace.css` via `src/styles.css`; CLI injects semantic + chosen palette at `init`.

## Design Rules

Ink & Instrument design system. No gradients, no border-radius (except Radio), no blur shadows, no opacity for styling. Components use **only the 68 semantic tokens** from `src/themes/semantic.css` — never theme palette values (`--tone-*`, `--surface-*`, `--signal-*`) and never raw colors.

| Do                                                                                                                                               | Don't                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `bg-bg` / `bg-bg-raised` (cards) / `bg-bg-overlay` (dialogs, menus) / `bg-bg-input`                                                              | `bg-white`, `opacity-50`, `rounded-lg`                                            |
| `text-fg`, `text-fg-muted` (secondary), `text-fg-subtle` (placeholders), `text-fg-link`                                                          | Raw hex or Tailwind default palette                                               |
| `border-border`, `border-border-muted` (dividers, disabled), `border-border-strong` (inputs)                                                     | Palette values like `--tone-4`                                                    |
| `shadow-offset-action` + `hover:shadow-offset-action-hover` (pressables) / `shadow-offset` (surfaces) / `shadow-offset-overlay` (dialogs, menus) | `shadow-md`/`shadow-lg` (blur), grey shade on pressables, accent edge on surfaces |
| `focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2`                                                      | Inconsistent focus patterns                                                       |
| `disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled`                                          | Inconsistent disabled patterns                                                    |
| `before:absolute before:inset-[-14px] before:content-['']` on small controls                                                                     | Touch targets below 44px                                                          |
| `bg-bg-emphasis` + `text-fg-on-emphasis` for primary/checked/tooltips/pagination current                                                         | Signal solids without their knockout                                              |
| Role solids paired with their knockout: `bg-danger-solid text-danger-fg-on-solid` (+ `-hover`/`-active`)                                         | Hand-picked text colors on solids                                                 |
| Role tints: `bg-{role}-bg` + `border-{role}-border` + `text-{role}-fg`                                                                           | Mixing roles (e.g. warning text on info tint)                                     |

Roles: `danger`, `success`, `warning`, `info`, `info-alt`, `accent` — 7 slots each (`-solid`, `-fg-on-solid`, `-solid-hover`, `-solid-active`, `-fg`, `-bg`, `-border`). Accent alone adds `-bg-subtle` (faintest wash — the lens fill: navigation, tabs).

Shadow states — pressables: rest = thin accent edge (`shadow-offset-action`), hover grows (`hover:shadow-offset-action-hover`), active drops onto the edge (`active:shadow-none active:translate-x-px active:translate-y-px`), disabled `none`. **Held open** — an overlay trigger holds its hover state while the overlay is open: the grown edge stays, variant-aware (`data-[state=open]:` mirrors `hover:`; ghost/link keep their tint/underline with no edge). It's the active owner and still pressable — a lifted state, not a drop. On a **Button** trigger Radix sets `data-[state=open]` only via `asChild`, so it's inert on ordinary buttons; a **native Radix trigger carries `data-[state=open]` directly** — so the **Select** trigger, though it sits among the form fields, is a held-open pressable (it _opens_ a menu, it isn't written in): it takes the full Button edge grammar (thin `shadow-offset-action` at rest, grown on hover, held grown while open, `active:` drop, `disabled:shadow-none`), keyboard focus keeps the ring, and invalid recolors border + ring to danger while the pressable edge stays accent (role-agnostic, exactly as on a destructive Button — danger rides the focus indicator, and on a pressable that's the ring, so the edge is left free). Modal (dialog/sheet) triggers sit behind the scrim so the held edge is unseen. Instruments (small controls: checkbox/switch/radio; fused strips: pagination): the chassis keeps a **static** accent edge (no hover growth, no drop) and pressing travels the inner key (indicator/thumb/label) 1px instead; hover is a surface tint. Navigation and tabs are the **lens** instruments (the glass belongs to the navigation layer): the strip fuses on hairlines (`border-border-muted`) under one static accent edge, and the current page/tab sits under a glass plate instead of an ink stamp — `after:` inset 4px, hairline top/left rim, `border-strong` ink bottom/right rim (ink gathers where every shadow falls), `bg-accent-bg-subtle` fill, plate beneath the type so the label keeps full ink. **Breadcrumb** is the navigation layer's other half — a _trail_, not a switcher (a sentence read left to right), so it is deliberately **not** the lens: no fused strip, no glass plate. It stays in one ink — ancestor links `text-fg-muted`, current page full ink (`text-fg font-medium`) — spends no standing accent on the row of links, darkens the pointed step from muted to full ink (`hover:text-fg`, `no-underline`: the darkening is the affordance, not a link-blue), and keeps the one accent mark for the keyboard focus ring (a link is not a key — no pressable edge). Writing fields — input and textarea, the fields you _write_ in (the Select trigger _opens_ a menu, so it's held-open, above) — are quiet at rest and **cap-off** on focus: no ring — a static action edge appears while engaged (`focus:outline-hidden not-read-only:focus:shadow-offset-action`; invalid swaps to `-action-danger` — a cap-off field has no ring, so this edge _is_ its focus indicator (the ring's stand-in) and carries the danger just as the ring does elsewhere; focused read-only shows the grey `shadow-offset` instead), no hover response, caret is the pen (`caret-accent-solid` + `selection:bg-accent-bg`), read-only frame retreats to `border-border-muted` with full-ink value. **Menu rows** (dropdown) mark the highlighted/active row — the one you'd activate — with the accent, not an ink stamp: an `accent-bg` wash + a 2px accent left-rule (`focus:shadow-[inset_2px_0_0_0_var(--color-accent-solid)]` — the engaged-edge weight, matching a hovered button's grown edge), ink text kept full; the shortcut goes `accent-fg`; destructive swaps to `danger-bg` + a danger rule; the sub-trigger holds the same mark while its submenu is open; the panel floats on `shadow-offset-overlay`. Surfaces keep the static grey `shadow-offset` / `-overlay`. Sizes vary by theme (solace: 1px).

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
