---
name: Beaket UI
description: Ink & Instrument — a printed page you can press.
colors:
  bg: "#fdfcfa"
  bg-raised: "#f4f3f2"
  bg-overlay: "#ecebea"
  bg-input: "#fdfcfa"
  bg-hover: "#dbdada"
  bg-active: "#bcbcbc"
  bg-disabled: "#dbdada"
  bg-emphasis: "#16151d"
  fg: "#24232a"
  fg-muted: "#525257"
  fg-subtle: "#636367"
  fg-disabled: "#747477"
  fg-on-emphasis: "#fdfcfa"
  fg-link: "#2657d0"
  border: "#868688"
  border-muted: "#a1a0a2"
  border-subtle: "#bcbcbc"
  border-strong: "#16151d"
  border-focus: "#2657d0"
  accent-solid: "#2657d0"
  accent-fg-on-solid: "#fdfcfa"
  danger-solid: "#961733"
  danger-fg-on-solid: "#fdfcfa"
  success-solid: "#498c67"
  success-fg-on-solid: "#16151d"
  warning-solid: "#ddb54c"
  warning-fg-on-solid: "#16151d"
  info-solid: "#643d75"
  info-alt-solid: "#3c9baa"
  bg-emphasis-hover: "color-mix(in oklab, #2657d0 24%, #16151d)"
  bg-emphasis-active: "color-mix(in oklab, #2657d0 14%, #16151d)"
  accent-bg: "color-mix(in oklab, #2657d0 17%, #fdfcfa)"
  accent-bg-subtle: "color-mix(in oklab, #2657d0 8%, #fdfcfa)"
  warning-fg: "color-mix(in oklab, #ddb54c 50%, #16151d)"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Hiragino Sans, Yu Gothic UI, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.333
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Hiragino Sans, Yu Gothic UI, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Hiragino Sans, Yu Gothic UI, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Hiragino Sans, Yu Gothic UI, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Hiragino Sans, Yu Gothic UI, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.45
  mono:
    fontFamily: "SF Mono, Roboto Mono, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.45
rounded:
  none: "0"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
components:
  button-primary:
    backgroundColor: "{colors.bg-emphasis}"
    textColor: "{colors.fg-on-emphasis}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.bg-emphasis-hover}"
    textColor: "{colors.fg-on-emphasis}"
  button-primary-active:
    backgroundColor: "{colors.bg-emphasis-active}"
    textColor: "{colors.fg-on-emphasis}"
  button-secondary:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "36px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "36px"
  button-danger:
    backgroundColor: "{colors.danger-solid}"
    textColor: "{colors.danger-fg-on-solid}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "36px"
  button-small:
    backgroundColor: "{colors.bg-emphasis}"
    textColor: "{colors.fg-on-emphasis}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "32px"
  input:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  input-readonly:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "20px"
  card-overlay:
    backgroundColor: "{colors.bg-overlay}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "20px"
  badge-default:
    backgroundColor: "{colors.bg-emphasis}"
    textColor: "{colors.fg-on-emphasis}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  tab-active:
    backgroundColor: "{colors.accent-bg-subtle}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "32px"
  menu-item-highlighted:
    backgroundColor: "{colors.accent-bg}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
  checkbox:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    size: "16px"
  radio:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.fg}"
    rounded: "{rounded.full}"
    size: "16px"
  switch:
    backgroundColor: "{colors.border-muted}"
    rounded: "{rounded.none}"
    width: "28px"
    height: "16px"
  switch-checked:
    backgroundColor: "{colors.bg-emphasis}"
    rounded: "{rounded.none}"
    width: "28px"
    height: "16px"
---

# Design System: Beaket UI

## Overview

**Creative North Star: "Ink & Instrument — a printed page you can press"**

Everything on screen is drawn, not lit. The references are the print shop and
the machine shop: a well-set page, ruled forms, keys that travel when pressed.
Corners are square, color is flat, borders are pen strokes, and shadows are
offset marks with zero blur — the trace a raised object leaves on paper, not the
glow of a light source. Nothing here emits light, because nothing printed does.

The identity is rationed by scale, and the rationing is the thesis: **a drawn
edge means you can act on it.** _Instruments_ — button, input, select trigger,
checkbox, radio, switch, badge — keep the 1px pen, the accent edge on engage,
and the grown edge while they hold an overlay open. _Surfaces_ — card, alert,
table wrapper, DataTable container — carry no resting stroke at all; they are
read by their fill step (page → raised → overlay) plus the drawn grey shade.
Overlays keep a frame because they float over arbitrary content. Where two
strokes must meet, they share one seam rather than stacking. A border around a
region only repeats what the surface already said, and repeating it at every
nesting level is what made a dense screen unreadable.

The system runs on one pen and one vivid voice. The neutral ramp is a single ink
used at full strength for text, strong borders, and solid fills, so a line and a
fill always agree about what matters. Ink is never diluted, only rationed — and
it is rationed by _pressure_, not by grey: ink (`border-strong`), hairline
(`border` / `border-muted`), seam (`border-subtle`). Against that monochrome
ground, exactly one chromatic voice — the accent — is reserved for what you can
act on. Signals (danger, success, warning, info) carry meaning but never
emphasis, so a screen full of status never becomes a screen full of shouting.

Depth is semantic before it is spatial. A grey offset shade means "this is a
raised surface"; an accent edge means "this responds to you." Pressables are
neutral at rest, reveal a thin accent edge on hover, and drop onto it under the
press. Writing fields stay quiet until engaged and then cap off with a static
edge that leaves when the pen lifts. Small controls are instruments: the chassis
stays put while the inner key — a check, a thumb, a label — travels one pixel.
Brutalism supplies the refusals (no gradients, no blur, no rounding, nothing
that lies about structure) but not the aggression. The goal is precision, not
rawness.

