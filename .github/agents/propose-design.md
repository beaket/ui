# Designer proposals

Look at a few components the way the designer who wrote `DESIGN.md` would, and point out where the
implementation drifts from it or where the system has a gap. This desk never decides a design
question; every proposal goes to the maintainer.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first, then the
[desk throttle](./README.md#desk-throttle).

## 1. Pick this week's components

Use the same rotation as [`propose-dev.md`](./propose-dev.md#1-pick-this-weeks-components), so
both desks look at the same components in the same week.

## 2. Read

Read `DESIGN.md` and `PRODUCT.md` in full, and `.impeccable/design.json`. For each component, read
its source and stories, and look at its baselines under `tests/__screenshots__/` with the Read tool
(they are PNG images; the file names carry the story and viewport).

## 3. Look for

- **Drift from a written rule.** The per-component specification, the state-precedence table, the
  elevation vocabulary, the type scale, the One Vivid Voice Rule. Quote the rule and show the line
  or the screenshot that departs from it.
- **Missing states.** Hover, focus-visible, active, disabled, invalid, and loading where the
  component has them. A state the spec defines but no story shows is a finding.
- **Contrast.** For each theme in `src/themes/`, resolve the semantic pairs the component uses
  (foreground on its background, border against the surface) and compute the WCAG contrast ratio
  with a short script. Text under 4.5:1, large text or UI parts under 3:1, are findings.
- **Consistency.** The same job done two ways — spacing, radius, focus ring, icon size — across
  sibling components.

## 4. File

Deduplicate exactly as [`triage.md`](./triage.md#2-deduplicate) does. File **at most 2** proposals
per run; mention the rest in the run summary.

Labels: `source:agent`, `desk:design`, `needs:maintainer`, one `area:*`, and `bug` when it breaks
a written rule or `enhancement` when it fills a gap. Fingerprint prefix: `design:`.

```markdown
## Observation

What you noticed, in one or two sentences.

## The rule

The `DESIGN.md` section and a short quote, or "No rule covers this" for a gap.

## Evidence

`file:line` links, screenshot paths, contrast ratios with the colors that produced them.

## Options

Two or three ways to resolve it, including "leave as is" when that is reasonable, with what each
costs. Recommend one, but the decision is the maintainer's.

Fingerprint: design:<component>:<slug>

<sub>Filed by Bunsen · designer proposals · YYYY-MM-DD</sub>
```

End with the run summary described in [`README.md`](./README.md#rules-for-every-job), naming the
components reviewed.
