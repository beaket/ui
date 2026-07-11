---
"@beaket/paper": patch
---

docs(paper): adjudicate the DECISIONS.md "Deferred (not bugs)" list for the 1.0 gate

Root cause: the 1.0 exit criterion (#481) requires every `DECISIONS.md` Deferred item to be resolved
or consciously accepted with written rationale, but the three items were still recorded as open
deferrals. Verified all three against current code — accurate, not stale — and adjudicated each without
any behavior change:

- **Physical-key Korean IME spot-check** — redirected, not a #481 code deferral: it is the deliberate
  jsdom-strategy boundary (ADR-0005) and is owned by the CJK/IME real-device verification gate (#483,
  blocked by #479). The specific guarded paths (`setValue`, highlight-deferral hold, coalesced
  `onSelect`/active flush) are recorded as the matrix #483 inherits; IME stays delegated, not verified.
- **Orphan re-emit on in-session delete; prefix/suffix context anchors** — accepted for 1.0 with the
  bounded consequence named (a stale `exact`/`approximate` status until the next `setHighlights`/reload;
  the decoration itself is dropped on map — empty mark decorations are removed) and the ADR-0014
  resumption trigger kept.
  The `Anchor` slots and `onHighlightStatusChange` map are additive-only, so the 1.0 interface freeze is
  not blocked.
- **`.cm-selectionBackground` dormant** — accepted for 1.0 (browser-native selection); `drawSelection()`
  declined for IME/composing-guard risk and lightness. The dead rule is kept as the wired token path and
  annotated dormant at the call site in `theme.ts` so the decision is self-documenting and reversible.