**Confirmed visual rejections.** This must not look like shadcn/ui (too soft,
too rounded, too close to what everyone ships), Material Design (too corporate,
too systematic), Stripe or Linear (lit rather than drawn — glow, gradients,
blurred elevation; the precision is shared, the material is not), Bootstrap (no
point of view), or a web-brutalism showcase (aggression as the point). What a
person should feel using it is confidence and clarity, respect for the craft,
and material distinction — made, not assembled from the same lit parts as
everything else.

**Key Characteristics:**

- Square by default — `0` radius everywhere except Radio's circle.
- Surfaces carry no resting stroke; instruments keep the 1px pen.
- One neutral ink at three pressures — ink, hairline, seam. No diluted grey.
- One chromatic accent, reserved for interaction — never for decoration.
- Offset shadows with zero blur; grey for surfaces, accent for engagement.
- Flat fills only. No gradient, no blur, no opacity used as a styling device.
- 14px carries the interface; 12px carries labels. The floor is set by CJK.
- Two-layer tokens: a theme writes 30 palette values, components read 69
  semantic names and never touch a palette value directly.

## Colors

A monochrome page with one vivid voice: paper and graphite carry all structure,
and chroma appears only where the interface asks for action or status. The
values in the frontmatter are **Solace**, the default theme; four other palettes
(porcelain, tobacco, marigold, eucalyptus) supply their own 30 values to the
same names.

**The page is painted.** `semantic.css` sets `body { background-color:
var(--color-bg); color: var(--color-fg) }` as an element selector, so any
consumer rule wins over it. This matters more than it sounds: every surface role
is defined as a step _away from that fill_, and until the fill was painted the
ladder only existed on paper.

### Primary

- **Ballpoint Blue** (`accent-solid`): the single vivid voice. It marks what you
  can act on and nothing else — the hover and open-state edge under pressables,
  the focus outline, the caret in a writing field, the leading rule on the menu
  row you would act on, link text, and the faint lens fill under the current
  navigation cell. It is never a fill for a resting control and never decoration.
- **Lens Wash** (`accent-bg-subtle`): the faintest accent wash (8% into paper).
  Fills the current cell of a navigation strip or tab row, under a two-tone rim.
- **Menu Wash** (`accent-bg`): the accent tint (17% into paper) behind the
  currently navigated menu or select row, always paired with a 2px inset
  leading rule and ink-colored text.

### Secondary

- **Graphite Ink** (`bg-emphasis` / `fg` / `border-strong`): the deepest step of
  the neutral ramp, and the system's emphasis material. It is simultaneously the
  body text color, the strong border color, and the primary button's fill —
  that identity is the point. Primary emphasis is ink alone; accent joins it
  only under hover, open ownership, or keyboard focus.

### Tertiary

Five status inks, each shipped with its own knockout foreground. They are
muted on purpose — meaning without emphasis.

- **Oxblood** (`danger-solid`): destructive actions, invalid fields, destructive
  menu rows.
- **Deep Pine** (`success-solid`): confirmation and successful state.
- **Ochre** (`warning-solid`): caution. The only signal whose knockout is ink
  rather than paper, because the ochre is light enough to need it. It measures
  2.13:1 against raised paper, so it may fill a shape but must never be the only
  thing drawing a boundary — Alert's warning rule uses `warning-fg` instead.
- **Slate Blue** (`info-solid`) and **Teal** (`info-alt-solid`): neutral
  information, and a second information voice when two must be distinguished.

**Every role carries the same seven slots**, so a role is swappable wholesale:
`-solid`, `-fg-on-solid`, `-solid-hover`, `-solid-active`, `-fg`, `-bg`,
`-border`. Accent alone adds an eighth, `-bg-subtle`, for the lens fill.

### Neutral

Two axes share one origin. The **tone ramp** descends twelve steps from paper
into ink and supplies every stroke, every type color, and every knockout. The
**surface ladder** rises from the page toward white and supplies the three
container fills. Components read roles, not steps.

- **Stock** (`bg`, `#f6f6f6`): the page itself — what everything is printed on.
- **Paper** (`bg-raised`, `#fdfdfb`; `bg-input`, `#fdfdfb`): the raised sheet,
  and the writable surface. These are the same value in Solace light but not the
  same token: `bg-raised` is `--surface-1`, `bg-input` is `--tone-0`. The ramp
  stays anchored on paper — the sheet — while the ladder is anchored on the
  stock. In Solace dark the two diverge the other way (`tone-0` equals
  `surface-0`, so a writable field sits flush with the page there).
- **Overlay Paper** (`bg-overlay`, `#ffffff`): dialogs, sheets, menus, select
  panels, and a card at `overlay` elevation. The top of the ladder.
- **Pressed Paper** (`bg-hover`, `bg-active`, `bg-disabled`): the neutral
  hover and press fills, and the disabled well.
- **Hairline** (`border`): the ordinary border that bounds a control — one step
  of ink, not a faded one.
- **Faint Hairline** (`border-muted`): fused-strip frames, table footers, and
  every disabled border (always dashed).
- **Seam** (`border-subtle`): a divider _inside_ a surface. The two things it
  parts are already known to belong together, so it needs less pressure than a
  border that bounds a control. Its only consumer in the shipped set is the
  table row rule; the Separator component and the dropdown/select menu rules
  still draw at `border-muted` — drift between the token's stated purpose and
  its use, recorded and not repaired here.
