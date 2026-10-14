---
"@beaket/ui": patch
---

Stop release notes from linking all-digit hex colours to unrelated issues. `@changesets/changelog-github` links every `#<digits>` in a changeset body, so values such as `#151617` rendered as issue links; the changelog wrapper now restores 6- and 8-digit values as inline code.
