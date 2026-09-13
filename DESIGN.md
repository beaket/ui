---
name: Beaket UI
description: Ink & Instrument — a printed page you can press.
colors:
  bg: "#fcfcfa"
  bg-raised: "#f9f9f9"
  bg-overlay: "#f5f5f5"
  bg-input: "#fcfcfa"
  bg-hover: "#ededed"
  bg-active: "#cbcbcb"
  bg-disabled: "#ededed"
  bg-emphasis: "#090909"
  bg-emphasis-hover: "color-mix(in oklab, #2b5bff 24%, #090909)"
  bg-emphasis-active: "color-mix(in oklab, #2b5bff 14%, #090909)"
  fg: "#090909"
  fg-muted: "#535353"
  fg-subtle: "#666666"
  fg-disabled: "#797979"
  fg-on-emphasis: "#fcfcfa"
  fg-link: "#2b5bff"
  border: "#8c8c8c"
  border-muted: "#aaaaaa"
  border-strong: "#090909"
  border-focus: "#2b5bff"
  accent-solid: "#2b5bff"
  accent-fg-on-solid: "#fcfcfa"
  accent-bg: "color-mix(in oklab, #2b5bff 17%, #fcfcfa)"
  accent-bg-subtle: "color-mix(in oklab, #2b5bff 8%, #fcfcfa)"
  danger-solid: "#a13d52"
  danger-fg-on-solid: "#fcfcfa"
  success-solid: "#00452d"
  warning-solid: "#e0a52f"
  warning-fg-on-solid: "#090909"
  info-solid: "#53628f"
  info-alt-solid: "#005f72"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "SF Mono, Roboto Mono, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
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
  input:
    backgroundColor: "{colors.bg-input}"
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
    size: "24px"
  radio:
    backgroundColor: "{colors.bg-input}"
    textColor: "{colors.fg}"
    rounded: "{rounded.full}"
    size: "24px"
---

# Design System: Beaket UI

## Overview

**Creative North Star: "Ink & Instrument — a printed page you can press"**

Everything on screen is drawn, not lit. The references are the print shop and
the machine shop: a well-set page, ruled forms, keys that travel when pressed.
Corners are square, color is flat, borders are pen strokes, and shadows are
offset marks with zero blur — the trace a raised object leaves on paper, not the
glow of a light source. Nothing here emits light, because nothing printed does.

The system runs on one pen and one vivid voice. The neutral ramp is a single ink
used at full strength for text, strong borders, and solid fills, so a line and a
fill always agree about what matters. Ink is never diluted, only rationed: at
1px a stroke is either the ink voice or the hairline voice, with nothing in
between. Against that monochrome ground, exactly one chromatic voice — the
accent — is reserved for what you can act on. Signals (danger, success, warning,
info) carry meaning but never emphasis, so a screen full of status never becomes
a screen full of shouting.

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
- One neutral ink at full strength; no mid-grey text, no diluted borders.
- One chromatic accent, reserved for interaction — never for decoration.
- Offset shadows with zero blur; grey for surfaces, accent for pressables.
- Flat fills only. No gradient, no blur, no opacity used as a styling device.
- 13px carries the interface; 11px carries labels.
- Two-layer tokens: a theme writes 30 palette values, components read 68
  semantic names and never touch a palette value directly.

## Colors

A monochrome page with one vivid voice: paper and graphite carry all structure,
and chroma appears only where the interface asks for action or status. The
values below are **Solace**, the default theme; four other palettes
(porcelain, tobacco, marigold, eucalyptus) supply their own 30 values to the
same names.

### Primary

- **Ballpoint Blue** (`accent-solid`): the single vivid voice. It marks what you
  can act on and nothing else — the hover and open-state edge under pressables,
  the focus outline, the caret in a writing field, the leading rule on the menu
  row you would act on, link text, and the faint lens fill under the current
  navigation cell. It is never a fill for a resting control and never decoration.
- **Lens Wash** (`accent-bg-subtle`): the faintest accent wash (8% into paper).
  Fills the current cell of a navigation strip or tab row, under a neutral rim.
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
  rather than paper, because the ochre is light enough to need it.
