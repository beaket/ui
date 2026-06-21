# 0019 — Controlled-value mode: keep the core uncontrolled, ship a controlled-bridge recipe (not a `value` prop)

- **Status:** Accepted
- **Date:** 2026-06-21
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Controlled-value mode: keep the core uncontrolled, ship a controlled-bridge recipe

## Context

`<Paper>` is deliberately **uncontrolled** (ADR-0013 decision 2): `defaultValue` seeds the initial
document, `ref.setValue()` commands a wholesale replacement, and `onChange` emits the full markdown on
user edits only. The markdown owned by the editor is the single source of truth at the API boundary
(`CONTEXT.md`'s mental model).

Some consumers want the React-idiomatic **controlled** story — `<Paper value={md} onChange={setMd} />`,
where a parent holds the value in state and feeds it back every render. This is child ⑦ of the
embedding/extensibility epic (#505, issue #503), formally a **decision** (`type:arch`): a real `value`
prop would revise the load-bearing ADR-0013 and add a contract to the surface that **freezes at 1.0**
(#480).

**The tension a live `value` prop reintroduces** — the two exact problems the uncontrolled design
exists to prevent (ADR-0013 decision 2):

1. **It fights IME.** A controlled form swaps the document whenever `value` changes. If an external
   value arrives mid-composition (`view.composing`), the result is a cursor jump and a broken
   composition — breaking, at the React-contract level, the invariant ADR-0004 paid the most to
   protect.
2. **It is a second source of truth.** React state and the editor document both claim to own the
   text; keeping them in lockstep per keystroke is the very coupling the uncontrolled boundary
   removes.

## Decision — Option A: keep the core uncontrolled; ship a documented controlled-bridge recipe

Two options were weighed (issue #503):

- **A. A controlled-bridge recipe** — a thin consumer-side wrapper over the uncontrolled `<Paper>`,
  shipped as documentation + a runnable example. **No API change**; the core stays uncontrolled.
- **B. A real `value` prop** — first-class on `PaperProps`, revising ADR-0013 decision 2 and defining
  an IME/echo contract.

**We choose A.** The recipe is the official controlled story; ADR-0013 decision 2 stands unchanged.

The bridge is the standard "controlled-over-uncontrolled" pattern, and it works because the uncontrolled
surface already provides both halves: `setValue` is IME-deferred (ADR-0004 / value-controller), and
`onChange` fires on **user edits only** (`setValue` does not echo, ADR-0013 step B). So an
`value !== getValue()` guard is all that is needed:

```tsx
function ControlledPaper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<PaperHandle>(null);
  useEffect(() => {
    // Sync EXTERNAL value changes into the editor. Skip the echo of the user's own edit:
    // after onChange, `value` already equals what the editor holds, so this is a no-op then —
    // no cursor jump. A real external change (load/reset/sync) differs, so setValue applies
    // (IME-deferred internally).
    if (ref.current && value !== ref.current.getValue()) ref.current.setValue(value);
  }, [value]);
  return <Paper ref={ref} defaultValue={value} onChange={onChange} />;
}
```

- **Echo-guard.** The user types → `onChange(v)` → parent state becomes `v` → the effect runs but
  `v === getValue()`, so `setValue` is skipped. No re-application of the user's own keystroke, no
  cursor jump.
- **IME.** External changes route through `setValue`, which already defers during composition and
  applies on `compositionend` — the IME tension of a raw `value` prop never arises.
- **Caveat (documented).** The parent must store **exactly** what `onChange` emits. A per-keystroke
  transform (uppercasing, normalization) makes `value !== getValue()` mid-type and re-triggers
  `setValue` → a cursor jump. The recipe is for **wholesale / external** value changes (server load,
  reset-to-template, cross-tab sync), not per-keystroke control of a rich Live-Preview editor — that
  is what the uncontrolled boundary is for.

## Why A, and why it forecloses nothing

- **Principle.** A keeps the single-source-of-truth boundary and the IME guarantee intact; B trades
  them away for an idiom the bridge already delivers.
- **Restraint (lightness).** A adds zero public surface to freeze at 1.0.
- **Low-regret / reversible.** A `value` prop is **additive and optional**. If real demand for a
  first-class controlled prop appears, B can be added later as a **non-breaking minor** (with the IME
  echo contract designed then). There is no now-or-never pressure: choosing A closes no door.

## Alternatives and rejections

- **B — a real `value` prop (revise ADR-0013).** Reintroduces the IME-composition break and the
  double source of truth (ADR-0013 decision 2's two rationales), and locks a new contract onto the
  1.0-frozen surface for a capability the bridge already covers. Rejected for v1; revisitable as a
  non-breaking minor on demand.
- **A pull-only story (no recipe, "just use `getValue()`/`setValue()`").** Already possible, but it
  leaves the most-asked React-controlled question unanswered. The recipe is the small, honest
  answer — the same "mechanism in editor, policy/example in consumer" stance as the rest of the epic.

## Consequences

- **No code change to `@beaket/paper`.** ADR-0013 decision 2 (uncontrolled) stands. This ships as docs
  (`sites/paper` usage page + a runnable example) and this ADR — no published tarball change, so no
  changeset/version bump (the docs-only path, per `changeset-check.yml`).
- **The controlled story is now official and bounded:** a copy-pasteable bridge with an explicit
  echo-guard and a documented "wholesale-not-per-keystroke" caveat.
- **`DECISIONS.md`** gains a one-line pointer that the uncontrolled boundary now has a sanctioned
  controlled-bridge recipe (it does not change a constraint — uncontrolled is unchanged — so the
  existing ADR-0013 bullet is annotated rather than rewritten).
- **Deferred, not foreclosed:** a first-class `value` prop (Option B) as a future non-breaking minor
  if demand materializes.
