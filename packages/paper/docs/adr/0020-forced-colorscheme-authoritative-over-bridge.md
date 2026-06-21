# 0020 — A forced `colorScheme` is authoritative over the consumer's porcelain bridge

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# A forced `colorScheme` is authoritative over the consumer's porcelain bridge

## Context

`colorScheme` (added with OS-driven dark mode, ADR-0009's amendment) takes `"system" | "light" | "dark"`.
`"system"` follows the OS via `prefers-color-scheme`; `"light"`/`"dark"` are meant to **force** a scheme
regardless of the OS.

The surface tokens resolve through the 3-tier porcelain bridge `var(--beaket-paper-X, var(--color-Y, default))`
(ADR-0009 / token reconciliation). Forcing was implemented by swapping which scope class the editor root
wears, and the scoped stylesheet only swapped the **tier-3 built-in defaults**. It never beat a
consumer-provided **tier-2** `--color-*`.

So when a consumer bridges the porcelain vars (`--color-paper`, `--color-frost`, …) to a palette that
tracks the OS, forcing `"light"` on a dark OS (or vice-versa) left those surfaces on the OS scheme. The
visible symptom (#472): a forced-light editor under a dark OS rendered **dark overlays** — the slash menu,
the "Copied" toast (dark-on-dark, unreadable), the table row/col insert handles — because those overlays
paint `--paper`/`--frost`/`--ink` directly and inherited the consumer's dark `--color-*`.

CSS custom-property resolution makes the leak sticky: a consumer's `--color-paper: var(--paper)` declared
at `:root` is computed once against the OS scheme, and that computed value inherits down. Overriding the
short `--paper` deeper in the tree does not re-resolve it — only redeclaring `--color-paper` itself in the
editor's own scope does. (`--color-ink` was already pinned this way per scheme, which is exactly why ink —
alone among the surfaces — did _not_ leak.)

## Decision

**When a scheme is forced (`"light"`/`"dark"`, not `"system"`), forcing wins over the bridge.** Each
forced block pins the full set of bridged surface `--color-*` (and `--shadow-offset`) to its scheme's
value on `.cm-editor`, the same mechanism `--color-ink` already used. A concrete `--color-*` declared on
the editor root overrides the value inherited from the consumer's `:root`, so the forced scheme reaches
every overlay (they are `.cm-editor` descendants and inherit it).

Concretely:

- `colorScheme="light"` now wears its own scope class (`cm-beaket-paper-light`) — previously it wore
  **none**, which is why even the OS media block couldn't be the problem but the bridge still leaked. The
  class carries the light surface pins.
- `colorScheme="dark"` keeps `cm-beaket-paper-dark` and additionally carries the dark surface pins.
- `"system"` is left **unpinned** — it keeps deferring to the bridge, preserving the porcelain
  match-for-free contract (inside `@beaket/ui`'s porcelain, system mode inherits porcelain's dark block).

The tier-1 public `--beaket-paper-*` override still wins **inside** a forced scheme — it is the escape
hatch for a consumer who wants a forced scheme but a custom surface.

The pins are **derived off the var() chains** in `tokens`/`darkTokens` (the tier-3 default of each 3-tier
token), not authored as a second list and not merged into `tokens`/`darkTokens` themselves. Keeping them
forced-block-only is load-bearing: merging them into the token maps would (a) break the "every token reads
a `--beaket-paper-*` override first" contract, (b) re-break `system` mode (the maps apply unconditionally
via `baseTheme`, which would kill the bridge), and (c) duplicate the source of truth. Deriving them means a
future 3-tier token auto-pins under forcing for free, which is the correct semantics.

## Alternatives considered

- **Option 2 — document that consumers who force a scheme must override the tier-1 `--beaket-paper-*`
  names.** Rejected: it pushes the editor's own correctness onto every consumer and makes "force a scheme"
  a leaky abstraction. Forcing should be authoritative without the consumer knowing the bridge exists.
- **Pin the surfaces in all modes (including `system`).** Rejected: it would defeat the porcelain bridge —
  the whole point of tier-2 is that the editor matches a consumer's porcelain customization for free. Only
  `--color-ink` is an _always_ divergence (ADR-0009); the other surfaces must keep deferring under
  `system`.

## Consequences

- Forcing a scheme now trades the porcelain-bridge match (tier-2) for **scheme authority**: under a forced
  scheme the editor paints its own per-scheme surfaces, ignoring a consumer `--color-*` bridge. `system`
  keeps the bridge; tier-1 `--beaket-paper-*` is the escape hatch within a forced scheme.
- The docs playground's consumer-side workaround (re-bridging `--color-*` to the forced palette on its
  themed wrapper) is no longer needed and was removed — the package fix makes forcing authoritative on its
  own.
- The fix is verified at two levels: jsdom wiring tests lock the derived pin set and its placement (forced
  blocks pin, `system`/media block does not); a browser check confirmed that under a simulated dark-OS
  bridge (`:root --color-paper: #0d1117`) a forced-light editor resolves `.cm-editor --color-paper:
#ffffff` and the `cm-slash-menu` overlay renders light — the rendered-color carve-out of ADR-0005.