- **Quiet Ink** (`fg-muted`, `fg-subtle`, `fg-disabled`): secondary text,
  placeholders, and disabled labels — the only place the ramp's middle is used,
  and only for type, never for strokes.
- **Shade**: the grey of a drawn offset shadow. It is not in the color API at
  all — it reaches components only through `shadow-offset` and
  `shadow-offset-overlay` (see Elevation & Depth), never as a border or text
  color.

### Named Rules

**The One Ink, Three Pressures Rule.** The neutral ramp is a single ink, and a
1px stroke chooses how hard the pen is pressed: ink (`border-strong`) bounds a
region that outranks the page, hairline (`border` / `border-muted`) bounds a
control, seam (`border-subtle`) divides inside a surface. There is no fourth
pressure and no "slightly softer black" between them. What this replaces is the
old habit of drawing every seam at full hairline strength and then framing the
group as well.

**The Border-Means-Act Rule.** A resting stroke is a claim that you can operate
the thing it encloses. Instruments make that claim; surfaces do not. If a new
region wants a border, the question is whether it is pressable — and if it is
not, the answer is a fill step and a shade.

**The One Vivid Voice Rule.** The accent belongs solely to what you can act on.
Hue carries meaning, never emphasis. If a mark is not focus, open ownership,
hover intent, current selection, or a link, it does not get the accent.

**The Knockout Rule.** Every solid ships with its own foreground
(`danger-solid` + `danger-fg-on-solid`). Never hand-pick a text color on a
solid, and never mix roles — warning text on an info tint is a defect, not a
variation.

**The Palette-Swap Rule.** Components consume only the 69 semantic names (64
color + 5 shadow). A theme authors 30 palette values (`--surface-0…2`,
`--tone-0…11`, `--signal-*`, `--signal-*-on`, `--shadow-size`, `--shadow-color`,
`--shadow-color-overlay`) and nothing else; 27 of those are functional
dependencies and `--tone-8…10` are reserved ramp slots. Writing `--tone-4` or a
raw hex inside a component is the one unforgivable color error: it breaks every
theme at once. Dark mode is the same mechanism — a palette swap under
`prefers-color-scheme: dark`, not a separate set of component rules.

**Contrast coverage is partial, and stated as such.** The shipped contrast
policy covers type on its fill. It does _not_ cover the selection fill, the
structural boundaries between surface steps, or role boundaries. Measured and
unresolved: the navigation/tab selection plate is ~1.11:1 in light and ~1.01:1
in dark; `warning-solid` used as a boundary is 2.13:1; `border-subtle` on raised
paper is 1.58:1, which is correct for a seam and insufficient for anything
load-bearing.

## Typography

**Display Font:** none — the system font stack does every job.
**Body Font:** the host platform's UI face, with explicit CJK fallbacks
(`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`,
Arial, `Hiragino Sans`, `Yu Gothic UI`, `Apple SD Gothic Neo`, `Malgun Gothic`,
sans-serif)
**Label/Mono Font:** `SF Mono`, `Roboto Mono`, Menlo, Monaco, Consolas, monospace

**Character:** Deliberately unbranded and native. In a system where every other
decision is loud about being drawn, the type stays the reader's own — the page
is set, not typeset with a personality. The scale is compact (12–20px), because
this is instrument type: dense, legible at a glance, and never competing with
the marks around it.

### Hierarchy

Sizes and line heights below are the compiled values, not the authored ones:
Tailwind pairs each size with a leading ratio from its own scale, and only the
two interface steps are pinned in `foundation.css`.

- **Display** (700, 1.25rem/20px, 1.333 → 26.7px): the largest step in the
  scale. Page-level headings on documentation and Storybook surfaces; no
  registry component uses it.
- **Headline** (600, 1.125rem/18px, `leading-7` → 28px): Dialog and Sheet titles
  — the one place a component raises its voice, because a modal must announce
  itself. The leading is set literally on the element, not by the ratio.
- **Title** (600, inherited size, `leading-tight` → 1.25): Card titles and
  in-component section headings. Card sets no size on its root, so the title
  takes the host's text size. Weight, not size, does the work.
  `leading-none` was measured clipping 1.13px of its own Latin descenders before
  any deeper-bodied script was considered, so the floor is `tight`.
- **Body** (400, 0.875rem/14px, 1.55 → 21.7px): the interface voice — labels,
  menu rows, table cells and headers (headers at 600), input text, default and
  large button text, tabs, navigation, pagination. The overwhelming majority of
  type in the system: 28 of the 36 explicit size utilities in the component
  sources.
- **Label** (500, 0.75rem/12px, 1.45 → 17.4px): badges, the small button size,
  tooltips, menu group labels and shortcuts, and select panel labels. Six of
  the 36.
- **Mono** (500, 0.75rem/12px, 1.45): code badges and inline code only.

### Named Rules

**The Two-Size Rule.** 14px carries the interface and 12px carries labels.
Together they are 34 of the 36 explicit size utilities in the component
sources — every one except Dialog's and Sheet's titles. Reaching past them is a claim that this element outranks
the whole interface — Dialog and Sheet titles are the only components that earn
it.

**The CJK-Floor Rule.** 12px is the minimum step for any script, and the floor
is set by CJK, not by Latin taste. Hangul packs two or three jamo into one em
and kanji can carry a dozen strokes, so both collapse below 12px where Latin at
the same size still reads. The two interface steps therefore pin their own
leading (`--text-xs--line-height: 1.45`, `--text-sm--line-height: 1.55`) rather
than inheriting Tailwind's tighter defaults, which crowd CJK at 14px.

