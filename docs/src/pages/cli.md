---
layout: ../layouts/doc.astro
title: CLI
---

# CLI

## init

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

## diff

```bash
npx @beaket/ui diff
npx @beaket/ui diff button
```

Checks copied components against the current registry without changing files.
Use it before overwriting a customized component: a difference can be either an
upstream update or your own edit.

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
