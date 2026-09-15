# Product

<!-- impeccable:product-schema 1 -->

## Scope of this record

This file is product truth for **`@beaket/ui`** — the copy-paste component
registry (`src/components/`), the CLI that distributes it (`packages/cli`), and
its docs site (`docs/`).

`@beaket/paper` is a **sibling product in the same repo, not part of this
record**: CLAUDE.md establishes it as exempt from the component checklist, with
its own brand, its own standalone docs site, and its own context/decision
documents under `packages/paper/docs/`. Its product truth lives in
`packages/paper/PRODUCT.md` (written 2026-09-14). `sites/paper/` is a separate
workspace that still resolves to this file and would need its own record.

## Platform

web

## Users

**Product teams adopting Beaket UI as the foundation of their own internal
design system.** They copy the components in, build on them, and then diverge —
so what they need from the project is extensibility, token clarity, and
migration paths, not a black box that must be upgraded in lockstep.

This supersedes the project's earlier claim of "indie developers, solo founders,
and small product teams," which was retired along with the legacy
`.impeccable.md` design-context file on 2026-09-14.

`@beaket/ui` is **not CJK-first** — that remains a `@beaket/paper` commitment
and must not be assumed here — but as of 2026-09-15 it does carry a **CJK
floor**, decided by the maintainer and now shipped: 12px is the minimum type
step for any script, `--font-sans` and `--font-mono` name Korean and Japanese
families rather than leaving resolution to per-platform OS fallback, and
`:lang(ko)` sets `word-break: keep-all`.

This replaces the flat "no CJK commitment" recorded on 2026-09-14, which
described who authored the system rather than who adopts it. Success here is
external adoption, and a library with no CJK path prices out a large share of
the teams it is trying to win. Consumers must set `lang` on their document for
the line-breaking rule to apply; that is a documented consumer requirement.

Absent evidence, do not upgrade this to a claim of CJK _parity_: there is no
Windows or Linux font-resolution testing, no 1× DPR verification, and no
CJK visual-regression baseline.

## Product Purpose

Give a team a React + Tailwind component set they **own outright** — the CLI
copies source files into their project, with no runtime dependency on this
repo afterwards — carrying a committed visual identity instead of a neutral
default surface.

**Success is real external adoption**: teams outside the project install it and
ship with it, as an alternative to shadcn/ui. That makes onboarding, migration
paths, documentation, breadth, and stability guarantees first-order concerns,
not afterthoughts.

## Positioning

Copy-paste ownership is table stakes in this category; three things together
are not:

1. **A committed material identity, held system-wide.** Ink & Instrument is a
   decided position with explicit refusals, not a configurable skin. A
   neighboring library that ships a neutral default surface cannot claim it
   without becoming a different product.
2. **Two-layer theming that a fork can actually extend.** A theme author writes
   30 palette values; components consume only the 69 shared semantic names.
   Adding a theme never touches component source — the property a
   design-system-base user needs most.
3. **Source ownership without version chaos.** `add` resolves the registry at
   the CLI's own release tag, so copying components is reproducible rather than
   whatever `main` happens to be.

## Operating Context

- Consumers run `npx @beaket/ui init` (detects alias + framework, writes
  `beaket.ui.json`, injects the theme token block), then `add [names…]` to copy
  components and `theme` to swap palettes.
- Copied source lands in the consumer's own repo and is edited there. There is
  no upgrade channel back to this project; re-running `add` overwrites.
- Evaluation happens on the docs site and in Storybook before any install.
- Maintenance runs on pnpm + turbo, Storybook for component work, Astro for
  both docs sites, and changesets for release.

## Capabilities and Constraints

- **29 registry components**, each self-contained (own `cn`, no shared imports):
  alert, avatar, badge, blockquote, breadcrumb, button, card, checkbox,
  data-table, dialog, dropdown-menu, field, input, label, navigation,
  navigation-progress, pagination, progress, radio, select, separator, sheet,
  skeleton, slider, switch, table, tabs, textarea, tooltip.
