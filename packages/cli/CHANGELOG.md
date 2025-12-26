# @beaket/ui

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
