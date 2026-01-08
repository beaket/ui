---
layout: ../layouts/doc.astro
title: Design Tokens
---

# Design Tokens

The `init` command adds design tokens to your CSS file. After initialization, these tokens belong to you and can be customized freely.

## Color Palette

### Neutral

| Token        | Value     | Usage                 |
| ------------ | --------- | --------------------- |
| `--graphite` | `#0d0d0d` | Darkest, text primary |
| `--ink`      | `#1a1a1a` | Dark backgrounds      |
| `--branch`   | `#1c1f24` | Dark UI elements      |
| `--iron`     | `#2d2d2d` | Dark borders          |
| `--slate`    | `#404040` | Dark secondary        |
| `--zinc`     | `#525252` | Dark muted            |
| `--steel`    | `#595959` | Mid-tone text         |
| `--aluminum` | `#9e9e9e` | Muted text, shadows   |
| `--chrome`   | `#d0d0d0` | Borders, shadows      |
| `--silver`   | `#dedede` | Light borders         |
| `--platinum` | `#e8e8e8` | Light backgrounds     |
| `--frost`    | `#f5f5f5` | Subtle backgrounds    |
| `--paper`    | `#fafafa` | Primary background    |

### Signal Colors

| Token             | Value     | Usage              |
| ----------------- | --------- | ------------------ |
| `--signal-blue`   | `#00449e` | Links, info        |
| `--signal-red`    | `#c41e1e` | Error, destructive |
| `--signal-green`  | `#00794c` | Success            |
| `--signal-amber`  | `#b8860b` | Warning            |
| `--signal-purple` | `#6f2da8` | Accent             |
| `--signal-cyan`   | `#1a6b7c` | Info alternate     |

Signal colors include hover and active variants (e.g., `--signal-red-hover`, `--signal-red-active`).

## Shadows

Brutalist offset shadows with no blur:

| Token                    | Value                         | Usage                    |
| ------------------------ | ----------------------------- | ------------------------ |
| `--shadow-offset`        | `2px 2px 0 0 var(--chrome)`   | Default interactive      |
| `--shadow-offset-hover`  | `3px 3px 0 0 var(--chrome)`   | Hover state              |
| `--shadow-offset-active` | `1px 1px 0 0 var(--chrome)`   | Active/pressed           |
| `--shadow-offset-dark`   | `2px 2px 0 0 var(--aluminum)` | Overlays (Dialog, Sheet) |

## Customization

After running `init`, you own these tokens:

- Modify colors to match your brand
- Adjust shadow offsets for different visual weight
- Add new tokens as needed

The library will not automatically update these values. Check the [Changelog](/ui/changelog) when updating to see if tokens have changed.