- **5 themes**: solace (default), porcelain, tobacco, marigold, eucalyptus.
- **Requirements**: React ≥19 (tabs and data-table need ≥19.2), Tailwind CSS 4+,
  TypeScript. Vite and Next.js App Router are the documented setups.
- **Server Components**: compound parts are also exported by name, because
  attached properties (`Tabs.List`) do not cross a client-module boundary
  (#923 supersedes #871).
- **Registry distribution**: `registry/registry.json` is the single source of
  truth, fetched from GitHub raw at the CLI's release tag by default
  (`--latest` / `--registry-ref` override). Note: `CONTEXT.md` still describes
  the old always-`main` behavior and is stale on this point.
- **Published**: `@beaket/ui` (CLI) and `@beaket/paper`, both MIT.
- **Scope ceiling**: primitives and composed patterns only. Page blocks,
  templates, app starters, and design-tool artifacts (Figma libraries, exported
  token packages) are **out of scope**.
- **No commercial tier.** Success is adoption, not revenue; nothing is paid.

## Brand Commitments

- Name: **Beaket UI**. Current docs tagline: "A tactile, copy-paste UI system
  for thoughtful web interfaces."
- Voice: **honest, functional, crafted** — built with care, not decoration; no
  pretense, no filler.
- The **Ink & Instrument** identity and its refusals (no gradients, no blur, no
  border-radius except Radio, no opacity for styling) are binding. The visual
  authority is `DESIGN.md`; it is not restated here, and this file does not own
  it.
- Stated anti-references: shadcn/ui, Material Design, Stripe/Linear, Bootstrap,
  web-brutalism showcases.

## Evidence on Hand

- Live packages: `@beaket/ui` CLI v4.1.0, `@beaket/paper` v0.9.1 (npm, MIT).
- Docs site: https://beaket.github.io/ui/ · Paper site:
  https://beaket.github.io/ui/paper/
- Storybook with `autodocs` and `play`-function interaction tests per component;
  Playwright visual snapshots over Storybook stories and docs routes (Linux
  baselines only — local macOS runs are expected to differ on font rendering).
- Accessibility evidence: `docs/a11y-automated-check-contract.md`, axe-core
  scans, `pnpm test:contrast` over shipped token pairings.
- API guidance: `docs/component-api-patterns.md`.
- An external three-agent hands-on evaluation was carried out and filed as
  GitHub epic #908 with child issues.

**Absences that must not be filled with invention**: there are no adoption
metrics, no named consumers, no testimonials, no case studies, and no usage
statistics. Since adoption is the success metric, any future marketing or
landing work must not fabricate "used by" proof.

## Product Principles

1. **Stability is a feature, not overhead.** A team building on this needs
   reproducible copies and honest version boundaries: pinned registry refs,
   changesets, and a real major when a break is real.
2. **They own the source — opinionated defaults, flexible overrides.** Every
   component is copied and editable, with no runtime dependency and no
   shared-import web, and every one accepts `className` so a consumer can
   override any decision it makes. The library holds a point of view without
   trapping anyone in it; convenience must never be paid for with lock-in.
3. **Extend by tokens, not by forking components.** New themes and new brands
   are expressed in the palette layer; component source stays untouched.
4. **One grammar everywhere.** The same focus, disabled, spacing, and state
   patterns across every component — a team learns the system once and can
   predict the parts they have not read yet.
5. **Claim only what is checked.** Accessibility and quality statements are
   scoped to the checks that actually run; the contract file is the authority,
   and no broader conformance is claimed.

## Accessibility & Inclusion

`docs/a11y-automated-check-contract.md` is the authority. The project reports
that its **defined automated checks pass per revision** and explicitly does
**not** claim WCAG certification or complete WCAG conformance. Exceptions must
be rule-specific, owned, and expiring; there is no accepted violation baseline.

Product-level commitments that follow from the user answers: keyboard operation
and touch-target sizing are treated as functional requirements rather than
polish, because a team adopting this as a base inherits whatever gaps it ships.
