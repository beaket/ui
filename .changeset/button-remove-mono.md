---
"@beaket/ui": minor
---

feat(button): remove the `mono` prop

The `mono` prop (monospace + wide tracking for CTA-style text) had no documented
role in the Ink & Instrument vocabulary, was demonstrated only by an orphan
`MonoVariants` composition the docs never rendered (plus a redundant single
story), and was a Button-only flourish. Monospace lives on where it means
something — code badges, numeric table cells — not as a per-button toggle.

The `mono` prop is dropped from `Button` along with its `Mono` and `MonoVariants`
stories. Consumers who want monospace CTA text can pass `className="font-mono
tracking-wide"`. Since components are copy-paste, existing copies are unaffected.
