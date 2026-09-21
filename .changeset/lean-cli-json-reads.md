---
"@beaket/ui": patch
---

Stop treating a commented-out `@import "tailwindcss"` as a real Tailwind import.

`init` picks your Tailwind entry by looking for that import, but it tested the raw
file while the setup check tested the file with comments stripped. The two
disagreed, so a stylesheet whose only `@import "tailwindcss"` sat inside a `/* */`
comment could be chosen as the theme target and then reported as not importing
Tailwind. Both paths now share the comment-aware check.

Internal tidying with no visible change: one BOM-tolerant JSON reader instead of
four, one `package.json` read for the Next.js check instead of two, and the
component-level `up-to-date`/`outdated` status has been dropped from
`compareComponent` — `diff` reports per-file status and never read it.
