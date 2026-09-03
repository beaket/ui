# Beaket UI

[![CI](https://github.com/beaket/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/beaket/ui/actions/workflows/ci.yml)

Ink & Instrument — a printed page you can press. Two things live in this repo:

- **`@beaket/ui`** — copy-paste React + Tailwind components (shadcn-style: the CLI copies source into your project, you own it).
- **`@beaket/paper`** — a standalone, markdown-first / CJK-first Live Preview editor, published to npm.

## Start here

```bash
pnpm install   # first time only
```

| Working on…      | Run                                  | Opens                                     |
| ---------------- | ------------------------------------ | ----------------------------------------- |
| Components       | `pnpm dev`                           | Storybook — localhost:6006                |
| The Paper editor | `pnpm turbo dev --filter=paper-site` | Live playground — localhost:4321/ui/paper |
| The docs site    | `pnpm docs:dev`                      | Docs — localhost:4321/ui                  |

Editing component or editor source hot-reloads the open page — no rebuild.

## Structure

```
src/components/   # @beaket/ui components (copy-paste registry)
registry/         # manifest the CLI reads to copy components
packages/cli/     # @beaket/ui — the CLI (published to npm)
packages/paper/   # @beaket/paper — the editor (published to npm)
sites/paper/      # Paper's docs + live playground (Astro)
docs/             # @beaket/ui docs site (Astro)
```

## Commands

| Command          | Does                                          |
| ---------------- | --------------------------------------------- |
| `pnpm typecheck` | Type-check the whole monorepo                 |
| `pnpm test`      | Run component tests (`test:editor` for Paper) |
| `pnpm build`     | Build the component docs (Storybook)          |

## Docs & links

- Deeper: [CONTRIBUTING.md](./CONTRIBUTING.md) (components) · [packages/paper/docs/CONTEXT.md](./packages/paper/docs/CONTEXT.md) (editor map) · [CLAUDE.md](./CLAUDE.md) (conventions)
- Sites: [Docs](https://beaket.github.io/ui/) · [Paper](https://beaket.github.io/ui/paper/)
- npm: [@beaket/ui](https://www.npmjs.com/package/@beaket/ui) · [@beaket/paper](https://www.npmjs.com/package/@beaket/paper)
- Accessibility: the defined automated checks pass per revision; this is not WCAG certification. [Coverage and limits](./docs/a11y-automated-check-contract.md)
