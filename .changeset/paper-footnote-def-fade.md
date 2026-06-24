---
"@beaket/paper": patch
---

Fade the in-place footnote definition so it recedes from the body flow (#525).

An off-cursor footnote definition (`[^1]: …`) renders in place as an accent number + body, and is _also_ collected at the document end (ADR-0021). The in-place copy is what lets you locate and re-edit the definition without teleporting, but at full `--steel` it read like a small paragraph wedged between the surrounding prose — and because a definition's source position is arbitrary (authored anywhere), that made it look like it belonged to whichever paragraph it happened to sit under.

The body span now mixes `--steel` 68% toward `--paper` (`color-mix`, theme-aware: lighter in light, dimmer in dark — no new token), so the definition visibly recedes while the accent number stays crisp as the locator/number-anchor. Font size is held at `0.8em` deliberately, **not** shrunk further: CJK glyphs lose legibility when smaller. Verified in-browser (light + dark, EN/KO/JA) — the definition reads as a faded, number-anchored footnote rather than body prose, and CJK stays legible.

This resolves the `footnoteLayout: "inline" | "collected"` follow-up deferred in ADR-0021: the publish/"collected" _toggle_ is rejected (Paper has no render-to-output reading mode; any in-body hide reduces to the vanish bug or an orphaned marker), and the in-place render — faded — is the answer. See the ADR-0021 amendment.
