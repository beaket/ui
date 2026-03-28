# @beaket/ui

## 2.1.1

### Patch Changes

- [#287](https://github.com/beaket/ui/pull/287) [`5c50154`](https://github.com/beaket/ui/commit/5c5015472b029b31b64aa31ff8aca5350845f628) Thanks [@jihnma](https://github.com/jihnma)! - Brighten porcelain warning color from olive-toned #b58a00 to warm vintage amber #d89018. Add signal-amber-text token across all themes for accessible text/icon usage on light surfaces.

## 2.1.0

### Minor Changes

- [#257](https://github.com/beaket/ui/pull/257) [`09debe5`](https://github.com/beaket/ui/commit/09debe548d70e6b454b69d5ffb7b4efd7215b673) Thanks [@jihnma](https://github.com/jihnma)! - Add dark mode variants for all themes (Porcelain, Tobacco, Marigold, Eucalyptus) with automatic OS detection via prefers-color-scheme and manual light/dark toggle in docs

- [#260](https://github.com/beaket/ui/pull/260) [`2a240ce`](https://github.com/beaket/ui/commit/2a240ce68b56dfa88a7540ce6c235f5d1a155af0) Thanks [@jihnma](https://github.com/jihnma)! - Add button mode to Pagination component and refactor DataTable to use it

  Pagination now supports `mode="button"` with an `onPageChange` callback for client-side pagination, in addition to the existing `mode="link"` (default) with `buildPageUrl` for SSR-friendly navigation.

  DataTable's inline pagination has been replaced with the shared Pagination component, gaining ellipsis support for large page counts and ensuring visual consistency.

- [#236](https://github.com/beaket/ui/pull/236) [`fa45480`](https://github.com/beaket/ui/commit/fa45480fab5ada0d3b6dd3fbb2b31c7e684ed5c2) Thanks [@jihnma](https://github.com/jihnma)! - Remove 5 composed components in favor of primitive-first philosophy

  Removed: ConfirmationDialog, ErrorPage, SidebarLayout, BlankSlate, PageHeader

  These components were fixed-layout compositions of existing primitives (Dialog, Button, Alert, etc.) that restricted user freedom. Users should compose their own layouts using the primitive components directly.

- [#256](https://github.com/beaket/ui/pull/256) [`98083c3`](https://github.com/beaket/ui/commit/98083c33a888bf6ae38e09eb12044e308c88c7ba) Thanks [@jihnma](https://github.com/jihnma)! - Redesign signal colors across all themes for distinct personalities. Default green shifted from teal (167°) to emerald (150°) for clearer success recognition. Tobacco signals now use earthy pigments (indigo ink, brick, forest, ochre, plum, verdigris). Marigold pushed to max saturation with WCAG green fix (2.1:1 → ~5:1). Eucalyptus moved from Tailwind defaults to formal cobalt/crimson/jade/brass palette.

- [#249](https://github.com/beaket/ui/pull/249) [`168128d`](https://github.com/beaket/ui/commit/168128dae03e6dd97f286366f4440906a5c8126a) Thanks [@jihnma](https://github.com/jihnma)! - Add surface layer tokens (`surface-0`, `surface-1`, `surface-2`) for visual depth between page, cards, and elevated elements. Surface containers (Card, Dialog, Sheet, Alert, Table) use `bg-surface-1`; floating overlays (DropdownMenu, Select popup) use `bg-surface-2`.

- [#255](https://github.com/beaket/ui/pull/255) [`7e14e13`](https://github.com/beaket/ui/commit/7e14e13f321d3f5f80e3afbf15b7097fa3148893) Thanks [@jihnma](https://github.com/jihnma)! - Add four themes: Porcelain (cold precision, teal accent), Tobacco (warm pampas cream, terracotta), Marigold (loud poster-print signals, ink-black shadows), Eucalyptus (enterprise titanium blue-gray). Each transforms neutrals, signal colors, and shadow geometry. New `--theme` CLI flag. Interactive demo at `/themes`.

### Patch Changes

- [#239](https://github.com/beaket/ui/pull/239) [`7b6b49f`](https://github.com/beaket/ui/commit/7b6b49f92d517e03944a89346f9c0abe32a68e5b) Thanks [@jihnma](https://github.com/jihnma)! - Fix accessibility and consistency issues across 14 components
  - DataTable: add keyboard support (Enter/Space) on clickable rows, optimize selection useEffect
  - Button: add data-slot and default type="button"
  - Alert: remove line-clamp-1 from title
  - NavigationProgress: add aria-valuetext
  - Sheet: add hideCloseButton prop for Dialog API parity
  - Input, Textarea, Select: normalize focus indicators to focus-visible:outline
  - Radio: align border weight with Checkbox (border-graphite)
  - Tooltip: remove shadow-offset from dark surface
  - Blockquote: use border-l-2 to match border-width-medium token
  - Checkbox, Radio, Switch, Dialog/Sheet close: expand touch targets to 44px
  - Select: add disabled:border-chrome to match other form controls

- [#252](https://github.com/beaket/ui/pull/252) [`9d4f3e0`](https://github.com/beaket/ui/commit/9d4f3e0acc06c35834b8f267175973dffb70a555) Thanks [@jihnma](https://github.com/jihnma)! - fix: add missing `shadow` prop to Avatar for API consistency with Card and Table

- [#250](https://github.com/beaket/ui/pull/250) [`e9c59f6`](https://github.com/beaket/ui/commit/e9c59f66e7843414ba47e8c73e8d643137f0995b) Thanks [@jihnma](https://github.com/jihnma)! - fix: add missing `gap-2` to `Card.Footer` so children are spaced correctly

- [#266](https://github.com/beaket/ui/pull/266) [`04be083`](https://github.com/beaket/ui/commit/04be08310d8825dd5c9bdccfbde5a7e9b37d7825) Thanks [@jihnma](https://github.com/jihnma)! - Improve component prop documentation: extract compound component props (Card, Navigation, Tabs, Select, DropdownMenu), show enum literal values instead of "enum", filter className noise, fix ReactNode types showing as "any", and add inline option listings to JSDoc comments

- [#269](https://github.com/beaket/ui/pull/269) [`8d8c31c`](https://github.com/beaket/ui/commit/8d8c31cb7f19267b46fffefa7ed83aa99562fa21) Thanks [@jihnma](https://github.com/jihnma)! - Fix accessibility issues in DataTable, Pagination, and Input components

- [#240](https://github.com/beaket/ui/pull/240) [`5beb672`](https://github.com/beaket/ui/commit/5beb6723f57e892169e8b0c85b869c7c9f3d51d7) Thanks [@jihnma](https://github.com/jihnma)! - Add focus-visible indicator to DataTable clickable rows for keyboard navigation

- [#264](https://github.com/beaket/ui/pull/264) [`7add468`](https://github.com/beaket/ui/commit/7add46849d67ac6732e55c0a0bbd3a5444558c92) Thanks [@jihnma](https://github.com/jihnma)! - fix: resolve React 19 ref collision in Textarea and stabilize effect dependencies in DataTable, Dialog, Sheet

- [#253](https://github.com/beaket/ui/pull/253) [`cd1de9a`](https://github.com/beaket/ui/commit/cd1de9ae3249acdb5fa9316017ab70ffc5cef07f) Thanks [@jihnma](https://github.com/jihnma)! - fix: increase Switch `sm` size from 12×28px to 16×32px for better visibility

- [#251](https://github.com/beaket/ui/pull/251) [`5d86371`](https://github.com/beaket/ui/commit/5d863718e7c840bec18be32f2f79b046e2a559c4) Thanks [@jihnma](https://github.com/jihnma)! - fix: increase default Table cell padding from px-1.5 py-1 to px-4 py-2/py-2.5 for better readability

## 2.0.0

### Major Changes

- [#230](https://github.com/beaket/ui/pull/230) [`5dda5cf`](https://github.com/beaket/ui/commit/5dda5cf106ac8982dafd1d633209949d46e1a5e8) Thanks [@jihnma](https://github.com/jihnma)! - BREAKING: Migrate CSS variables to Tailwind v4 `@theme` convention with `--color-*` prefix
  - CSS tokens moved from `:root` to `@theme` block with `--color-*` prefix
  - Components now use clean Tailwind utilities (`bg-paper` instead of `bg-[var(--paper)]`)
  - Unified color token values with Beaket app (chrome, platinum, signal-blue)
  - Added `--color-muted` ([#737373](https://github.com/beaket/ui/issues/737373)) for WCAG AA-compliant muted text (replaces aluminum for text)
  - Added `--color-signal-red-text` (#b91c1c) for accessible red text on light backgrounds
  - Accessibility improvements across all components:
    - BlankSlate: decorative icons marked `aria-hidden`
    - Navigation: default `aria-label` on nav landmark
    - Button: spinner wrapped with `aria-live="polite"`
    - Switch: disabled state uses border-dashed pattern instead of opacity
    - DataTable: search input has `aria-label`
    - Checkbox: indeterminate state with Minus icon and ARIA support

### Minor Changes

- [#232](https://github.com/beaket/ui/pull/232) [`18ebbb6`](https://github.com/beaket/ui/commit/18ebbb6fa1ab7278192f6bb40a8cd5aa4c6770ca) Thanks [@jihnma](https://github.com/jihnma)! - Add 7 new components extracted from Beaket app
  - **Skeleton**: Loading placeholder with pulse animation
  - **ViewToggle**: Generic toggle button group for switching between views
  - **NavigationProgress**: Indeterminate progress bar for page navigation
  - **PageHeader**: Page header with title, count, and action slot
  - **ErrorPage**: Full-page error display with code, message, and action
  - **SidebarLayout**: Responsive layout with content and sidebar slots
  - **ConfirmationDialog**: Pre-built confirmation dialog with warning and loading state

### Patch Changes

- [#233](https://github.com/beaket/ui/pull/233) [`c71d810`](https://github.com/beaket/ui/commit/c71d810f75b41133f47e530d7e4f840cac9fd6cc) Thanks [@jihnma](https://github.com/jihnma)! - Fix accessibility and UX issues across 9 components
  - DataTable: add `aria-sort` on sortable headers and `scope="col"` for screen reader table navigation
  - ViewToggle: make `label` required for icon-only buttons (a11y)
  - Skeleton: add `role="status"` and `aria-label` for screen readers
  - Select: fix focus ring to use `focus-visible:` consistently
  - Badge: add missing `data-slot="badge"`
  - Avatar: add dev warning when `alt` prop is missing on Avatar.Image
  - Radio: fix broken disabled indicator dot color using `group-disabled` pattern
  - Navigation: add `transition-shadow`, `active:shadow-offset-active`, suppress shadow/hover when active
  - Switch: fix disabled+checked state showing green, improve thumb contrast when disabled

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
