---
"@beaket/ui": major
---

BREAKING: Migrate CSS variables to Tailwind v4 `@theme` convention with `--color-*` prefix

- CSS tokens moved from `:root` to `@theme` block with `--color-*` prefix
- Components now use clean Tailwind utilities (`bg-paper` instead of `bg-[var(--paper)]`)
- Unified color token values with Beaket app (chrome, platinum, signal-blue)
- Added `--color-muted` (#737373) for WCAG AA-compliant muted text (replaces aluminum for text)
- Added `--color-signal-red-text` (#b91c1c) for accessible red text on light backgrounds
- Accessibility improvements across all components:
  - BlankSlate: decorative icons marked `aria-hidden`
  - Navigation: default `aria-label` on nav landmark
  - Button: spinner wrapped with `aria-live="polite"`
  - Switch: disabled state uses border-dashed pattern instead of opacity
  - DataTable: search input has `aria-label`
  - Checkbox: indeterminate state with Minus icon and ARIA support
