---
"@beaket/ui": patch
---

Avatar drops the module-level hydration guard

`avatar.tsx` carried a `let hydrated = false` module global and a post-mount render gate to work around a React 19 SSR hydration mismatch (#291): Radix's `useIsHydrated`, built on `useSyncExternalStore`, returned `true` during client hydration, so a cached image rendered `<img>` where the server had rendered the fallback `<span>`.

Root cause is gone upstream. `@radix-ui/react-avatar` 1.2.6 no longer uses that mechanism — the image loading status is a plain `useState("idle")`, identical on the server and on the first client render. The guard cost every Avatar a `useState`, a `useEffect`, and one blank frame before the image appeared.

A new `SsrHydrationTest` story renders the avatar with `renderToString`, hydrates it with a warmed image cache, and asserts React recovered from no errors — so a future Radix bump that reintroduces the mismatch fails loudly instead of silently.
