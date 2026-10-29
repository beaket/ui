# 0025 — Role-named theme tokens, bridged to the `@beaket/ui` semantic layer

- **Status:** Accepted
- **Date:** 2026-10-27
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** ADR-0009 (token architecture), ADR-0013 decision 6 (porcelain reconciliation)

---

# Role-named theme tokens, bridged to the `@beaket/ui` semantic layer

## Context

The 1.0 interface audit (#480) checked the `--beaket-paper-*` tokens, which are the public theming
contract. Two problems would have been frozen into 1.0.

1. **The bridge pointed at names that no longer exist.** ADR-0013 decision 6 bridged each color to
   porcelain's palette (`--color-ink`, `--color-paper`, `--color-frost`, `--color-platinum`, …), so a
   paper editor inside a `@beaket/ui` app would match the theme for free. `@beaket/ui` has since moved
   to a two-layer system: themes author a palette, and components read 69 semantic role names
   (`--color-fg`, `--color-bg-overlay`, `--color-border`, …). None of the porcelain names survive
   except `--shadow-offset`. The bridge silently fell through to paper's built-in defaults, so the
   documented zero-config match no longer happened.
2. **The public names were palette names, not roles.** `ink`, `paper`, `frost`, `platinum`,
   `silver`, `chrome`, `aluminum`, `steel`, and `slate` say which swatch, not what it is for. A
   consumer could not tell `--beaket-paper-paper` (menus) from `--beaket-paper-canvas` (the writing
   surface) without reading the source. `aluminum` was not read by any extension.

## Decision

1. **Name every color token by role, using the `@beaket/ui` semantic vocabulary.** Each role
   bridges to the semantic token of the same role:

   | Internal (unchanged) | Public role                    | Bridges to                | Former name |
   | -------------------- | ------------------------------ | ------------------------- | ----------- |
   | `--ink`              | `--beaket-paper-fg`            | `--color-fg`              | `ink`       |
   | `--steel`            | `--beaket-paper-fg-muted`      | `--color-fg-muted`        | `steel`     |
   | `--muted`            | `--beaket-paper-fg-subtle`     | `--color-fg-subtle`       | `muted`     |
   | `--canvas`           | `--beaket-paper-bg`            | `--color-bg-input`        | `canvas`    |
   | `--surface`          | `--beaket-paper-bg-raised`     | `--color-bg-raised`       | `surface`   |
   | `--paper`            | `--beaket-paper-bg-overlay`    | `--color-bg-overlay`      | `paper`     |
   | `--frost`            | `--beaket-paper-bg-hover`      | `--color-bg-hover`        | `frost`     |
   | `--chrome`           | `--beaket-paper-bg-active`     | `--color-bg-active`       | `chrome`    |
   | `--platinum`         | `--beaket-paper-border-subtle` | `--color-border-subtle`   | `platinum`  |
   | `--silver`           | `--beaket-paper-border`        | `--color-border`          | `silver`    |
   | `--slate`            | `--beaket-paper-border-strong` | `--color-border-strong`   | `slate`     |
   | `--accent`           | `--beaket-paper-accent`        | `--color-accent-solid`    | (same)      |
   | `--shadow-overlay`   | `--beaket-paper-shadow`        | `--shadow-offset-overlay` | (same)      |

   The surfaces follow DESIGN.md's paper ladder. The writing surface is the writable paper
   (`bg-input`). Code sits on the separated sheet (`bg-raised`). Menus and popovers are overlay paper
   (`bg-overlay`). Overlays take the overlay shadow.

2. **The writing surface and code background are now bridged.** ADR-0009 kept `--canvas` and
   `--surface` editor-owned because porcelain had no equivalent. The semantic layer has one
   (`bg-input`, `bg-raised`), so they join the bridge and the forced-scheme pins (ADR-0020).
3. **No local `--color-ink` pin.** ADR-0009 pinned porcelain's ink softer inside the editor. The
   semantic `--color-fg` is already one step below the deepest ink, so the host value is inherited
   as is.
4. **Former names stay as deprecated aliases through 0.x**, read between the role override and the
   bridge: `var(--beaket-paper-fg, var(--beaket-paper-ink, var(--color-fg, #232a35)))`. They are
   removed in the 1.0 release, so the frozen contract carries only role names. `aluminum` is dropped
   now; nothing read it.
5. **One table.** `theme.ts` builds the light and dark chains and the forced-scheme pins from a
   single `BRIDGED` table, replacing the regex that parsed pins back out of the chain strings.
   Extensions keep reading the short internal names, so no extension changes.

Built-in defaults are unchanged, so a standalone editor looks exactly as before.

### Alternatives weighed

- **Keep the palette names and only re-point the bridge.** This fixes the dead bridge, but freezes
  names that need the source to decode.
- **Drop the bridge.** Simpler, but gives up the zero-config match with `@beaket/ui`, which is the
  reason the two packages share a repository.

## Consequences

- **Inside a `@beaket/ui` app, the editor now actually follows the host theme**, dark mode included.
  That is a visible change for such hosts, and the one the bridge always promised.
- **Breaking on `0.x`** for a host that styled the editor through the old porcelain `--color-*`
  names. Those are no longer read. Setting the role tokens restores any look. Consumers who set
  `--beaket-paper-*` keep working through the aliases.
- The 1.0 release removes the aliases. That is part of the #480 freeze.
- Locked by `theme.test.ts` (chain strings, role→bridge map, pins) and `e2e/theme-bridge.e2e.ts`. jsdom
  cannot resolve `var()`, so the cascade order is checked in Chromium: role > alias > host > default.
