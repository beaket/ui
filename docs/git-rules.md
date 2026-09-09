# Git Rules

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/) for its published packages. Classify a change by its released public contract, not by whether the implementation was a “fix.”

### Public contract and changeset type

The public contract is the documented CLI interface, the component source and types installed by `ui add`, and the documented exports of published packages. Internal refactors and docs-only changes do not change this contract.

| Change                                                                    | Changeset |
| ------------------------------------------------------------------------- | --------- |
| Restores defective behavior without reducing the released public contract | `patch`   |
| Adds backward-compatible functionality or deprecates a public API         | `minor`   |
| Removes, renames, narrows, or otherwise makes a public API incompatible   | `major`   |

For an initial-development `0.y.z` package, SemVer permits API changes; use `minor` for an incompatible public-contract change and never hide it in a `patch`.

Every external API change is a breaking change, regardless of whether its release type is `patch`, `minor`, or `major`. Its changeset description must start with **`Breaking change:`** and include migration instructions.

### Major changes require explicit approval

**Major version bumps are restricted** and require explicit maintainer approval. Classify the change correctly first: do not submit an intended `major` as a `minor` placeholder. Without approval, stop for direction or keep the API and deprecate it in a `minor` release.

### Why?

A major version bump signals breaking changes to every consumer of this library. Premature or accidental major bumps erode trust and force unnecessary migration work on users. We release major versions deliberately, not accidentally.

### How to release a major version

1. Discuss with maintainers first.
2. Add a `major` changeset with migration instructions.
3. Set `ALLOW_MAJOR=1` while committing to bypass the pre-commit hook.
4. The release PR will then bump the major version.

### Pre-commit hook

The `pre-commit` hook automatically blocks commits that contain `major` changesets unless `ALLOW_MAJOR=1` is set as an environment variable:

```bash
# Normal commit — major changesets are blocked
git commit -m "feat: add something"

# Explicitly allow major — maintainer override
ALLOW_MAJOR=1 git commit -m "feat!: remove deprecated API"
```

## Changeset Guidelines

- Package name must be one of the published workspace packages: `@beaket/ui` (the CLI in `packages/cli`) or `@beaket/paper` (the editor in `packages/paper`). Match the changeset to the package you actually changed.
- One changeset per logical change
- Write clear, user-facing descriptions (these appear in the changelog)
- Every external API change must start its description with **`Breaking change:`** and include migration instructions, regardless of release type

## Architecture Decision Records

`@beaket/paper` keeps an append-only ADR log at `packages/paper/docs/adr/` (indexed by `DECISIONS.md`). The full rule — when a change needs an ADR vs. a changeset, the amend/supersede lifecycle, and the citation convention — lives in `packages/paper/docs/adr/README.md`. In short: **ADRs are for decisions** (alternatives, load-bearing approach, revising a prior ADR); routine bug/perf fixes get a changeset whose body states the **root cause**. Every `ADR-NNNN` cited in code must resolve to a file (enforced by `pnpm check:adr` in CI).
