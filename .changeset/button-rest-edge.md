---
"@beaket/ui": minor
---

Edged buttons now rest on a hairline accent edge instead of no edge. A new semantic token, `--shadow-offset-action-rest`, sits one pixel short of `--shadow-offset-action`, so hover grows the edge rather than revealing it and the 1px press lands exactly on it. Applies to the primary, secondary, outline, destructive, success and warning variants; ghost and link are unchanged. Re-run `npx @beaket/ui theme <name>` to pick up the new token in an existing install.
