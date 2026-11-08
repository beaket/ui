---
"@beaket/ui": minor
---

`Button`: the solid variants — `primary`, `destructive`, `success` and `warning` — now rest on a hairline accent edge instead of no edge. A new semantic token, `--shadow-offset-action-rest`, sits one pixel short of `--shadow-offset-action`, so hover grows the edge rather than revealing it and the 1px press lands exactly on it. `secondary` and `outline` rest neutral and show the accent edge on hover, so a screen with many buttons keeps the standing accent on its committing action; ghost and link are unchanged. Re-run `npx @beaket/ui theme` to pick up the new token in an existing install.