**The Per-Script Routing Rule.** Font fallback runs per codepoint, and a Korean
face such as Apple SD Gothic Neo also covers the CJK ideograph block — so one
flat family list cannot serve both Korean and Japanese: whichever is named first
captures every ideograph and the other language renders in the wrong national
glyph forms. `@layer base` therefore re-declares `font-family` per `:lang(ko)`,
`:lang(ja)`, `:lang(zh)` and `:lang(zh-Hant)`. It is re-declared, not swapped
through a variable, because preflight resolves `font-family` once on `html` and
descendants inherit the already-resolved value. `:lang(ko)` additionally sets
`word-break: keep-all` with `overflow-wrap: break-word` as the relief valve;
Japanese and Chinese carry no inter-word spaces and must not inherit it.
**The consuming application must set `lang` on the document** or none of this
applies. `src/components/cjk.stories.tsx` is the rendered baseline — nothing
else in the set contains a Hangul or Kana glyph, which is how a type scale that
was unusable in Korean stayed green through 357 visual snapshots.

**The Weight-Before-Size Rule.** Hierarchy inside a component is made with
weight (400 → 500 → 600) and with ink color (`fg` → `fg-muted`), not by growing
the type. A card title is the same size as its body text.

**Dead type tokens, recorded not repaired.** `--text-md` (16px) generates no
Tailwind utility — `md` is not a key in Tailwind's font-size namespace — so
nothing can consume it. `--leading-snug` (1.35) and `--leading-normal` (1.5) are
declared and consumed by nothing. `--leading-tight` is consumed (Card.Title) but
restates Tailwind's own default, so the declaration is a no-op;
`--leading-relaxed` (1.65) is consumed by Alert and does override. `--text-base`
(15px) has no component call sites.

## Layout

Spacing uses Tailwind's default 4px scale, and the steps actually in play are
narrow: 4px (icon gaps, menu padding), 8px (control gaps), 12px (input padding),
16px (button padding, card content gap), 20px (card padding), 24px (dialog
padding). Density is high by intent — this is instrument spacing, sized so a
dense screen stays readable rather than sized to feel generous.

Controls share a height ladder so that a row of mixed controls aligns on both
edges: 32px (small button, navigation cell, tab, pagination key, small select
trigger), 36px (default button, input, select trigger, icon button), 40px (large
button, table header row). The ladder is deliberately held where it was while
type moved up a step, so the change reads as calmer type rather than a bigger UI.

Small instruments share a **16px chassis** (checkbox, radio). Switch is a track
rather than a square choice and defaults to `sm`: 28×16, 36×20, 44×24px with 8,
12, and 16px thumbs. At 16px the instrument sits under the cap height of a 14px
Korean label instead of over it — which is the composition the type change was
made for.

Breakpoints are Tailwind 4 defaults (640 / 768 / 1024 / 1280 / 1536px) — the
system defines none of its own, because a component library adapts inside
whatever grid its host provides.

### Named Rules

**The Fused Strip Rule.** Navigation, tab and pagination cells do not float as
separate chips — they share one seam, and the strip carries no standing edge of
its own. Two mechanisms are in use: Navigation borders the `<li>` and cancels
the neighbour's leading border (`[&>li+li]:border-l-0`); Tabs and Pagination
border the cell and pull it back one pixel (`-ml-px first:ml-0`). Either way the
result is a single ruled line where two cells meet, never two. Gaps between
cells break the instrument.

**The Hit-Target Rule** (replaces the old universal 44px claim, which was never
true in the code). Touch targets are sized by what the control stands beside:

