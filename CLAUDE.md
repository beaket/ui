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
- **CSS tokens, two layers**: `src/themes/semantic.css` holds the 68 semantic names components use (authored once, shared by every theme). Each theme (`solace`, `porcelain`, `tobacco`, `marigold`, `eucalyptus`) authors only its 30-value palette (`--surface-0…2`, `--tone-0…11`, `--signal-*`, `--signal-*-on`, `--shadow-size`, `--shadow-color`, `--shadow-color-overlay`) in `src/themes/<theme>.css`. Of those, 27 are functional dependencies of the semantic layer. `--tone-8…10` are reserved to preserve the public 12-step neutral-ramp contract and provide future deep-ink roles; components do not currently consume them. Storybook imports `semantic.css` + `solace.css` via `src/styles.css`; CLI injects semantic + chosen palette at `init`.

## Design Rules

Ink & Instrument design system. No gradients, no border-radius (except Radio), no blur shadows, no opacity for styling. Components use **only the 68 semantic tokens** from `src/themes/semantic.css` — never theme palette values (`--tone-*`, `--surface-*`, `--signal-*`) and never raw colors.

| Do                                                                                                                                                                 | Don't                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `bg-bg` / `bg-bg-raised` (cards) / `bg-bg-overlay` (dialogs, menus) / `bg-bg-input`                                                                                | `bg-white`, `opacity-50`, `rounded-lg`                                                      |
| `text-fg`, `text-fg-muted` (secondary), `text-fg-subtle` (placeholders), `text-fg-link`                                                                            | Raw hex or Tailwind default palette                                                         |
| `border-border`, `border-border-muted` (dividers, disabled), `border-border-strong` (inputs)                                                                       | Palette values like `--tone-4`                                                              |
| `hover:shadow-offset-action` + `data-[state=open]:shadow-offset-action-hover` (pressables) / `shadow-offset` (surfaces) / `shadow-offset-overlay` (dialogs, menus) | `shadow-md`/`shadow-lg` (blur), standing accent on idle pressables, accent edge on surfaces |
| `focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2`                                                                        | Inconsistent focus patterns                                                                 |
| `disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled`                                                            | Inconsistent disabled patterns                                                              |
| `before:absolute before:inset-[-14px] before:content-['']` on small controls                                                                                       | Touch targets below 44px                                                                    |
| `bg-bg-emphasis` + `text-fg-on-emphasis` for primary/checked/tooltips/pagination current                                                                           | Signal solids without their knockout                                                        |
| Role solids paired with their knockout: `bg-danger-solid text-danger-fg-on-solid` (+ `-hover`/`-active`)                                                           | Hand-picked text colors on solids                                                           |
| Role tints: `bg-{role}-bg` + `border-{role}-border` + `text-{role}-fg`                                                                                             | Mixing roles (e.g. warning text on info tint)                                               |

Roles: `danger`, `success`, `warning`, `info`, `info-alt`, `accent` — 7 slots each (`-solid`, `-fg-on-solid`, `-solid-hover`, `-solid-active`, `-fg`, `-bg`, `-border`). Accent alone adds `-bg-subtle` (faintest wash — the lens fill: navigation, tabs).

### Accent hierarchy and state precedence

Accent is a scarce state signal, not a permanent synonym for “interactive.” Persistent affordance comes from neutral material (ink fill, border, label, or geometry), so dense screens do not become a field of equally loud marks. Highest priority wins within a visual channel:

| Priority | State                              | Channel                                                                                                                                                                                              |
| -------: | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        1 | Keyboard focus                     | A 2px offset outline on pressables; the cap-off edge on writing fields. Invalid focus replaces accent with danger.                                                                                   |
|        2 | Open ownership / active engagement | A grown offset edge on overlay owners; a 2px inset leading rule on the active menu row. Pointer press temporarily wins with physical translation + active fill and drops any hover edge.             |
|        3 | Hover intent                       | A thin offset edge on edged pressables, or a neutral tint/text change where an edge would be too dense.                                                                                              |
|        4 | Current selection                  | A faint lens fill and neutral rim for navigation/tabs, or ink fill plus position/indicator for native choices. Selection never borrows the focus outline.                                            |
|        5 | Persistent affordance              | Neutral border, ink surface, label, and geometry only. No standing accent edge. Primary emphasis is the ink-filled surface alone; accent joins it only for hover, open ownership, or keyboard focus. |
|        6 | Content navigation                 | Accent text plus hover underline for ordinary links. Breadcrumb ancestors deliberately stay muted and darken on hover.                                                                               |

Only spatially distinct channels may stack: keyboard focus may coexist with one lower-priority context cue, most importantly an outer focus outline around an open-owner edge or selected fill. Two cues must never compete in the same channel: open replaces hover edge, press drops the edge, selected styling does not add an outline, and invalid focus replaces (rather than layers over) the accent focus color. Disabled removes interaction edges and focus treatment. This makes a focused target unmistakable even among selected and open controls.

Pressables are neutral at rest. Edged buttons and interactive cards reveal `shadow-offset-action` on hover; an overlay trigger holds the grown `shadow-offset-action-hover` while open. Ghost and link buttons keep their tint/underline and never gain an edge. Active press uses `active:shadow-none active:translate-x-px active:translate-y-px`. Radix supplies `data-state="open"` to `asChild` Button triggers; ordinary Buttons are unaffected. **Select** is field-surfaced and stays quiet at rest and hover, but as a pressable it keeps the keyboard outline and holds the grown edge while open. Dialog and Sheet triggers inherit their trigger component's policy; their open cue is obscured by the modal scrim and must not add another decoration.

Small controls (checkbox, switch, radio) and pagination are **instruments**: the neutral chassis stays put, while hover may reveal a thin edge and active press moves the indicator, thumb, or label. Checked state uses ink fill plus an indicator/position, not accent. Navigation and tabs are **lens** instruments: cells fuse on neutral hairlines and the current page/tab gets a subtle accent lens (`bg-accent-bg-subtle`) with a neutral rim; the strip has no standing edge. **Breadcrumb** is a trail rather than a switcher, so ancestors are muted, the current page is full ink, hover darkens, and only keyboard focus uses accent.

Writing fields (Input and Textarea) are quiet at rest and **cap-off** on focus: no outline, a static action edge instead (`focus:outline-hidden not-read-only:focus:shadow-offset-action`), with danger replacing the edge when invalid. Read-only focus uses the grey surface shade. The caret is accent and text selection uses the accent tint. **Menu and Select rows** use an accent tint plus a 2px inset leading rule for the currently navigated row; an open submenu holds that same cue, and destructive rows replace it with danger. Raised surfaces keep the static grey `shadow-offset` / `shadow-offset-overlay`. Sizes vary by theme (Solace: 1px).

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
