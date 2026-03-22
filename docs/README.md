# Beaket UI — Docs

Documentation site for `@beaket/ui`, built with [Astro](https://astro.build) + React + Tailwind CSS 4.

Deployed at **https://beaket.github.io/ui**

## Development

```bash
# from the repo root
pnpm install
cd docs
pnpm dev
```

The dev server starts at `http://localhost:4321/ui/`.

## Scripts

| Command          | Description                                |
| :--------------- | :----------------------------------------- |
| `pnpm dev`       | Generate props data, then start dev server |
| `pnpm build`     | Build static site to `dist/`               |
| `pnpm preview`   | Preview the production build locally       |
| `pnpm typecheck` | Generate props data and run `astro check`  |

## Structure

```
docs/
├── scripts/
│   └── generate-props.ts   # auto-generates component prop tables
├── src/
│   ├── components/          # docs-specific UI (theme switcher, showcase, etc.)
│   ├── layouts/             # doc.astro layout with sidebar nav
│   ├── pages/
│   │   ├── index.astro      # landing / component showcase
│   │   ├── installation.md
│   │   ├── cli.md
│   │   ├── design-rules.astro
│   │   ├── tokens.astro
│   │   ├── themes.astro
│   │   ├── changelog.astro
│   │   └── components/      # per-component pages (auto-routed)
│   └── styles/
├── public/
└── astro.config.mjs
```

The `@/` alias resolves to `../src/` (the main component library source), so docs pages can import components directly.
