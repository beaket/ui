# CLAUDE.md - AI Component Development Guidelines

## Required Items When Creating Components

When creating a new component, you **must** create all of the following:

### 1. Storybook

Create at `src/components/[name].stories.tsx`.

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComponentName } from "./component-name";

const meta: Meta<typeof ComponentName> = {
  title: "Components/ComponentName",
  component: ComponentName,
  tags: ["autodocs"],
  argTypes: {
    // Define prop controls
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

// Basic story
export const Default: Story = {
  args: {
    // Default props
  },
};

// Composition for documentation
export const AllStates = () => <div className="flex gap-2">{/* Display all states */}</div>;
```

### 2. Component Test (Interaction Test)

Implement interaction tests using Storybook's `play` function.

```tsx
export const ClickTest: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole("button");

    await userEvent.click(element);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

### 3. Registry Registration

Register the component in `registry/registry.json`.

```json
{
  "name": "component-name",
  "description": "Component description",
  "dependencies": ["required dependency packages"],
  "registryDependencies": [],
  "files": ["components/component-name.tsx"],
  "docs": {
    "title": "ComponentName",
    "tagline": "Brief description of the component",
    "sections": ["AllStates"]
  }
}
```

## File Structure

```
src/components/
├── [name].tsx           # Component implementation
└── [name].stories.tsx   # Storybook + Interaction Test

registry/
└── registry.json        # Component registration
```

## Checklist

Verify when creating a component:

- [ ] `src/components/[name].tsx` - Component implementation
- [ ] `src/components/[name].stories.tsx` - Storybook created
- [ ] Interaction tests implemented (play function)
- [ ] Registered in `registry/registry.json`