- **Slate Blue** (`info-solid`) and **Teal** (`info-alt-solid`): neutral
  information, and a second information voice when two must be distinguished.

**Every role carries the same seven slots**, so a role is swappable wholesale:
`-solid`, `-fg-on-solid`, `-solid-hover`, `-solid-active`, `-fg`, `-bg`,
`-border`. Accent alone adds an eighth, `-bg-subtle`, for the lens fill.

### Neutral

A twelve-step ramp from paper to ink. Components read roles, not steps.

- **Paper** (`bg`, `bg-input`): the page and the writable surface. A writing
  field sits on the same paper as the page — it is defined by its border, not
  by a tinted well.
- **Raised Paper** (`bg-raised`): cards and other raised surfaces.
- **Overlay Paper** (`bg-overlay`): dialogs, sheets, menus, select panels.
- **Pressed Paper** (`bg-hover`, `bg-active`, `bg-disabled`): the neutral
  hover and press fills, and the disabled well.
- **Hairline** (`border`): the ordinary border — one step of ink, not a
  faded one.
- **Faint Hairline** (`border-muted`): dividers, fused-strip seams, and every
  disabled border (always dashed).
- **Quiet Ink** (`fg-muted`, `fg-subtle`, `fg-disabled`): secondary text,
  placeholders, and disabled labels — the only place the ramp's middle is used,
  and only for type, never for strokes.
- **Shade**: the grey of a drawn offset shadow. It is not in the color API at
  all — it reaches components only through `shadow-offset` and
  `shadow-offset-overlay` (see Elevation & Depth), never as a border or text
  color.

### Named Rules

**The One Pen Rule.** The neutral ramp is a single ink. Text, strong borders,
and solid fills all come from the deepest step, so a line and a fill never
disagree about importance. Ink is rationed, not diluted: a 1px stroke is either
the ink voice (`border-strong`) or the hairline voice (`border` / `border-muted`).
A "slightly softer black" does not exist at hairline width — measured, not
asserted.

**The One Vivid Voice Rule.** The accent belongs solely to what you can act on.
Hue carries meaning, never emphasis. If a mark is not focus, open ownership,
hover intent, current selection, or a link, it does not get the accent.

**The Knockout Rule.** Every solid ships with its own foreground
(`danger-solid` + `danger-fg-on-solid`). Never hand-pick a text color on a
solid, and never mix roles — warning text on an info tint is a defect, not a
variation.

**The Palette-Swap Rule.** Components consume only the 68 semantic names. A
theme authors 30 palette values (`--surface-0…2`, `--tone-0…11`, `--signal-*`,
`--signal-*-on`, `--shadow-*`) and nothing else. Writing `--tone-4` or a raw hex
inside a component is the one unforgivable color error: it breaks every theme at
once. Dark mode is the same mechanism — a palette swap under
`prefers-color-scheme: dark`, not a separate set of component rules.

## Typography

**Display Font:** none — the system font stack does every job.
**Body Font:** system UI stack (`-apple-system`, `BlinkMacSystemFont`,
`Segoe UI`, `Roboto`, `Helvetica Neue`, Arial, sans-serif)
**Label/Mono Font:** `SF Mono`, `Roboto Mono`, Menlo, Monaco, Consolas, monospace

**Character:** Deliberately unbranded and native. In a system where every other
decision is loud about being drawn, the type stays the reader's own — the page
is set, not typeset with a personality. The scale is unusually compact
(11–20px), because this is instrument type: dense, legible at a glance, and
never competing with the marks around it.

### Hierarchy

- **Display** (700, 1.25rem/20px, 1.2): the largest step in the scale. Page-level
  headings on documentation surfaces; no component uses it.
- **Headline** (600, 1.125rem/18px, 1.75rem leading): Dialog and Sheet titles —
  the one place a component raises its voice, because a modal must announce
  itself.
- **Title** (600, 0.875rem/14px, 1 leading): Card titles and in-component
  section headings. Weight, not size, does the work — Card.Title sets only
  weight and `leading-none`, inheriting its size from the surrounding text.
- **Body** (400, 0.8125rem/13px, 1.4): the interface voice — labels, menu rows,
  table cells and headers (headers at weight 600), input text, button text. The overwhelming majority of type in
  the system.
