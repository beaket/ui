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
