# @beaket/ui

## 1.5.1

### Patch Changes

- 1d6083e: Fix consistent form control borders and navigation active text
  - Standardize border color to --graphite for Checkbox, Select, Textarea
  - Remove meaningless hover border changes
  - Add text-inverse utility for navigation active state
  - Fix docs global styles conflicting with component styles

## 1.5.0

### Minor Changes

- 2fa9067: Add offset shadow system and new component variants
  - Button: Add offset shadow states, warning variant, mono prop
  - Badge: Add warning and code variants
  - Table: Add shadow prop, TableSectionHeader component
  - Card, Tabs: Add optional shadow prop
  - Dialog, Sheet, Dropdown, Tooltip: Add offset shadows

- df80cc1: Add Blockquote, Breadcrumb, and Navigation components
  - Blockquote: Styled quotation with author attribution support
  - Breadcrumb: Compound component for navigation hierarchy
  - Navigation: Primary site navigation with offset shadow styling

## 1.4.0

### Minor Changes

- 1b26167: Add Avatar component for displaying user profile images with fallback support
- 69a50f4: Add form components: Label, Textarea, Select, and Switch
  - Label: Form label with accessibility support via @radix-ui/react-label
  - Textarea: Multi-line text input with validation states
  - Select: Dropdown select with grouped options using compound pattern (Select.Trigger, Select.Content, Select.Item, etc.)
  - Switch: Toggle switch with size variants (sm, md, lg) via @radix-ui/react-switch

- 0a6eb92: Add Phase 2 components: Tooltip, Separator, Card, Tabs, Sheet, and Alert
  - **Tooltip**: Popup that displays information on hover or focus
  - **Separator**: Visual divider for horizontal or vertical separation
  - **Card**: Container component with Header, Title, Description, Action, Content, and Footer sub-components
  - **Tabs**: Tab navigation component for switching between content panels
  - **Sheet**: Slide-out panel from any edge of the screen (left, right, top, bottom)
  - **Alert**: Callout component with semantic variants (note, tip, important, warning, caution)

- 21e60c3: Add Table and DataTable components
  - Table: Semantic HTML table components (TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption)
  - DataTable: TanStack Table-based component with sorting, filtering, pagination, and row selection
  - Update Button to use design tokens
  - Update CLAUDE.md with library architecture and design philosophy

- 2304fb0: Add Dialog component with compound pattern, controlled/uncontrolled modes, and Storybook tests
- 4028bf6: Add DropdownMenu component with compound pattern, checkbox/radio items, submenus, and keyboard shortcuts support
- 27f74ac: Add Pagination and BlankSlate components (Phase 3 migration)
  - Pagination: Server-side pagination with ellipsis support for SSR-friendly navigation
  - BlankSlate: Empty state component with preset icons and custom icon support

### Patch Changes

- 86722d0: Make Tooltip self-contained by including TooltipProvider internally

## 1.3.0

### Minor Changes

- 495bc3c: Add Input component with brutalist design
- 2633dec: Add Radio component for single-choice selection

## 1.2.0

### Minor Changes

- 11f945c: Add Badge component with 6 variants: default, secondary, success, error, info, outline

## 1.1.1

### Patch Changes

- 6916e4e: Add usage field to registry.json for component documentation

## 1.1.0

### Minor Changes

- 4901272: Add Checkbox component with Radix UI primitives

## 1.0.0

### Major Changes

- 5dfc775: Simplify CLI and component structure

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

- 12e1451: Add overwrite prompt for existing files in CLI add command
  - Add `--overwrite` (`-o`) flag to force overwrite without prompting
  - Prompt user for confirmation when a file already exists
  - Show skipped files with instructions to use `--overwrite`
  - Improve progress display with checkmarks

## 0.1.8

### Patch Changes

- 6ecf976: Update CLI package description

## 0.1.7

### Patch Changes

- e30519c: Add JSDoc comments to Button component props

## 0.1.6

### Patch Changes

- e453371: docs: add JSDoc comment to Button component
- e180d0f: docs: add JSDoc comment to Button props
- 14c4706: docs: add JSDoc comment to Spinner component
- 51771f8: Rename ButtonProps to Props internally
- 26470e9: fix: trigger auto-changeset only on PR open and use PR title
- 7b1fb93: chore: apply code formatting and cleanup

## 0.1.5

### Patch Changes

- 04f0200: Test changeset for verification
