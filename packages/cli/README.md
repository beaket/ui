# @beaket/ui

Copy-paste component library for React. Brutalist design system with multiple themes.

Components are copied into your project — you own the code.

[Documentation](https://beaket.github.io/ui/) · [Themes](https://beaket.github.io/ui/themes) · [Components](https://beaket.github.io/ui/components)

## Quick Start

```bash
npx @beaket/ui init
npx @beaket/ui add button
```

```tsx
import { Button } from "@/components/ui/button";
```

## Requirements

- React 18+
- Tailwind CSS 4+
- TypeScript

Supports **Vite** and **Next.js**. Paths and CSS files are auto-detected.

## CLI Reference

### `init`

Set up configuration, select a theme, and inject CSS tokens.

```bash
npx @beaket/ui init [options]
```

| Option           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `-y, --yes`      | Skip prompts, use defaults                               |
| `--theme <name>` | Pre-select a [theme](https://beaket.github.io/ui/themes) |

Creates `beaket.ui.json` in your project root.

### `add`

Add [components](https://beaket.github.io/ui/components) to your project. Dependencies are installed automatically.

```bash
npx @beaket/ui add <components...> [options]
```

| Option            | Description              |
| ----------------- | ------------------------ |
| `-o, --overwrite` | Overwrite existing files |

## License

MIT