- **Label** (500, 0.6875rem/11px, 1.4): badges, the small button size,
  tooltips, and the secondary labels inside menus and select panels.
- **Mono** (500, 0.6875rem/11px): code badges and inline code only.

### Named Rules

**The Two-Size Rule.** 13px carries the interface and 11px carries labels.
Together they are nearly every piece of type in the component set. Reaching past
them is a claim that this element outranks the whole interface — Dialog and
Sheet titles are the only components that earn it.

**The Weight-Before-Size Rule.** Hierarchy inside a component is made with
weight (400 → 500 → 600) and with ink color (`fg` → `fg-muted`), not by growing
the type. A card title is the same size as its body text.

## Layout

Spacing uses Tailwind's default 4px scale, and the steps actually in play are
narrow: 4px (icon gaps, menu padding), 8px (control gaps), 12px (input padding),
16px (button padding, card content gap), 20px (card padding), 24px (dialog
padding). Density is high by intent — this is instrument spacing, sized so a
dense screen stays readable rather than sized to feel generous.

Controls share a height ladder so that a row of mixed controls aligns on both
edges: 32px (small button, navigation cell, tab), 36px (default button, input,
select trigger), 40px (large button). Small instruments share a 24px chassis
(checkbox, radio), and Switch is a track rather than a square choice: 28×16,
36×20, 44×24px with 8, 12, and 16px thumbs.

The shared 24px chassis is a settled decision, not a default. A 16px radio
beside a 24px checkbox disappeared in a filter panel, and the lighter 20px pair
that fixed that panel then failed the whole-screen target-size check once the
controls were nested inside clickable DataTable rows. 24px is the only size that
holds both.

Breakpoints are Tailwind 4 defaults (640 / 768 / 1024 / 1280 / 1536px) — the
system defines none of its own, because a component library adapts inside
whatever grid its host provides.

### Named Rules

**The Fused Strip Rule.** Navigation and tab cells do not float as separate
chips. They share hairlines: each cell pulls back one pixel (`-ml-px`) so
adjacent borders collapse into a single ruled seam, and the strip carries no
standing edge of its own. Gaps between cells break the instrument.

**The 44px Rule.** Any control smaller than 44px carries an invisible hit
expander (`before:absolute before:inset-[-Npx] before:content-['']`). Because
the pseudo-element starts inside the border, both 1px borders count toward the
measurement, and the inset varies by chassis: `-11px` on the 24px
checkbox/radio, `-15px` on the switch, `-14px` on a 16px glyph button. Verify
the real box in the browser, never by arithmetic on the class name alone.

## Elevation & Depth

There are no lit shadows in this system. Elevation is drawn: a hard offset with
zero blur and zero spread, exactly the trace a raised object leaves on paper.
Depth is also semantic — the shadow's ink says what kind of thing is raised. A
grey shade means "this is a surface." An accent edge means "this responds to
you." Because the two never mix, an interface can be read for interactivity by
its shadows alone.

Offset size is a theme decision, not a component one: Solace and Porcelain draw
at 1px, Tobacco and Eucalyptus at 2px, Marigold at 3px. The same component
therefore feels differently pressed under a different palette, which is
intended.

### Shadow Vocabulary

- **Surface shade** (`box-shadow: 1px 1px 0 0 #c4c4c4`): raised surfaces —
  cards at their default elevation. Static. Never appears on a pressable.
- **Overlay shade** (`box-shadow: 1px 1px 0 0 #a0a0a0`): dialogs, sheets, menus,
  select and dropdown panels. A darker grey for a higher layer. Static.
- **Action edge** (`box-shadow: 1px 1px 0 0 #2b5bff`): revealed on hover under
  an edged pressable, and held statically by an engaged writing field.
- **Grown action edge** (`box-shadow: 2px 2px 0 0 #2b5bff`): held by a trigger
  for as long as it owns an open overlay. Open mirrors hover, one step louder.
- **Danger edge** (`box-shadow: 1px 1px 0 0 #a13d52`): replaces the action edge
  on an invalid field under focus.
- **Menu leading rule** (`box-shadow: inset 2px 0 0 0 #2b5bff`): the inset
  accent rule down the leading edge of the currently navigated menu or select
  row. 2px, because it marks engagement rather than mere proximity.

