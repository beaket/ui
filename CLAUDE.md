# CLAUDE.md - AI Component Development Guidelines

## Library Architecture

This is a **copy-paste component library** (like shadcn/ui). Users copy individual component files into their projects.

### Key Principles

1. **Self-contained components** - Each component file must be standalone
   - Include `cn` utility in every component file
   - No shared `lib/utils.ts` or similar
   - Users copy only the files they need

2. **Dependencies in registry** - List npm packages in `registry.json`
   - `dependencies`: External packages (e.g., `@radix-ui/react-checkbox`)
   - `registryDependencies`: Other components from this library (e.g., `button`)

## Design Philosophy (Brutalist)

This library follows a **brutalist design system**:

- **No gradients** - Flat colors only
- **No shadows** - No box-shadow, drop-shadow
- **No border-radius** - Sharp rectangular corners (except Radio which is circular by nature)
- **No decorative elements** - No opacity effects for styling
- **Use design tokens** - Always use CSS variables from `styles.css`

### Design Tokens

```css
/* Neutral palette */
--branch, --graphite, --ink, --paper, --steel, --chrome
--iron, --slate, --zinc, --aluminum, --silver, --platinum, --frost

/* Signal colors */
--signal-blue, --signal-red, --signal-green, --signal-amber, --signal-purple, --signal-cyan
```

### Styling Rules

| Do                        | Don't                                     |
| ------------------------- | ----------------------------------------- |
| `bg-[var(--paper)]`       | `bg-white` (except where contrast needed) |
| `text-[var(--steel)]`     | `opacity-50`                              |
| `border-[var(--chrome)]`  | `rounded-lg`                              |
| `hover:bg-[var(--frost)]` | `shadow-md`                               |

## Component Template

Every component file must follow this structure:

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function ComponentName({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="component-name" className={cn("base-styles", className)} {...props} />;
}
```

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
