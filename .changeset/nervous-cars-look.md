---
"@beaket/ui": minor
---

`add` warns when your React is older than a component needs

A registry component is copied into a project whose React version we do not control, and `registry.json` declared npm dependencies but never a React floor — so a component using a 19.2-only API would land in an 18.x project and fail at runtime with no warning.

`registry.json` now carries a top-level `"react"` floor, and a component needing more can carry its own. `add` reads the React you actually have (`node_modules/react/package.json`, falling back to the declared range read as its minimum) and says so when the floor is unmet:

```
! tabs needs React >=19.2.0 — found 18.3.1.
  The files are still copied; they may fail at runtime until React is upgraded.
```

**A check, not an install.** Putting `"react"` in a component's `dependencies` would have run `npm install react` in your project — pulling React to latest as a side effect of `add button` — which is the opposite of declaring a minimum. The files are still written either way: you may be about to upgrade, and a copy-paste library has no business changing your React version. An unparseable floor, or a React version that cannot be determined, produces no warning rather than a guess.
