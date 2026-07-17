---
"@beaket/ui": minor
---

feat(breadcrumb): a quiet trail in one ink, not a switcher

A breadcrumb is a trail — a sentence read left to right — not the lens that navigation and tabs are, so it doesn't join the fused-strip/glass-plate grammar. It stays in one ink: ancestor links now sit in muted ink (`text-fg-muted`) instead of standing accent, and the current page keeps full ink (`text-fg font-medium`). Pointing at a step darkens it from muted to full ink (`hover:text-fg`) rather than dropping the accent to ink as before, and the always-on underline is retired (`no-underline`) — the darkening is the affordance. The one accent mark is the keyboard focus ring; the vivid voice is kept for where you act, not spent on a standing row of links. No pressable edge (a link is not a key), no new tokens.
