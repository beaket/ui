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

## Commands

| Command          | Description     |
| ---------------- | --------------- |
| `pnpm dev`       | Start Storybook |
| `pnpm build`     | Build Storybook |
| `pnpm typecheck` | Run type check  |
