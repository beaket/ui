---
version: 1
slug: "docs"
primary_target: "docs"
related_targets: []
---

Scope: the `@beaket/ui` documentation site at `docs/` — shell, component index,
29 component pages, the prose pages (installation, CLI, updating, migration),
design-rules, tokens, themes, changelog, and 404. Not `sites/paper/`.
Visitor mode: **Read** — a developer deciding whether to adopt, then returning
to reference what they installed.

Constraints confirmed by the maintainer, 2026-09-21: Ink & Instrument stays and
DESIGN.md is untouched. Whole site in scope. No new dependencies.
Server-rendered specimens stay server-rendered — no hydration beyond the
existing ThemeSwitcher and InteractiveExample islands.

## Direction contract

THESIS: The set is the argument. A copy-paste library is judged by how its
parts look and behave, so the index shows the parts at the size they ship and
nothing else — no install cost, no dependency counts, no metadata competing
with the thing itself. This supersedes the Drawing Set direction built earlier
the same day and rejected on sight: its schedule column priced every part in
files and dependencies, and the maintainer's verdict was that nobody cares.

OWN-WORLD: Ink & Instrument, unchanged. Square corners, flat fills, zero-blur
offset shades, one neutral ink at three pressures, accent reserved for
engagement. The manual letters its own furniture — running heads, section
counts, code, token names — in the mono; everything the product says stays in
the sans DESIGN.md pins. No display face.

STORY: A developer lands on the whole set, grouped by the job each part does,
and reads it by looking. They pick one, get it at full stage with the two lines
they actually need — the add command and the import — then its examples and its
props.

FIRST VIEWPORT: A light title block (name, one sentence, one copyable install
line), then **Form** — the first of six named sections. Two columns of
specimens parted by shared seams, each cell holding the part at true size above
its name. No card draws a resting border. Table and DataTable take the full
measure because a column would cut them.

FORM: A specimen gallery, chosen by the maintainer from four presented layouts
after the Drawing Set was rejected. Groups: Form, Feedback, Navigation,
Surface, Data, Overlay. Seed key 87c576b0 governed the retired round only; this
composition was pinned by the maintainer, and a pinned decision beats the roll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance

Two rules this surface learned the hard way and must keep:

1. **A cell link overlays, never wraps.** Specimens contain their own links and
   buttons; an `<a>` around one is re-parented by the HTML parser into the
   component's own markup.
2. **Never name a docs class `group`, `peer`, or any other Tailwind marker.**
   The component library uses `group` throughout; a docs rule on `.group` lands
   on every nav link, tab trigger and pagination key on the page.

Prose rules are scoped away from specimens with
`:not(:where(.stage *, .specimen *, [data-slot], [data-slot] *))`. A docs rule
that reaches inside a component restyles the very thing the page exists to show.

## Unresolved

- Six shipped examples size themselves with `h-full`, written for the old
  fixed-height grid cell. `needsSizedStage()` detects them from source and gives
  them a plain fixed box. Worth fixing in the examples instead.
- Playwright visual snapshots cover docs routes with Linux-only baselines; this
  redesign invalidates all 30 and they cannot be regenerated on macOS.
- Grid rows stretch to their tallest cell, so a short specimen beside a tall one
  carries dead space. Acceptable as air; revisit if it reads as emptiness.
