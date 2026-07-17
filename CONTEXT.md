# `@beaket/ui` — orientation map

**Read this before editing the monorepo.** This is the _what / where_ map for maintainers and agents — a standalone complement to `CLAUDE.md` (design rules + component authoring checklist). Changeset-exempt: lives outside every npm tarball and the docs site. For the editor package, see `packages/paper/docs/CONTEXT.md`.

## Two kinds of packages

| Kind                | Location          | Distributed as                                             |
| ------------------- | ----------------- | ---------------------------------------------------------- |
| Registry components | `src/components/` | Copy-pasted by the CLI (`add` command) — **not installed** |
| CLI tool            | `packages/cli`    | npm (`@beaket/ui`) — `npx @beaket/ui add/init/theme`       |
| Markdown editor     | `packages/paper`  | npm (`@beaket/paper`) — `npm install`                      |

Docs site: `docs/` (Astro + Storybook). Paper docs site: `sites/paper/` (separate brand + playground).

## Registry components (`src/components/`)

26 self-contained copy-paste components (as of 2026-06-27):

```
alert · avatar · badge · blockquote · breadcrumb · button · card · checkbox
data-table · dialog · dropdown-menu · input · label · navigation · navigation-progress
pagination · radio · select · separator · sheet · skeleton · switch · table · tabs
textarea · tooltip
```

Each `.tsx` file is copied verbatim into the consumer's project by the CLI — there is no runtime dependency on this repo after the copy.

### Invariants, template, checklist

Owned by `CLAUDE.md` (Design Rules · Component Template · Required Checklist) — read them there. Not duplicated here: the copies drifted from the source twice (token count, theme count) before being removed.

## `registry/registry.json`

Single source of truth for the component registry. Consumed by two systems:

- **CLI** (`add` command) — reads `name`, `dependencies`, `registryDependencies`, `files`
- **Docs site** — reads `docs.title`, `docs.tagline`, `docs.sections`, `docs.previewStory`

Schema per entry:

```json
{
  "name": "button",
  "description": "Short description for search/listing",
  "dependencies": ["clsx", "tailwind-merge"],
  "registryDependencies": [],
  "files": ["components/button.tsx"],
  "docs": {
    "title": "Button",
    "tagline": "One-line tagline for the docs page.",
    "sections": ["AllVariants"],
    "previewStory": "Default"
  }
}
```

Keep this in sync with the actual component files — it is the source of truth the CLI ships to every consumer.

## CLI (`packages/cli`) — the `@beaket/ui` package

Three commands:

| Command        | Entry point         | What it does                                                                                                                            |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `init`         | `commands/init.ts`  | Detects tsconfig alias path + framework, prompts for component dir / CSS file / theme, writes `beaket.ui.json`, injects CSS token block |
| `add [names…]` | `commands/add.ts`   | Reads `beaket.ui.json` → fetches registry → resolves deps → installs → writes component files → syncs theme CSS                         |
| `theme`        | `commands/theme.ts` | Swaps the active theme's token block in the consumer's CSS file                                                                         |

**`add` / `init` data flow:**

1. Read `beaket.ui.json` (config: `components` path, `css` path, `theme`)
2. Fetch `registry/registry.json` from GitHub raw (`main` branch — always latest)
3. Collect unique `dependencies` across all requested components → detect package manager → install
4. Write component source files into `config.components`
5. Inject / update theme token block in `config.css`

Key utils:

- `utils/config.ts` — read/write `beaket.ui.json`
- `utils/registry.ts` — fetch from `https://raw.githubusercontent.com/beaket/ui/main`
- `utils/files.ts` — write component files, detect package manager (npm/pnpm/yarn/bun)
- `utils/theme.ts` — CSS token injection and replacement logic
- `utils/themes.ts` — bundled theme CSS strings for the built-in themes

## CSS themes (`src/themes/`)

See `CLAUDE.md` § CSS tokens — the two-layer system (shared semantic layer + per-theme palettes) and the current theme list live there. The CLI injects the chosen theme at `init` and updates it with `theme`.

## Where to make changes

| Goal                            | Where                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------- |
| New component                   | `src/components/` + follow Required Checklist                                |
| Fix existing component          | `src/components/[name].tsx` + changeset (patch)                              |
| Add a dependency to a component | `src/components/[name].tsx` + update `registry/registry.json` `dependencies` |
| CLI command change              | `packages/cli/src/commands/` + changeset                                     |
| Theme / token change            | `src/themes/[theme].css` + `utils/themes.ts` (bundled copy)                  |
| Registry entry only             | `registry/registry.json` (no component code change)                          |
| Docs site                       | `docs/` — Astro pages, no changeset needed                                   |
| Paper editor                    | See `packages/paper/docs/CONTEXT.md`                                         |
