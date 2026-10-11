# Developer proposals

Look at a few components the way a careful outside developer would, and propose the improvements
worth a maintainer's time. Triage finds what is broken; this desk finds what could be better.

Complete the [preflight](./README.md#preflight--every-job-before-anything-else) first, then the
[desk throttle](./README.md#desk-throttle).

## 1. Pick this week's components

Rotate through the registry so every component gets looked at over time:

```sh
ls src/components/*.tsx | grep -vE '\.(stories|test)\.tsx$' | sort |
  awk -v w="$(date +%V)" '{ c[NR] = $0 } END { for (i = 0; i < 3; i++) print c[(w * 3 + i) % NR + 1] }'
```

Also include any component changed on `main` in the last 7 days (`git log --since='7 days ago'
--name-only -- src/components`).

## 2. Read

For each component, read its source, its stories, its `registry/registry.json` entry, and its docs
page under `docs/src/`. Read `docs/component-api-patterns.md` once per run.

## 3. Look for

- **API consistency.** Does it follow `docs/component-api-patterns.md` — compound parts exported
  by name, `<Component>Props` exported, controlled and uncontrolled both supported with the dev
  warning, `asChild` where siblings have it, `data-slot` on every part? Compare prop names with
  sibling components that do the same thing.
- **Correctness.** Edge cases the code does not handle: empty and very long content, missing
  optional props, rapid toggling, unmount during a transition, server rendering (`window` or
  `document` at module scope), ref forwarding to the right element.
- **Ecosystem.** `npm view react dist-tags`, `npm view tailwindcss dist-tags`, and the same for
  each runtime dependency the component lists in the registry. A new major, a deprecation notice,
  or a peer range the registry no longer satisfies is worth a proposal.
- **Test gaps.** Behavior the component has but no `play` function exercises — keyboard paths,
  disabled and invalid states, controlled mode.

Skip anything that would change the public contract or the visual system unless you file it with
`needs:maintainer`; skip style preferences that no document in the repo backs.

## 4. File

Deduplicate exactly as [`triage.md`](./triage.md#2-deduplicate) does. File **at most 2** proposals
per run, the most valuable first; mention the rest in the run summary.

Labels: `source:agent`, `desk:dev`, one `area:*`, and `bug` or `enhancement`. Add
`needs:maintainer` when it touches the public contract, the design system, or product scope.
Fingerprint prefix: `dev:` (for example `dev:select:uncontrolled-warning-missing`).

```markdown
## Observation

What you noticed, in one or two sentences.

## Evidence

`file:line` links, a minimal reproduction, or command output.

## Proposal

The change, and what it would cost — public contract, visual change, bundle size, migration.

## Readiness

Recommended labels (for example `p3`, `agent:ready`), or what decision is needed first.

Fingerprint: dev:<component>:<slug>

<sub>Filed by Bunsen · developer proposals · YYYY-MM-DD</sub>
```

End with the run summary described in [`README.md`](./README.md#rules-for-every-job), naming the
components reviewed.
