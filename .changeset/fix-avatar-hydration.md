---
"@beaket/ui": patch
---

fix: Avatar.Image hydration mismatch in React 19 SSR

Added hydration guard to `Avatar.Image` that defers rendering until after mount. This prevents React hydration error #418 caused by `@radix-ui/react-use-is-hydrated` returning `true` during client hydration in React 19, which made cached images render `<img>` while the server rendered `<span>` (fallback).
