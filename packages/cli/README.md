# @beaket/ui

Copy-paste component library for React. Ink & Instrument design system with multiple themes.

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

- React >=19.0.0 (`tabs` requires React >=19.2.0; `data-table` requires React >=19.2.0)
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

When a component already exists, `add` compares your copy against the latest registry version: files that already match are left untouched, and only files that differ prompt to overwrite — so you know your copy is out of sync, not just that a file is present.

### `diff`

Check installed components against the registry. Because you own the copied code, `diff` never changes anything — it just shows what differs and how to update. A difference may be an upstream restyle or your own edits; the CLI can't tell them apart, so review before taking the latest.

```bash
npx @beaket/ui diff [component]
```

- Without an argument, lists every installed component as matching the registry or differing from it.
- With a component name, prints the line-by-line diff between your copy and the latest registry version, then points you at `add <component> --overwrite` to take the update (or hand-merge if you've customized it).

## License

MIT
