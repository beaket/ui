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

## CSS Architecture

### File Structure

```
src/
├── css-variables.css   # Core tokens (colors, shadows) - injected by CLI
└── styles.css          # Full design system (imports css-variables.css)
```

### Ownership Model

When users run `npx @beaket/ui init`, the CLI injects `css-variables.css` content into their main CSS file.

**After init, this CSS belongs to the user:**

- Users are free to modify colors, shadows, and tokens
- The library will not automatically update these values
- When the library updates tokens, users should check the CHANGELOG and manually update if needed

**Why this design:**

- Users own their design tokens completely
- No unexpected style changes from library updates
- Clear boundary: library provides initial tokens, user maintains them

### Core vs Extended Tokens

| File                | Contents                                 | User Gets           |
| ------------------- | ---------------------------------------- | ------------------- |
| `css-variables.css` | Neutral palette, signal colors, shadows  | Yes (via init)      |
| `styles.css`        | Functional mappings, typography, spacing | No (Storybook only) |

This separation keeps the injected CSS minimal (~44 lines) while the full design system is available for reference.

## Design Philosophy (Brutalist)

This library follows a **brutalist design system**:

- **No gradients** - Flat colors only
- **Offset shadows only** - 2px 2px offset shadows for interactive elements (no blur/decorative shadows)
- **No border-radius** - Sharp rectangular corners (except Radio which is circular by nature)
- **No decorative elements** - No opacity effects for styling
- **Use design tokens** - Always use CSS variables from `styles.css`

### Design Tokens

```css
/* Neutral palette */
--graphite, --ink, --branch, --iron, --slate, --zinc   /* Dark tones */
--steel, --aluminum                                     /* Mid tones */
--chrome, --silver, --platinum, --frost, --paper        /* Light tones */

/* Signal colors */
--signal-blue, --signal-red, --signal-green, --signal-amber, --signal-purple, --signal-cyan

/* Shadows (offset only, no blur) */
--shadow-offset: 2px 2px 0px 0px var(--chrome);       /* Interactive elements */
--shadow-offset-dark: 2px 2px 0px 0px var(--aluminum); /* Overlays (Dialog, etc.) */
```

### Styling Rules

| Do                          | Don't                                     |
| --------------------------- | ----------------------------------------- |
| `bg-[var(--paper)]`         | `bg-white` (except where contrast needed) |
| `text-[var(--steel)]`       | `opacity-50`                              |
| `border-[var(--chrome)]`    | `rounded-lg`                              |
| `shadow-offset`             | `shadow-md`, `shadow-lg` (blur shadows)   |
| `hover:shadow-offset-hover` | gradients, decorative effects             |

### Shadow States

Interactive elements use offset shadows with state transitions:

| State    | Shadow                           |
| -------- | -------------------------------- |
| Default  | `2px 2px` (shadow-offset)        |
| Hover    | `3px 3px` (shadow-offset-hover)  |
| Active   | `1px 1px` (shadow-offset-active) |
| Disabled | `none`                           |

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

### Compound Components

For complex components with sub-components, use the **compound pattern**:

```tsx
// Main component (exported)
export function Dialog({ children }: Props) {
  return <DialogPrimitive.Root>{children}</DialogPrimitive.Root>;
}

// Sub-components (not exported individually)
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("...", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("...", className)} {...props} />;
}

// Attach sub-components to main component
Dialog.Title = DialogTitle;
Dialog.Footer = DialogFooter;
```

**Why compound-only (no individual exports)?**

- **Semantic coupling**: `Dialog.Title` only makes sense inside `<Dialog>` - compound pattern signals this relationship
- **Discoverability**: Type `Dialog.` and autocomplete shows all sub-components
- **Encapsulation**: Not exporting sub-components signals they shouldn't be used outside their parent
- **Namespace clarity**: `Dialog.Title` clearly shows hierarchy, avoids collision with other `Title` components

### Controlled/Uncontrolled Pattern

For components supporting both modes:

```tsx
export function Dialog({ open, onOpenChange, children }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;

  // Dev warning for incomplete controlled usage
  if (process.env.NODE_ENV !== "production") {
    if (isControlled && !onOpenChange) {
      console.warn("Dialog: `open` provided without `onOpenChange`.");
    }
  }

  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange?.(value);
      if (!isControlled) setInternalOpen(value);
    },
    [isControlled, onOpenChange],
  );

  return (
    <Root open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      {children}
    </Root>
  );
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

#### Testing Portal-Based Components

For components using portals (Dialog, Popover, etc.), content renders outside `canvasElement`. Use `screen` instead:

```tsx
import { expect, screen, userEvent, within } from "storybook/test";

export const DialogTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Trigger is in canvas
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));

    // Dialog content is in portal - use screen
    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();

    // Query within the dialog
    const closeBtn = within(dialog).getByRole("button", { name: "Close" });
    await userEvent.click(closeBtn);

    // Verify closed
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
```

**Important:** Don't use mock `fn()` for `onOpenChange` props - it prevents internal state updates and the component won't actually open/close.

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

### 4. Changeset

Create a changeset for version tracking using `pnpm changeset` or manually create a file in `.changeset/`.

**Important:** The package name must be `@beaket/ui` (not `ui`).

```md
---
"@beaket/ui": minor
---

Add ComponentName component with feature X, Y, and Z
```

**Version bump guidelines:**

| Change Type                       | Bump    | Example                      |
| --------------------------------- | ------- | ---------------------------- |
| New component                     | `minor` | Adding Dialog component      |
| New feature to existing component | `minor` | Adding new variant to Button |
| Bug fix                           | `patch` | Fixing focus state issue     |
| Breaking change                   | `major` | Changing component API       |

## File Structure

```
src/components/
├── [name].tsx           # Component implementation
└── [name].stories.tsx   # Storybook + Interaction Test

registry/
└── registry.json        # Component registration

.changeset/
└── [description].md     # Changeset for versioning
```

## Checklist

Verify when creating a component:

- [ ] `src/components/[name].tsx` - Component implementation
- [ ] `src/components/[name].stories.tsx` - Storybook created
- [ ] Interaction tests implemented (play function)
- [ ] Registered in `registry/registry.json`
- [ ] Changeset created with `@beaket/ui` package name
