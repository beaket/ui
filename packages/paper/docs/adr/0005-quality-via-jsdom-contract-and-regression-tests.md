# 0005 — Quality via a jsdom Contract & Regression Test Layer, with Bugs Locked Down red → green

- **Status:** Accepted
- **Date:** 2026-06-13
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Quality is assured by a jsdom contract & regression test layer, and bugs are locked down red → green

Because browser automation cannot reproduce a genuine IME pipeline, we initially relied on nothing but synthetic events plus manual verification. That approach let the code-block + composition-breaking bug (ADR-0004) through. A verification experiment then confirmed the following: under vitest + jsdom (plus the Range / ResizeObserver / CompositionEvent polyfills in `src/test/setup.ts`), a CM6 `EditorView` runs the production extension set (`editorExtensions()`) exactly as shipped, and the decoration exception reproduces identically to the browser. The layout measurements are zero, but the things we actually want to guarantee — transaction, decoration, and synchronization logic — are independent of those measurements.

We therefore structure the tests in three layers:

1. **Regression tests** (e.g. `imeComposition.test.ts`) — any bug that surfaces in real-world use is first locked down with a test that fails before the fix (red → green, per the CLAUDE.md rule).
2. **Contract tests** (`composingGuard.test.ts`) — these verify the invariants that first-class CJK support depends on (no compute call during composition, decoration mapping on `docChanged`, and re-evaluation after composition ends) as behavior rather than as implementation.
3. **Pure-logic tests** (table parse/serialize round-trips, cell inline rendering, paste conversion) — to enable these, pure functions are kept exported and testable.

For the area jsdom cannot cover (browser-specific `beforeinput` ordering, real composition timing), the ultimate guarantee is real user typing; if automation becomes necessary, the next step is to introduce Playwright + the CDP `Input.imeSetComposition` API.
