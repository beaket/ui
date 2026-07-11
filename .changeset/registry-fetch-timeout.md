---
"@beaket/ui": patch
---

fix(cli): add a 10s timeout to registry fetches and preserve the original error

`fetchRegistry` and `fetchComponent` called `fetch()` with no `AbortController`, so a slow or
unreachable GitHub raw CDN hung the CLI until the OS-level TCP timeout fired (potentially minutes).
Both catch blocks also discarded the underlying error, collapsing ENOTFOUND / ECONNREFUSED / proxy
failures into the generic "Make sure the repository is public." message.

Each request now aborts after 10s and the thrown message includes the real cause (or
"request timed out after 10s" when the timeout fires), so `npx @beaket/ui add button` against a
degraded network fails fast with an actionable reason.
