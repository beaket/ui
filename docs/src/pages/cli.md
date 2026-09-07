---
layout: ../layouts/doc.astro
title: CLI
---

# CLI

## init

`init` and `add` require TypeScript (declared in the project or resolved from a
workspace toolchain) and a `tsconfig*.json` file. Plain-JavaScript/.jsx output is
not supported; missing requirements stop the command before it changes files.

```bash
npx @beaket/ui init
```

Prompts for:

1. **Component directory** — where component files are placed (auto-detected from tsconfig)
2. **CSS file** — where design tokens are written (auto-detected from framework)
3. **Theme** — `solace`, `porcelain`, `tobacco`, `marigold`, or `eucalyptus`

Creates `beaket.ui.json` with the component directory, CSS file, and selected theme.
It also writes the complete design-system foundation into the CSS file: type,
spacing, borders, radii, semantic tokens, and the selected palette.

Before writing, `init` checks installed Tailwind v4, the selected CSS import,
Tailwind's Vite/PostCSS plugin, and whether Vite's resolved aliases match the
detected TypeScript source alias. Missing or unverified setup ends with
**Initialized with setup warnings**, not a ready message. Warnings do not prevent
copying components: their internal imports are relative. Next.js uses TypeScript
paths natively; other bundlers need a manual check.

If TypeScript paths exist but Vite's alias is missing, interactive `init` offers
to enable native `resolve.tsconfigPaths` in Vite 8+. It edits only literal
`export default { ... }` / `defineConfig({ ... })` configurations after explicit
confirmation, and saves a numbered backup first. Dynamic configs, conflicting
aliases, and older Vite versions get manual instructions. `--yes` never rewrites
toolchain configuration. Missing TypeScript paths also require a manual edit;
existing compiler options remain untouched.

Plugin detection recognizes resolved Vite plugins and common literal PostCSS
configurations (ESM default object/variable or CommonJS object). Dynamic PostCSS
configuration may report an unverified warning. These checks do not replace
running your application's build. See [Installation](/ui/installation) for both
Tailwind plugin options.

| Option           | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `-y`, `--yes`    | Skip prompts, use detected defaults and the solace theme              |
| `--theme <name>` | Set theme: `solace`, `porcelain`, `tobacco`, `marigold`, `eucalyptus` |

```bash
npx @beaket/ui init --theme tobacco
```

See [Themes](/ui/themes) for an interactive preview.

Re-running `init` preserves existing configuration and CSS. To switch an initialized
project, use `theme --theme <name>` instead.

## list

```bash
npx @beaket/ui list
npx @beaket/ui list table
```

Lists names and descriptions from the registry without initializing or changing
a project. The optional query is a case-insensitive substring of either field.
Like `add`, it defaults to the CLI's matching release registry; use
`--registry-ref <tag|sha>` or `--latest` to inspect a different version.

## add

```bash
npx @beaket/ui add button
npx @beaket/ui add alert button label
```

Copies component files and their transitive registry dependencies to your project,
and installs their npm dependencies (`clsx`, `tailwind-merge`, Radix primitives, etc.) automatically.

| Option              | Description                               |
| ------------------- | ----------------------------------------- |
| `-o`, `--overwrite` | Discard local edits after saving a backup |

When a file already exists, `add` compares it with the registry. Matching files
are left alone; changed files prompt before they are overwritten.
Every replacement saves the previous file as `.bak`, then `.bak.1`, `.bak.2`, and
so on. Review the diff or hand-merge customizations before choosing to overwrite.

`add` and `diff` use the registry tag matching the CLI version (`@beaket/ui@X.Y.Z`).
Pass `--registry-ref <tag|sha>` to choose a version, or `--latest` to explicitly use
the current commit on `main`. The two options cannot be combined. Historical
releases 2.8.0 and 3.0.0 have no tags; select a tagged release or explicitly opt into
`--latest` when a tag is missing. The CLI never silently falls back to `main`.

Commit `beaket.ui.json`: its `installed` entries record the registry ref, SHA-256
content hash and CLI version for each copied file. Skipped local edits retain their
previous baseline. Upgrading the CLI itself does not update copied components.

## diff

```bash
npx @beaket/ui diff
npx @beaket/ui diff button
```

Compares the installed baseline, your local copy and the target registry without
changing files. A single-component diff shows upstream edits and local edits
separately. When both sides changed, Git's merge algorithm detects conflicts;
Git must be installed for that comparison. Line counts count additions and
removals; conflict counts describe conflicting regions, not individual lines.

| Exit code | Meaning                                          |
| --------- | ------------------------------------------------ |
| 0         | Clean, or only your local customizations changed |
| 1         | Upstream changes can be merged                   |
| 2         | Upstream and local changes conflict              |
| 3         | Missing baseline or an operational error         |

Older installs have no baseline: differing files get an explicit unknown-baseline
result and a two-way diff. Do not overwrite a customized file just to establish a
baseline. Review and hand-merge first. Automatic merging is not implemented.

## theme

```bash
npx @beaket/ui theme
npx @beaket/ui theme --theme eucalyptus
```

Rewrites the saved project's theme tokens in its configured CSS file. Without
`--theme`, it syncs the theme already recorded in `beaket.ui.json`.
Changed tokens prompt for confirmation (default: No). `-o` / `--overwrite` skips
the prompt; replacements save a numbered backup of the stylesheet. Declining a
theme switch preserves both the configuration and CSS. Overrides outside the
managed markers survive a sync.

`theme --diff` previews managed-token changes; `theme --dry-run` previews the
operation. Neither writes CSS, configuration or backups, even with `--overwrite`.
The managed block has a `DO NOT EDIT` header and a stored `themeHash` in
`beaket.ui.json`; a mismatch warns that it was hand-edited. Put custom values
in the override stub outside the markers, retaining its selectors for light,
system-dark and forced-dark modes. See [Themes](/ui/themes) for the `data-theme`
contract, selector specificity and reduced-motion behavior.