- **An instrument that stands alone** carries an invisible hit expander to 44px:
  `before:absolute before:inset-[-Npx] before:content-['']`. The pseudo-element
  is measured from the _padding_ box, so both 1px borders count: `-15px` on the
  16px checkbox / radio / switch chassis, `-14px` on a 16px glyph button
  (Dialog's close). Verify the real box in the browser, never by arithmetic on
  the class name alone.
- **Inside a fused strip**, expansion is vertical only, plus the outer edges of
  the strip: `before:inset-x-0 before:-inset-y-2` with `-left-2` on the first
  cell and `-right-2` on the last. A 32px cell reaches 46px tall. Horizontal
  expansion inside a strip steals clicks from the neighbouring cell — that was a
  live bug, not a theoretical one.
- **`<input>` and 36px pressables rely on their own box.** An `<input>` is a
  replaced element and cannot carry `::before` at all, and 36px buttons in an
  8px-gap toolbar cannot be expanded without their hit areas overlapping. Both
  clear WCAG 2.2 AA's 24×24px minimum, which is the claim this system makes for
  them.
- **Stacked bare instruments need a 44px pitch.** Expanders do not create space;
  they consume it. A column of 16px checkboxes spaced closer than 44px has
  overlapping hit boxes no matter what the inset says.

## Elevation & Depth

There are no lit shadows in this system. Elevation is drawn: a hard offset with
zero blur and zero spread, exactly the trace a raised object leaves on paper.
Since surfaces gave up their resting borders, the shade is now the load-bearing
signal that something is raised rather than a decoration beside a border that
already said so — which is why Solace draws it at 2px in both schemes. Depth is
also semantic: the shadow's ink says what kind of thing is raised. A grey shade
means "this is a surface." An accent edge means "this responds to you."

Offset size is a theme decision, not a component one: Porcelain draws at 1px,
Solace, Tobacco and Eucalyptus at 2px, Marigold at 3px. The same component
therefore feels differently pressed under a different palette, which is intended.

### Shadow Vocabulary

Values are Solace; `--shadow-size` and the two shade greys are per-theme.

- **Surface shade** (`box-shadow: 2px 2px 0 0 #c4c4c4`): raised surfaces — a
  card at its default elevation, a table with `shadow`. Static.
- **Overlay shade** (`box-shadow: 2px 2px 0 0 #a0a0a0`): dialogs, sheets, menus,
  select and dropdown panels, and a card at `overlay` elevation. A darker grey
  for a higher layer. Static.
- **Action edge** (`box-shadow: 2px 2px 0 0 #2b5bff`): revealed on hover under
  an edged pressable, held statically by an engaged writing field, and taken by
  an interactive card's shade on hover.
- **Grown action edge** (`box-shadow: 3px 3px 0 0 #2b5bff`): held by a trigger
  for as long as it owns an open overlay. Open mirrors hover, one step louder.
- **Danger edge** (`box-shadow: 2px 2px 0 0 #a13d52`): replaces the action edge
  on an invalid field under focus.
- **Menu leading rule** (`box-shadow: inset 2px 0 0 0 #2b5bff`): the inset
  accent rule down the leading edge of the currently navigated menu or select
  row. 2px, because it marks engagement rather than mere proximity.

### Named Rules

**The Drawn-Not-Lit Rule.** Every shadow is `<offset> <offset> 0 0 <color>`,
and the offset is always down-and-right. Blur radius and spread are always zero.
A blurred shadow claims a light source, and nothing on a printed page emits
light. This also governs rims: ink gathers where the shade falls, so a two-tone
rim is light on the top/left and ink on the bottom/right, never the reverse.

**The Shadow-Is-Voice Rule.** Grey shade = raised surface. Accent edge =
engagement. A surface never takes the accent edge _at rest_; a passive surface
never gains one at all. An interactive surface is the one crossing: it rests as
a raised sheet with the grey shade and **changes voice** on hover — the same
shade turns accent while the fill lifts one ladder step. Without a resting shade
a borderless interactive card would be invisible until hovered.

**The One-Shadow Rule.** Exactly one shadow utility may land in a class list.
tailwind-merge cannot dedupe custom shadow utilities against one another, and
`shadow-none` does not opt a variant out of `shadow-offset-action`. Assign the
shade and the edge through mutually exclusive variants, never by layering and
overriding.

**The Press-Drops-On Rule.** Pressing removes the shadow and translates the
element one pixel toward it
(`active:shadow-none active:translate-x-px active:translate-y-px`), so the
control physically lands on the edge it revealed. Ghost and Link buttons opt out
of both, because they never had an edge to drop onto.

## Shapes

Square is the default and the identity. `border-radius: 0` everywhere, with one
exception: **Radio** is a full circle, because a round choice and a square choice
must never be confused for one another. That exception is the entire radius
vocabulary — there is no `sm`/`md`/`lg` scale to reach for.

Borders are pen strokes and, where they appear, they are 1px — except the 2px
marks reserved for engagement (Alert's leading role rule, the menu leading rule,
the `--border-width-medium` token). Where they appear is now the decision: an
instrument is bounded, a surface is not, an overlay panel is framed because it
floats over content it cannot predict. Disabled is expressed by switching the
stroke to dashed (`border-dashed` + `border-border-muted`) rather than by fading
it — a dashed line reads as "drawn but inactive," while a faded line would be
diluted ink.

Selection and current-state marks are drawn as inset rectangles rather than
applied to the element's own border: a navigation or tab cell paints an `::after`
plate inset 4px, with a two-tone rim (hairline top/left, ink bottom/right) over
the lens wash. The plate sits behind the label on its own layer (`-z-[1]` under
an `isolate` root), which is why the label never shifts when a cell becomes
current.

### Named Rules

**The Square Rule.** Radius is `0`. The only circle in the system is Radio's
chassis and its dot. If a new component wants a rounded corner, the answer is
no — find the meaning that corner was carrying and draw it with a stroke.

**The No-Frame-On-Frame Rule.** Nothing draws a boundary that its container
already drew. A table inside a card has no wrapper border; rows are parted by
seams that reach the card's padding edge. An alert is a rule and a glyph on
paper, not a box on a surface.

**The Dashed-Disabled Rule.** Disabled always means the same four things:
dashed border, `border-muted` stroke, `bg-disabled` fill, `fg-disabled` text —
plus removal of every shadow and interaction affordance. Never opacity.

## Components

### State Precedence

Accent is a scarce state signal, not a permanent synonym for "interactive."
Persistent affordance comes from neutral material — ink fill, border, label, or
geometry — so a dense screen never becomes a field of equally loud marks. Within
a single visual channel, the highest priority wins:

| Priority | State                              | Channel                                                                                                                                                                                                         |
| -------: | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        1 | Keyboard focus                     | A 2px offset outline on pressables; the cap-off edge on writing fields. Invalid focus replaces accent with danger.                                                                                              |
|        2 | Open ownership / active engagement | A grown offset edge on overlay owners; a 2px inset leading rule on the active menu row. Pointer press temporarily wins with physical translation plus active fill, and drops any hover edge.                    |
|        3 | Hover intent                       | A thin offset edge on edged pressables, or a neutral tint/text change where an edge would be too dense.                                                                                                         |
|        4 | Current selection                  | A faint lens fill and two-tone rim for navigation and tabs, or ink fill plus position/indicator for native choices. Selection never borrows the focus outline.                                                  |
|        5 | Persistent affordance              | Neutral border, ink surface, fill step, label, and geometry only. No standing accent edge. Primary emphasis is the ink-filled surface alone; accent joins it only for hover, open ownership, or keyboard focus. |
|        6 | Content navigation                 | Accent text plus hover underline for ordinary links. Breadcrumb ancestors deliberately stay muted and darken on hover.                                                                                          |

The Focus-Outermost Rule and the One-Channel Rule at the end of this section are
this table's two corollaries: the first says priority 1 always renders outside
everything below it, the second says nothing below it may render twice in one
channel.

### Buttons

- **Shape:** square (`0` radius), 1px border, heights 32 / 36 / 40px (sm / md /
  lg) and a 36px square icon variant. Horizontal padding 12 / 16 / 24px. Type is
  12px on `sm` and 14px on `md` and `lg`, all at weight 500.
- **Primary:** ink fill (`bg-emphasis`) with paper text (`fg-on-emphasis`) and
  an ink border. Ink alone is the complete persistent emphasis signal — the
  accent never appears at rest.
- **Hover / Focus:** hover reveals the accent edge and mixes 24% accent into
  the ink fill; focus is a 2px accent outline offset 2px, always the outermost
  mark. Active drops the shadow and translates 1px. A trigger holding an open
  overlay holds the grown edge (`data-[state=open]`), which Radix supplies
  natively to `asChild` triggers.
- **Secondary:** raised paper fill, hairline border, neutral hover fill, same
  accent edge on hover.
- **Outline:** transparent and airy at rest with a hairline border; on engage
  the edge grows rather than a fill appearing. The press keeps a faint grey
  settle (`active:bg-bg-active`) to confirm the drop.
- **Ghost / Link:** not edged pressables. Ghost's only hover signal is the grey
  fill; Link is `fg-link` text with a hover underline. Neither takes an edge and
  neither translates on press.
- **Destructive / Success / Warning:** role solid plus its own knockout
  foreground, with matching `-hover` and `-active` solids and a border in the
  same role.
- **Loading:** a stroked SVG spinner in `currentColor`; a `type="submit"` button
  inside a form reads React's `useFormStatus` pending state with no wiring.

### Cards / Containers

- **Corner Style:** square (`0`).
- **Background:** raised paper (`bg-raised`), or overlay paper at the `overlay`
  elevation.
- **Border:** none. A card is a sheet laid on the page, not a box drawn on it.
- **Shadow Strategy:** `shade` by default, `overlay` for the higher layer,
  `flat` for none — and `flat` therefore means **flush**: on a raised parent the
  card carries no mark of its own, which is what no elevation should look like.
  An `interactive` card rests with the grey shade, lifts its fill to overlay
  paper on hover while the shade turns accent, and drops on press. Focus owns the
  outer 2px outline.
- **Internal Padding:** 20px, with a 16px column gap between children. A card is
  a material, not a template — it imposes no header/body/footer structure.
  `Card.Section` cancels the padding (`-mx-5`, and top/bottom as first/last
  child) so media and full-width rules reach the edges.
- **Title:** weight 600 at `leading-tight`, inheriting its size.

### Inputs / Fields

- **Style:** paper fill (`bg-input`) on the stock, 1px hairline border, square,
  36px tall, 12px horizontal padding, 14px text. Placeholder in `fg-subtle`.
- **Focus (cap-off):** no outline. Focus draws the static accent edge and
  nothing else — no growth on hover, no drop on press, and the edge leaves when
  the pen lifts. The caret is `accent-solid` and text selection uses `accent-bg`.
- **Read-only:** sits flush with the page (`bg-bg`) with a `border-muted`
  stroke, and takes the grey surface shade on focus instead of the accent edge.
  A writable field is a fresh sheet laid on the page; a read-only one is printed
  into it. Softening the border alone left the two states measurably identical
  in fill and only 2.26:1 apart in stroke.
- **Error / Disabled:** `aria-invalid` swaps the border to the danger solid and
  the focus edge to the danger edge. Disabled follows the universal dashed
  pattern.
- **Textarea** carries the identical grammar with 8px vertical padding, and
  auto-resizes to content by default.

### Tables

- **Wrapper:** no border and no fill of its own — a keyboard-focusable
  horizontal scroll region with a 2px focus outline, and the grey surface shade
  only when `shadow` is set. DataTable's container is the same: `bg-bg-raised`,
  nothing drawn.
- **Header:** a single `border-strong` rule under the header row and no fill.
  The near-black rule is the one heavy mark in the region; the grey header fill
  it used to carry was a second claim on the same boundary. Cells are 40px,
  `nowrap`, weight 600.
- **Rows:** raised paper, parted by `border-subtle` seams; the last row drops
  its seam. Hover takes `bg-hover`, selected takes `bg-active`. Body cells wrap
  (16px × 10px padding) — only heads stay `nowrap`, so a long cell grows the row
  instead of the table.
- **Footer:** a `border-muted` top rule at weight 500 — a lighter close than the
  header's opening.
- **Section header:** a `bg-active` fill with `border-muted` rules above and
  below. The one row in the set that is read by fill rather than by rule.
- **Caption:** `fg-muted`, 14px, 16px below the table.

### Navigation

- **Style:** a fused strip. Each `<li>` carries the `border-muted` frame and the
  next one cancels its leading border, so cells share one seam and the strip has
  no standing edge of its own. No shadow.
- **Typography:** 14px in full ink, 32px cell height, 14px horizontal padding.
- **States:** hover and press use neutral fills only, and the label travels 1px
  under the press while the cell holds still. The current cell paints an inset
  `::after` plate filled with the lens wash under a two-tone rim (hairline
  top/left, ink bottom/right) — a glass plate laid over the page, not a highlight
  applied to the text. Keyboard focus is the standard 2px accent outline and
  raises the cell's z-index so the outline is never clipped by a neighbour.
- **Tabs** use the identical grammar, fusing with `-ml-px` instead. Because
  activating a tab _is_ the press, tabs snap rather than travel; only the surface
  tint transitions.
- **Breadcrumb** is deliberately different: it is a trail, not a switcher.
  Ancestors are `fg-muted` and darken to full ink on hover, the current page is
  full ink, no cell is edged, and accent appears only for keyboard focus.

### Menus (Dropdown, Select)

- **Panel:** overlay paper, 1px `border-strong` frame, the overlay shade, 4px
  padding. The strong frame is deliberate and differs from Dialog's hairline: a
  menu is a small thing landing on arbitrary content and must cut itself out of
  it.
- **Row:** the currently navigated row takes the accent wash plus a 2px inset
  accent rule down its leading edge, with the label left in ink. An open
  submenu's parent row holds that same cue for as long as the submenu is out.
  Group labels and shortcuts are 12px `fg-muted`.
- **Destructive rows** swap the whole cue to danger.
- **Select trigger** is field-surfaced — `bg-input`, hairline border, 32/36px on
  the shared ladder — and quiet at rest and on hover. It is pressed rather than
  written in, so it keeps the keyboard outline and holds the grown accent edge
  while its menu is open.

### Small Controls (Checkbox, Radio, Switch)

These are instruments, not miniature buttons. The chassis stays fixed and only
the inner key moves.

- **Checkbox / Radio:** a shared 16px chassis, 1px hairline border, `bg-input`
  fill. Checkbox is square; Radio is the system's single circle. The 16px size
  is what lets the instrument sit under the cap height of a 14px CJK label.
- **Checked:** ink fill with a 10px paper-colored glyph (Checkbox) or a 6px ink
  dot (Radio); the checked border stays `border`, not `border-strong`. Checked
  is ink plus an indicator — never the accent.
- **Hover:** reveals the accent edge and tints the unchecked box. **Press:** the
  glyph, dot, or thumb translates 1px while the chassis holds still. A checked
  radio cannot be unchecked, so it takes no press affordance at all.
- **Switch:** a track defaulting to `sm` (28×16, then 36×20, 44×24px) with an
  8 / 12 / 16px thumb. Checked fills the track with ink; unchecked uses a
  `border-muted` track that darkens one step to `border` on hover.
- All three carry the `-15px` expander when they stand alone, which reaches 44px
  from the padding box.

### Overlays (Dialog, Sheet)

- **Scrim:** the ink at 50% alpha (`bg-bg-emphasis/50`). This is the only place
  in the system where alpha is used, and it is a veil over the page rather than
  a styling effect on an element.
- **Panel:** overlay paper, a 1px `border` hairline (not the menus' strong
  frame — a modal already owns the screen), the overlay shade, 24px padding,
  16px gap. Title at 18px/600 on 28px leading; description `fg-muted` at 14px.
- **Close affordance:** a muted glyph in the top-right corner that darkens to
  full ink on hover, with a `-14px` hit expander and the focus outline.
- Triggers inherit their own component's policy and add no second open cue —
  the scrim already obscures it.

### Status (Alert, Badge)

- **Badge:** square, 1px border, 12px/500 type, 2px × 8px padding. `default` is
  ink with paper knockout and a `border-strong` frame; role variants are the
  role solid with its own knockout and a border in the same role; `secondary`,
  `outline` and `code` stay neutral, `code` in mono.
- **Alert:** raised paper, never a tinted well and no longer a box. The role
  marks **one 2px rule down the leading edge** (`border-l-2`) and colors the
  16px glyph, and nothing else; the title is full ink at weight 500 and the
  description drops to `fg-muted`. 2px because this is the same engagement mark
  the menu draws on the row you are about to act on. Warning is the one variant
  that borrows `warning-fg` rather than `warning-solid`, because the ochre solid
  measures 2.13:1 on paper and cannot hold a rule on its own.
- **Role tints** (`{role}-bg` + `{role}-border` + `{role}-fg`) exist in the
  token layer but stay deliberately scarce in the shipped set: the accent wash
  behind a navigated menu row, the danger wash behind a destructive one, and
  Alert's warning rule. When you do use a tint, use all three names together and
  never mix roles across them.

### Tooltip

An ink slab, not a paper surface: `bg-emphasis` fill, `fg-on-emphasis` text, a
`border-strong` frame, 12px type, 12px × 6px padding. It inverts against the
page precisely because it is transient — it is the one thing on screen that is
not part of the printed page.

### Pagination

An instrument, like the small controls: cells fuse on `-ml-px`, the chassis holds
still, and the label travels 1px under the press. The current page is an ink
fill with its paper knockout and an ink border — and its label sits
**permanently** translated 1px, so it reads as a key held down rather than a key
you may press. It also hides its own hit expander, because a page you are
already on is not a target.

**Recorded, not canonized:** this is a different selection grammar from its
sibling strips. Navigation and Tabs mark the current cell with a lens plate;
Pagination stamps it in full ink. The divergence ships; it is not a rule that a
new strip may choose either.

### Motion

Motion is mechanical and short. Transitions are 100ms on exactly the properties
that carry state (`box-shadow`, `translate`, `border-color`, `background-color`);
150ms appears once, on the determinate Progress indicator's `scaleX`. There is no
easing personality, no spring, and no entrance choreography for ordinary
controls. Two looping animations exist: the navigation progress bar sweeping its
track on a 1s ease-in-out cycle, and the skeleton placeholder breathing one step
along the neutral ramp (`bg-hover` → `bg-active` → `bg-hover`) over 2s — in ink,
not in light, because opacity would dim the page showing through it.
`prefers-reduced-motion: reduce` collapses every animation and transition to
0.01ms globally in `foundation.css`.

### Named Rules

**The Focus-Outermost Rule.** Keyboard focus always owns the outermost mark: a
2px accent outline offset 2px on pressables, the cap-off edge on writing fields.
Open ownership, hover, and current-selection cues all stay inside it, so a
focused control is unmistakable even in a row of selected and open ones. When a
field is invalid, danger _replaces_ the accent in that indicator rather than
layering over it.

**The One-Channel Rule.** Two cues never compete in the same visual channel.
Open replaces the hover edge. Press drops the edge. Selection never borrows the
focus outline. Disabled removes interaction edges and focus treatment entirely.
Only spatially distinct channels may stack — most importantly, an outer focus
outline around an open-owner edge or a selected fill.

**The Chassis Rule.** On an instrument, the chassis never moves. Only the inner
key — a check, a dot, a thumb, a label — travels the 1px under a press.

**Open defects carried by the build, recorded so they are not inherited as
rules.** The navigation/tab selection plate measures ~1.11:1 in light and
~1.01:1 in dark, and its two-tone rim inverts in dark — reading as lit from the
lower right, which Drawn-Not-Lit forbids. It is unfixed because a correct fix
needs per-scheme highlight and shade palette tokens across all five themes, not
a component patch. Switch's disabled thumb and disabled track both resolve to
`bg-disabled`, so the thumb is not locatable while disabled. `RadioGroup`'s own
default layout is `flex gap-2` — a 24px pitch under 16px items whose `-15px`
expanders overlap by 20px, which contradicts the 44px-pitch clause stated above.
Breadcrumb's links carry a `-8px` expander, roughly 37px tall, covered by neither
the standalone-instrument clause nor the fused-strip one. None of these is a
pattern for a new surface to copy.

## Do's and Don'ts

### Do:

- **Do** use only the 69 semantic token names (`bg-bg-raised`, `text-fg-muted`,
  `border-border-subtle`). They are the entire color and shadow API.
- **Do** give a region a fill step and a shade instead of a border, unless it is
  an instrument you can operate.
- **Do** pick the pressure that matches the job: `border-strong` for a region
  that outranks the page, `border` / `border-muted` for a control, and
  `border-subtle` for a divider inside a surface.
- **Do** pair every role solid with its own knockout
  (`bg-danger-solid text-danger-fg-on-solid`), and every role tint with its full
  triple (`bg-{role}-bg` + `border-{role}-border` + `text-{role}-fg`).
- **Do** give pressables the neutral rest / accent-edge-on-hover /
  grown-edge-while-open / drop-on-press sequence
  (`hover:shadow-offset-action data-[state=open]:shadow-offset-action-hover active:shadow-none active:translate-x-px active:translate-y-px`).
- **Do** use one focus grammar on pressables —
  `focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2`
  — and cap-off on writing fields:
  `focus:outline-hidden not-read-only:focus:shadow-offset-action`.
- **Do** use the one disabled pattern everywhere:
  `disabled:border-dashed disabled:border-border-muted disabled:bg-bg-disabled disabled:text-fg-disabled disabled:shadow-none`.
- **Do** expand a standalone instrument to 44px
  (`before:absolute before:inset-[-15px] before:content-['']` on a 16px chassis),
  expand a fused cell vertically only (`before:inset-x-0 before:-inset-y-2` plus
  the strip's outer edges), and give stacked bare instruments a 44px pitch.
  Verify the measured box in a browser, not by arithmetic on the class name.
- **Do** assign a variant's edge explicitly, and let exactly one shadow utility
  reach the class list. `shadow-none` does not opt a variant out of a custom
  `shadow-offset-action` — tailwind-merge cannot dedupe a custom shadow utility
  against it.
- **Do** set `lang` on the document in the consuming app; the per-script font
  routing and Korean `keep-all` line breaking depend on it.

### Don't:

- **Don't** write a palette value (`--tone-4`, `--surface-1`, `--signal-accent`)
  or a raw color inside a component. Palette values belong to themes only.
- **Don't** put a resting border on a surface, or a border on something already
  bounded by its container. A card inside a card, a table inside a card, and an
  alert on a page all draw zero frames.
- **Don't** add a border radius. `rounded-lg`, `rounded-md`, and `rounded-sm`
  have no place here; Radio's `rounded-full` is the sole exception.
- **Don't** use a blurred shadow (`shadow-md`, `shadow-lg`, any non-zero blur or
  spread), a gradient, or a backdrop blur — and don't reverse the offset
  direction or invert a two-tone rim; ink gathers down and to the right.
- **Don't** use opacity as a styling device — not for disabled, not for muted
  text, not for hover, not for a loading placeholder. The modal scrim is the
  only alpha in the system.
- **Don't** put a standing accent edge on an idle pressable, or an accent edge
  on a passive surface. Accent is a state, not a synonym for "interactive."
- **Don't** let selection borrow the focus outline, or let hover and open cues
  stack in the same channel.
- **Don't** give Ghost or Link buttons an edge or a press translation; they are
  not edged pressables.
- **Don't** expand a fused cell horizontally — it steals clicks from its
  neighbour — and don't claim 44px for an `<input>`, which cannot carry a
  pseudo-element at all.
- **Don't** reach past 14px/12px for component type, and don't go below 12px for
  any script. Use weight and ink color for hierarchy instead.
- **Don't** put gaps between navigation, tab, or pagination cells — they fuse on
  a shared seam.
