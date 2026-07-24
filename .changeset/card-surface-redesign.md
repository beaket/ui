---
"@beaket/ui": minor
---

Card is a surface, not a template.

Reframed the Card around its material rather than an imposed structure. Its identity is now the drawn surface — square corners, a single-ink border, and the grey offset shade that marks a raised thing — and it imposes no header/body/footer: the root carries sensible padding and a column gap so you can pour any content straight in and it sits right. This is what pulls it away from reading like a Dialog, whose Cancel/confirm footer was the tell.

- **`elevation` prop** (`flat` \| `shade` \| `overlay`, default `shade`) replaces the old `shadow?: boolean`. `shade` is the quiet grey offset that says "raised surface"; `overlay` lifts it onto `bg-bg-overlay` with the heavier offset; `flat` sits flush.
- **`interactive` prop** — when the whole card is a link it earns the accent edge in place of the grey shade: thin at rest, grown on hover, dropped onto the edge when pressed. Pair with `asChild` to render a real `<a>` (the one place a surface carries the vivid voice).
- **`Card.Section`** — an edge-to-edge helper that cancels the root padding so media and full-width rules reach the card's edges.
- `Header` / `Title` / `Description` / `Action` / `Content` / `Footer` remain as optional, padding-free layout helpers — never the required anatomy.

Migration: replace `<Card shadow>` with `<Card elevation="shade">` (now the default, so plain `<Card>` also lifts); a card with no shade is `<Card elevation="flat">`.