### Named Rules

**The Drawn-Not-Lit Rule.** Every shadow is `<offset> <offset> 0 0 <color>`.
Blur radius and spread are always zero. A blurred shadow claims a light source,
and nothing on a printed page emits light.

**The Shadow-Is-Voice Rule.** Grey shade = raised surface. Accent edge =
pressable. A surface never takes the accent edge, and a pressable is never given
a standing grey shade at rest.

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

Borders are pen strokes and they are always visible and always 1px, except the
2px marks reserved for engagement (the menu leading rule, the medium border
width token). Disabled is expressed by switching the stroke to dashed
(`border-dashed` + `border-border-muted`) rather than by fading it — a dashed
line reads as "drawn but inactive," while a faded line would be diluted ink.

Selection and current-state marks are drawn as inset rectangles rather than
applied to the element's own border: a navigation or tab cell paints an
`::after` plate inset 4px, with a two-tone rim (light top/left, ink bottom/right)
over the lens wash. The plate sits behind the label on its own layer, which is
why the label never shifts when a cell becomes current.

### Named Rules

**The Square Rule.** Radius is `0`. The only circle in the system is Radio's
chassis and its dot. If a new component wants a rounded corner, the answer is
no — find the meaning that corner was carrying and draw it with a stroke.

**The Dashed-Disabled Rule.** Disabled always means the same four things:
dashed border, `border-muted` stroke, `bg-disabled` fill, `fg-disabled` text —
plus removal of every shadow and interaction affordance. Never opacity.

## Components

### State Precedence

Accent is a scarce state signal, not a permanent synonym for "interactive."
Persistent affordance comes from neutral material — ink fill, border, label, or
geometry — so a dense screen never becomes a field of equally loud marks. Within
a single visual channel, the highest priority wins:

| Priority | State                              | Channel                                                                                                                                                                                              |
| -------: | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        1 | Keyboard focus                     | A 2px offset outline on pressables; the cap-off edge on writing fields. Invalid focus replaces accent with danger.                                                                                   |
|        2 | Open ownership / active engagement | A grown offset edge on overlay owners; a 2px inset leading rule on the active menu row. Pointer press temporarily wins with physical translation plus active fill, and drops any hover edge.         |
|        3 | Hover intent                       | A thin offset edge on edged pressables, or a neutral tint/text change where an edge would be too dense.                                                                                              |
|        4 | Current selection                  | A faint lens fill and neutral rim for navigation and tabs, or ink fill plus position/indicator for native choices. Selection never borrows the focus outline.                                        |
|        5 | Persistent affordance              | Neutral border, ink surface, label, and geometry only. No standing accent edge. Primary emphasis is the ink-filled surface alone; accent joins it only for hover, open ownership, or keyboard focus. |
|        6 | Content navigation                 | Accent text plus hover underline for ordinary links. Breadcrumb ancestors deliberately stay muted and darken on hover.                                                                               |

The Focus-Outermost Rule and the One-Channel Rule at the end of this section are
this table's two corollaries: the first says priority 1 always renders outside
everything below it, the second says nothing below it may render twice in one
channel.

### Buttons

- **Shape:** square (`0` radius), 1px border, heights 32 / 36 / 40px (sm / md /
  lg) and a 36px square icon variant. Horizontal padding 12 / 16 / 24px.
- **Primary:** ink fill (`bg-emphasis`) with paper text (`fg-on-emphasis`) and
  an ink border. Ink alone is the complete persistent emphasis signal — the
  accent never appears at rest.
- **Hover / Focus:** hover reveals the 1px accent edge and mixes 24% accent into
  the ink fill; focus is a 2px accent outline offset 2px, always the outermost
  mark. Active drops the shadow and translates 1px. A trigger holding an open
  overlay holds the grown 2px edge (`data-[state=open]`), which Radix supplies
  natively to `asChild` triggers.
- **Secondary:** raised paper fill, hairline border, neutral hover fill, same
  accent edge on hover.
- **Outline:** transparent and airy at rest with a hairline border; on engage
  the edge grows rather than a fill appearing. The press keeps a faint grey
  settle to confirm the drop.
