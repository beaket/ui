---
"@beaket/paper": patch
---

Fix the task-list checkbox checkmark becoming invisible under a forced `colorScheme`. The checked checkmark image was selected with a bare `@media (prefers-color-scheme: dark)` rule, but forced light/dark schemes are driven by editor scope classes (`.cm-beaket-paper-dark` / `.cm-beaket-paper`), and the OS media query doesn't match a forced scheme. So a checkbox forced opposite the OS (e.g. `colorScheme="dark"` on a light OS) painted a same-color checkmark on its `--ink` fill — invisible. Root cause: it was the only styling rule keyed on `prefers-color-scheme` instead of the scope class. The checkmark image is now the internal `--cm-check-mark` editor token (light default in `tokens`, dark value in `darkTokens`), so it rides the same scoped dark stylesheet as every other dark token and follows the active scheme in both `system` and forced modes.
