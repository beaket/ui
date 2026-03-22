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
3. **Theme** — `porcelain`, `tobacco`, `marigold`, or `eucalyptus`

Creates `beaket.ui.json` with your component path and selected theme.

| Option           | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `-y`             | Skip prompts, use defaults (porcelain theme)                |
| `--theme <name>` | Set theme: `porcelain`, `tobacco`, `marigold`, `eucalyptus` |

```bash
npx @beaket/ui init --theme tobacco
```

See [Themes](/ui/themes) for an interactive preview.

## add

```bash
npx @beaket/ui add button
npx @beaket/ui add alert button label
```

Copies component files to your project and installs their dependencies (`clsx`, `tailwind-merge`, Radix primitives, etc.) automatically.

| Option              | Description                        |
| ------------------- | ---------------------------------- |
| `-o`, `--overwrite` | Overwrite existing component files |