- **Ghost / Link:** not edged pressables. Ghost's only hover signal is the grey
  fill; Link is accent text with a hover underline. Neither takes an edge and
  neither translates on press.
- **Danger / Success / Warning:** role solid plus its own knockout foreground,
  with matching `-hover` and `-active` solids and a border in the same role.
- **Loading:** a stroked SVG spinner in `currentColor`; a `type="submit"` button
  inside a form reads React's `useFormStatus` pending state with no wiring.

### Cards / Containers

- **Corner Style:** square (`0`).
- **Background:** raised paper (`bg-raised`), or overlay paper at the `overlay`
  elevation.
- **Shadow Strategy:** `shade` by default, `overlay` for the higher layer,
  `flat` for none. An `interactive` card is mutually exclusive with a standing
  shade: it is neutral at rest, reveals the accent edge on hover, and drops on
  press.
- **Border:** 1px hairline, always.
- **Internal Padding:** 20px, with a 16px gap between stacked sections. A card
  is a material, not a template — it imposes no header/body/footer structure.

### Inputs / Fields

- **Style:** paper fill on the same paper as the page, 1px hairline border,
  square, 36px tall, 12px horizontal padding. Placeholder in `fg-subtle`.
- **Focus (cap-off):** no outline. Focus draws the static 1px accent edge and
  nothing else — no growth on hover, no drop on press, and the edge leaves when
  the pen lifts. The caret is accent and text selection uses the accent tint.
- **Read-only:** focus takes the grey surface shade instead of the accent edge,
  and the border softens to `border-muted` — readable, not writable.
- **Error / Disabled:** `aria-invalid` swaps the border to the danger solid and
  the focus edge to the danger edge. Disabled follows the universal dashed
  pattern.

### Navigation

- **Style:** a fused strip. Cells share hairlines with no gaps, the strip has a
  single `border-muted` frame, and it carries no standing shadow.
- **Typography:** 13px body weight in full ink, 32px cell height, 14px
  horizontal padding.
- **States:** hover and press use neutral fills only. The current cell paints an
  inset `::after` plate filled with the lens wash under a two-tone rim (light
  top/left, ink bottom/right) — a glass plate laid over the page, not a
  highlight applied to the text. Keyboard focus is the standard 2px accent
  outline and raises the cell's z-index so the outline is never clipped by a
  neighbor.
- **Tabs** use the identical grammar. Because activating a tab _is_ the press,
  tabs snap rather than travel.
- **Breadcrumb** is deliberately different: it is a trail, not a switcher.
  Ancestors are muted and darken on hover, the current page is full ink, and
  accent appears only for keyboard focus.

### Menus (Dropdown, Select)

- **Panel:** overlay paper, 1px `border-strong` frame, the overlay shade, 4px
  padding.
- **Row:** the currently navigated row takes the accent wash plus a 2px inset
  accent rule down its leading edge, with the label left in ink. An open
  submenu's parent row holds that same cue for as long as the submenu is out.
- **Destructive rows** swap the whole cue to danger.
- **Select trigger** is field-surfaced and quiet at rest and on hover, but it is
  pressed rather than written in: it keeps the keyboard outline and holds the
  grown accent edge while its menu is open.

### Small Controls (Checkbox, Radio, Switch)

These are instruments, not miniature buttons. The chassis stays fixed and only
the inner key moves.

- **Checkbox / Radio:** a shared 24px chassis, 1px hairline border, paper fill.
  Checkbox is square; Radio is the system's single circle.
- **Checked:** ink fill with a paper-colored glyph (Checkbox) or an ink dot
  (Radio). Checked is ink plus an indicator — never the accent.
- **Hover:** reveals the accent edge. **Press:** the glyph, dot, or thumb
  translates 1px while the chassis holds still.
- **Switch:** a track (28×16 / 36×20 / 44×24px) with an 8 / 12 / 16px thumb.
  Checked fills the track with ink; unchecked uses a `border-muted` track that
  darkens one step on hover.
- All three take the invisible hit expander to clear 44px.

### Overlays (Dialog, Sheet)

- **Scrim:** the ink at 50% alpha (`bg-emphasis/50`). This is the only place in
  the system where alpha is used, and it is a veil over the page rather than a
  styling effect on an element.
