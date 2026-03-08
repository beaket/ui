# @beaket/ui

## 1.9.1

### Patch Changes

- [#194](https://github.com/beaket/ui/pull/194) [`8c73b0b`](https://github.com/beaket/ui/commit/8c73b0be3977873eada02c39c0891a66421e5436) Thanks [@jihnma](https://github.com/jihnma)! - Improve focus visibility for Switch and Tabs components by using outline-based focus indicators instead of subtle border color changes

- [#192](https://github.com/beaket/ui/pull/192) [`6c2e1cd`](https://github.com/beaket/ui/commit/6c2e1cdff06baf9ff972c61cb7cbed6c0897573a) Thanks [@jihnma](https://github.com/jihnma)! - Replace hardcoded `white` with palette tokens in Input, Table, and Badge components

## 1.9.0

### Minor Changes

- [#113](https://github.com/beaket/ui/pull/113) [`4e8f921`](https://github.com/beaket/ui/commit/4e8f92132854c5dfd5814dd64ccf33086e3adf63) Thanks [@jihnma](https://github.com/jihnma)! - Add support for installing multiple components at once: `npx @beaket/ui add alert button label`

- [#109](https://github.com/beaket/ui/pull/109) [`028aa68`](https://github.com/beaket/ui/commit/028aa68803bbda585ff75c91253da96b0fe07ba4) Thanks [@jihnma](https://github.com/jihnma)! - ### Breaking Changes
  - **Table**: Migrated to compound component pattern
    - Before: `import { Table, TableBody, TableCell, ... } from "@beaket/ui"`
    - After: `import { Table } from "@beaket/ui"` and use `Table.Body`, `Table.Cell`, etc.

  ### New Features
  - **Input**: Added `prefix` and `suffix` props for icon support
  - **Sheet**: Added `fullScreen` prop for full-width mobile navigation
  - **Button**: Hover/active states now use CSS variables for easier customization
    - Added `--signal-green-hover`, `--signal-green-active`
    - Added `--signal-red-hover`, `--signal-red-active`
    - Added `--signal-amber-hover`, `--signal-amber-active`

### Patch Changes

- [#111](https://github.com/beaket/ui/pull/111) [`df61ccd`](https://github.com/beaket/ui/commit/df61ccdd5daf2b930eecec26033b627c08daebb9) Thanks [@jihnma](https://github.com/jihnma)! - Refactor CSS variables to use single source of truth
  - Extract core CSS variables to `src/css-variables.css`
  - CLI now imports from generated file instead of hardcoding
  - Add `pnpm sync:css` script to sync variables to CLI

## 1.8.0

### Minor Changes

- [`6460127`](https://github.com/beaket/ui/commit/6460127): Add -y flag to init command for non-interactive mode

### Patch Changes

- [`dca002d`](https://github.com/beaket/ui/commit/dca002d): Fix bun detection to use bun.lock instead of bun.lockb

## 1.7.0

### Minor Changes

- [`ed42b5d`](https://github.com/beaket/ui/commit/ed42b5d): Improve Switch and Textarea components

  Switch:
  - Flatter, more horizontal proportions (reduced height by ~40%)
  - Uniform 2px padding on all sides
  - Corrected thumb translate values for symmetric left/right states

  Textarea:
  - Add `autoResize` prop (default: true) for automatic height adjustment based on content
  - Unify focus styling with Input component (ring-2 instead of border-only)

## 1.6.0

### Minor Changes

- [`1b61c60`](https://github.com/beaket/ui/commit/1b61c60): Auto-detect component path based on tsconfig alias configuration

### Patch Changes

- [`6ffa8c6`](https://github.com/beaket/ui/commit/6ffa8c6): Fix CLI init to include @theme block with shadow utilities for Tailwind CSS 4

## 1.5.1

### Patch Changes

- [`1d6083e`](https://github.com/beaket/ui/commit/1d6083e): Fix consistent form control borders and navigation active text
  - Standardize border color to --graphite for Checkbox, Select, Textarea
  - Remove meaningless hover border changes
  - Add text-inverse utility for navigation active state
  - Fix docs global styles conflicting with component styles

## 1.5.0

### Minor Changes

- [`2fa9067`](https://github.com/beaket/ui/commit/2fa9067): Add offset shadow system and new component variants
  - Button: Add offset shadow states, warning variant, mono prop
  - Badge: Add warning and code variants
  - Table: Add shadow prop, TableSectionHeader component
  - Card, Tabs: Add optional shadow prop
  - Dialog, Sheet, Dropdown, Tooltip: Add offset shadows

- [`df80cc1`](https://github.com/beaket/ui/commit/df80cc1): Add Blockquote, Breadcrumb, and Navigation components
  - Blockquote: Styled quotation with author attribution support
  - Breadcrumb: Compound component for navigation hierarchy
  - Navigation: Primary site navigation with offset shadow styling

## 1.4.0

### Minor Changes

- [`1b26167`](https://github.com/beaket/ui/commit/1b26167): Add Avatar component for displaying user profile images with fallback support
- [`69a50f4`](https://github.com/beaket/ui/commit/69a50f4): Add form components: Label, Textarea, Select, and Switch
  - Label: Form label with accessibility support via @radix-ui/react-label
  - Textarea: Multi-line text input with validation states
  - Select: Dropdown select with grouped options using compound pattern (Select.Trigger, Select.Content, Select.Item, etc.)
  - Switch: Toggle switch with size variants (sm, md, lg) via @radix-ui/react-switch

- [`0a6eb92`](https://github.com/beaket/ui/commit/0a6eb92): Add Phase 2 components: Tooltip, Separator, Card, Tabs, Sheet, and Alert
  - **Tooltip**: Popup that displays information on hover or focus
  - **Separator**: Visual divider for horizontal or vertical separation
  - **Card**: Container component with Header, Title, Description, Action, Content, and Footer sub-components
  - **Tabs**: Tab navigation component for switching between content panels
  - **Sheet**: Slide-out panel from any edge of the screen (left, right, top, bottom)
  - **Alert**: Callout component with semantic variants (note, tip, important, warning, caution)

- [`21e60c3`](https://github.com/beaket/ui/commit/21e60c3): Add Table and DataTable components
  - Table: Semantic HTML table components (TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption)
  - DataTable: TanStack Table-based component with sorting, filtering, pagination, and row selection
  - Update Button to use design tokens
  - Update CLAUDE.md with library architecture and design philosophy

- [`2304fb0`](https://github.com/beaket/ui/commit/2304fb0): Add Dialog component with compound pattern, controlled/uncontrolled modes, and Storybook tests
- [`4028bf6`](https://github.com/beaket/ui/commit/4028bf6): Add DropdownMenu component with compound pattern, checkbox/radio items, submenus, and keyboard shortcuts support
- [`27f74ac`](https://github.com/beaket/ui/commit/27f74ac): Add Pagination and BlankSlate components (Phase 3 migration)
  - Pagination: Server-side pagination with ellipsis support for SSR-friendly navigation
  - BlankSlate: Empty state component with preset icons and custom icon support

### Patch Changes

- [`86722d0`](https://github.com/beaket/ui/commit/86722d0): Make Tooltip self-contained by including TooltipProvider internally

## 1.3.0

### Minor Changes

- [`495bc3c`](https://github.com/beaket/ui/commit/495bc3c): Add Input component with brutalist design
- [`2633dec`](https://github.com/beaket/ui/commit/2633dec): Add Radio component for single-choice selection

## 1.2.0

### Minor Changes

- [`11f945c`](https://github.com/beaket/ui/commit/11f945c): Add Badge component with 6 variants: default, secondary, success, error, info, outline

## 1.1.1

### Patch Changes

- [`6916e4e`](https://github.com/beaket/ui/commit/6916e4e): Add usage field to registry.json for component documentation

## 1.1.0

### Minor Changes

- [`4901272`](https://github.com/beaket/ui/commit/4901272): Add Checkbox component with Radix UI primitives

## 1.0.0

### Major Changes

- [`5dfc775`](https://github.com/beaket/ui/commit/5dfc775): Simplify CLI and component structure

  **Breaking changes:**
  - `beaket.json` now only requires `components` path (removed `tailwind`, `aliases`, `paths.utils`)
  - Components are now single files (e.g., `button.tsx` instead of `button/button.tsx`)
  - `cn` utility is now inlined in each component

  **New `beaket.json` format:**

  ```json
  {
    "components": "src/components/ui"
  }
  ```

  **Migration:**
  1. Update `beaket.json` to new format
  2. Add CSS variables manually (see docs)
  3. Re-add components with `--overwrite` flag

### Minor Changes

- [`12e1451`](https://github.com/beaket/ui/commit/12e1451): Add overwrite prompt for existing files in CLI add command
  - Add `--overwrite` (`-o`) flag to force overwrite without prompting
  - Prompt user for confirmation when a file already exists
  - Show skipped files with instructions to use `--overwrite`
  - Improve progress display with checkmarks

## 0.1.8

### Patch Changes

- [`6ecf976`](https://github.com/beaket/ui/commit/6ecf976): Update CLI package description

## 0.1.7

### Patch Changes

- [`e30519c`](https://github.com/beaket/ui/commit/e30519c): Add JSDoc comments to Button component props

## 0.1.6

### Patch Changes

- [`e453371`](https://github.com/beaket/ui/commit/e453371): docs: add JSDoc comment to Button component
- [`e180d0f`](https://github.com/beaket/ui/commit/e180d0f): docs: add JSDoc comment to Button props
- [`14c4706`](https://github.com/beaket/ui/commit/14c4706): docs: add JSDoc comment to Spinner component
- [`51771f8`](https://github.com/beaket/ui/commit/51771f8): Rename ButtonProps to Props internally
- [`26470e9`](https://github.com/beaket/ui/commit/26470e9): fix: trigger auto-changeset only on PR open and use PR title
- [`7b1fb93`](https://github.com/beaket/ui/commit/7b1fb93): chore: apply code formatting and cleanup

## 0.1.5

### Patch Changes

- [`04f0200`](https://github.com/beaket/ui/commit/04f0200): Test changeset for verification
