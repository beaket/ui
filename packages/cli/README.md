# @beaket/ui

CLI for adding Beaket UI components to your project.

**Documentation:** https://beaket.github.io/ui/

## Usage

```bash
npx @beaket/ui init
npx @beaket/ui add button
```

## Requirements

- React 18+
- Tailwind CSS

## Commands

| Command                     | Description                      |
| --------------------------- | -------------------------------- |
| `init`                      | Setup project configuration      |
| `init -y`                   | Setup with defaults (no prompts) |
| `add <component>`           | Add a component                  |
| `add <component> [more...]` | Add multiple components at once  |

## Examples

```bash
# Initialize with prompts
npx @beaket/ui init

# Initialize with defaults (skip prompts)
npx @beaket/ui init -y

# Add a single component
npx @beaket/ui add button

# Add multiple components
npx @beaket/ui add alert button label input

# Overwrite existing files
npx @beaket/ui add button --overwrite
```

## Help

```bash
npx @beaket/ui --help
npx @beaket/ui init --help
npx @beaket/ui add --help
```