- **Panel:** overlay paper, 1px border, the overlay shade, 24px padding, 16px
  gap. Title at 18px/600.
- **Close affordance:** a muted glyph in the top-right corner that darkens to
  full ink on hover, with the standard hit expander and focus outline.
- Triggers inherit their own component's policy and add no second open cue —
  the scrim already obscures it.

### Status (Alert, Badge)

- **Badge:** square, 1px border, 11px/500 type, 2px×8px padding. `default` is
  ink with paper knockout; role variants are the role solid with its own
  knockout; `outline` and `code` stay neutral, `code` in mono.
- **Alert:** raised paper, never a tinted well. The role colors only the 1px
  rule and the glyph (`border-info-solid` + `[&>svg]:text-info-solid`); the
  title stays full ink and the description drops to `fg-muted`. Warning is the
  one variant that borrows `warning-fg` rather than `warning-solid` for its
  rule, because the ochre solid is too light to hold a hairline on paper.
- **Role tints** (`{role}-bg` + `{role}-border` + `{role}-fg`) exist in the
  token layer but stay deliberately scarce in the shipped set: only the accent
  wash behind a navigated menu row and the danger wash behind a destructive
  one. When you do use a tint, use all three names together and never mix roles
  across them.

### Tooltip

An ink slab, not a paper surface: `bg-emphasis` fill, `fg-on-emphasis` text, a
`border-strong` frame, 11px type, 12px × 6px padding. It inverts against the
page precisely because it is transient — it is the one thing on screen that is
not part of the printed page.

### Pagination

An instrument, like the small controls. The chassis holds still and the label
travels 1px under the press. The current page is an ink fill with its paper
knockout and an ink border — and its label sits **permanently** translated 1px,
so the current page reads as a key held down rather than a key you may press.
It also hides its own hit expander, because a page you are already on is not a
target.

### Motion

Motion is mechanical and short. Transitions are 100ms on exactly the properties
that carry state (`box-shadow`, `translate`, `border-color`, `background-color`);
150ms appears once. There is no easing personality, no spring, and no entrance
choreography for ordinary controls. The only looping animation in the system is
the navigation progress bar, which sweeps a bar across its track on a 1s
ease-in-out cycle. `prefers-reduced-motion: reduce` collapses every animation and
transition to 0.01ms globally in `foundation.css`.

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

## Do's and Don'ts

### Do:

- **Do** use only the 68 semantic token names (`bg-bg-raised`, `text-fg-muted`,
  `border-border-strong`). They are the entire color API.
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
- **Do** add a hit expander —
  `before:absolute before:inset-[-Npx] before:content-['']`
  — to any control under 44px, sized so the measured box clears 44: `-11px` on
  the 24px checkbox/radio chassis, `-15px` on the switch, `-14px` on a 16px
  glyph button. Verify it in a browser, not by arithmetic on the class name.
- **Do** assign a variant's edge explicitly. `shadow-none` does not opt a
  variant out of a custom `shadow-offset-action` — tailwind-merge cannot dedupe
  a custom shadow utility against it.

### Don't:

- **Don't** write a palette value (`--tone-4`, `--surface-1`, `--signal-accent`)
  or a raw color inside a component. Palette values belong to themes only.
- **Don't** add a border radius. `rounded-lg`, `rounded-md`, and `rounded-sm`
  have no place here; Radio's `rounded-full` is the sole exception.
- **Don't** use a blurred shadow (`shadow-md`, `shadow-lg`, any non-zero blur or
  spread), a gradient, or a backdrop blur.
- **Don't** use opacity as a styling device — not for disabled, not for muted
  text, not for hover. The modal scrim is the only alpha in the system.
- **Don't** put a standing accent edge on an idle pressable, or any accent edge
  on a surface. Accent is a state, not a synonym for "interactive."
- **Don't** let selection borrow the focus outline, or let hover and open cues
  stack in the same channel.
- **Don't** give Ghost or Link buttons an edge or a press translation; they are
  not edged pressables.
- **Don't** reach past 13px/11px for component type. Use weight and ink color
  for hierarchy instead.
- **Don't** put gaps between navigation or tab cells — they fuse on shared
  hairlines.
