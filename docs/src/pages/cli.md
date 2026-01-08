---
layout: ../layouts/doc.astro
title: CLI
---

# CLI

## Commands

### init

Initialize Beaket UI in your project.

```bash
npx @beaket/ui init
```

This command:

- Detects your project type (Vite, Next.js)
- Creates `beaket.ui.json` config file
- Adds CSS design tokens to your stylesheet

### add

Add components to your project.

```bash
# Add a single component
npx @beaket/ui add button

# Add multiple components
npx @beaket/ui add alert button label
```

## Options

### init

| Option | Description                   |
| ------ | ----------------------------- |
| `-y`   | Skip prompts and use defaults |

### add

| Option              | Description                        |
| ------------------- | ---------------------------------- |
| `--overwrite`, `-o` | Overwrite existing component files |

## Help

```bash
npx @beaket/ui --help
npx @beaket/ui init --help
npx @beaket/ui add --help
```
