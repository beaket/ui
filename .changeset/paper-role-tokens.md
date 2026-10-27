---
"@beaket/paper": minor
---

Breaking change: the editor's color tokens are now named by role and bridge to the `@beaket/ui` semantic layer (ADR-0025). Before this change, the bridge read porcelain-era names such as `--color-ink` and `--color-paper` that `@beaket/ui` no longer defines. So, despite the docs, the editor never actually inherited a `@beaket/ui` theme. It now does, dark mode included. A standalone editor looks exactly as before.

| New token                      | Bridges to                | Former name               |
| ------------------------------ | ------------------------- | ------------------------- |
| `--beaket-paper-fg`            | `--color-fg`              | `--beaket-paper-ink`      |
| `--beaket-paper-fg-muted`      | `--color-fg-muted`        | `--beaket-paper-steel`    |
| `--beaket-paper-fg-subtle`     | `--color-fg-subtle`       | `--beaket-paper-muted`    |
| `--beaket-paper-bg`            | `--color-bg-input`        | `--beaket-paper-canvas`   |
| `--beaket-paper-bg-raised`     | `--color-bg-raised`       | `--beaket-paper-surface`  |
| `--beaket-paper-bg-overlay`    | `--color-bg-overlay`      | `--beaket-paper-paper`    |
| `--beaket-paper-bg-hover`      | `--color-bg-hover`        | `--beaket-paper-frost`    |
| `--beaket-paper-bg-active`     | `--color-bg-active`       | `--beaket-paper-chrome`   |
| `--beaket-paper-border-subtle` | `--color-border-subtle`   | `--beaket-paper-platinum` |
| `--beaket-paper-border`        | `--color-border`          | `--beaket-paper-silver`   |
| `--beaket-paper-border-strong` | `--color-border-strong`   | `--beaket-paper-slate`    |
| `--beaket-paper-accent`        | `--color-accent-solid`    | (unchanged)               |
| `--beaket-paper-shadow`        | `--shadow-offset-overlay` | (unchanged)               |

Migration:

- Rename any `--beaket-paper-*` override to its role name. Until 1.0, the former names still work as deprecated aliases.
- `--beaket-paper-aluminum` is removed. No part of the editor read it.
- If you themed the editor through the old porcelain variables (`--color-ink`, `--color-paper`, `--color-frost`, `--color-platinum`, `--color-silver`, `--color-chrome`, `--color-muted`, `--color-steel`, `--color-slate`, `--color-signal-blue`), set the matching `--beaket-paper-*` role tokens instead. Those variables are no longer read.
