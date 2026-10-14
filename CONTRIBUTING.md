# Contributing

## Setup

```bash
pnpm install
pnpm dev
```

## Adding a Component

1. Create `src/components/[name].tsx`
2. Create `src/components/[name].stories.tsx`
3. Add entry to `registry/registry.json`

### registry.json format

```json
{
  "name": "component-name",
  "description": "Brief description",
  "dependencies": ["npm-packages"],
  "registryDependencies": [],
  "files": ["components/component-name.tsx"],
  "docs": {
    "title": "ComponentName",
    "tagline": "One-line description for docs",
    "sections": ["AllStates"],
    "previewStory": "Default"
  }
}
```

- `sections`: Story export names to show in docs Examples section
- `previewStory`: Story to show in the preview box

### Icons

Beaket UI has no icon set of its own, and a component should not add one — no
wrapper, sprite, or `<symbol>` sheet. When a component needs a fixed glyph,
import it from `lucide-react` and add `lucide-react` to that component's
`dependencies` in `registry/registry.json`; a component that does not import
it must not list it. When the icon is the consumer's choice, accept a React
element or a slot instead.

Decorative icons get `aria-hidden="true"`. An icon-only control gets an
accessible name (`aria-label` or visually hidden text).

## Commands

| Command          | Description     |
| ---------------- | --------------- |
| `pnpm dev`       | Start Storybook |
| `pnpm build`     | Build Storybook |
| `pnpm typecheck` | Run type check  |
