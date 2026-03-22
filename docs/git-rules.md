# Git Rules

## Versioning Policy

### NEVER use `major` in changesets without explicit approval

This project uses [Changesets](https://github.com/changesets/changesets) for versioning. **Major version bumps are restricted** and must be explicitly approved by a maintainer.

- **`patch`** — Bug fixes, typos, minor adjustments. Use freely.
- **`minor`** — New features, new components, non-breaking enhancements. Use freely.
- **`major`** — **BLOCKED by default.** Breaking changes, removed APIs, renamed exports.

### Why?

A major version bump signals breaking changes to every consumer of this library. Premature or accidental major bumps erode trust and force unnecessary migration work on users. We release major versions deliberately, not accidentally.

### How to release a major version

1. Discuss with maintainers first
2. Create the changeset with `minor` initially
3. A maintainer will change it to `major` and add `ALLOW_MAJOR=1` to the commit message to bypass the pre-commit hook
4. The release PR will then bump the major version

### Pre-commit hook

The `pre-commit` hook automatically blocks commits that contain `major` changesets unless `ALLOW_MAJOR=1` is set as an environment variable:

```bash
# Normal commit — major changesets are blocked
git commit -m "feat: add something"

# Explicitly allow major — maintainer override
ALLOW_MAJOR=1 git commit -m "feat!: remove deprecated API"
```

## Changeset Guidelines

- Package name must always be `@beaket/ui`
- One changeset per logical change
- Write clear, user-facing descriptions (these appear in the changelog)
- Include migration instructions for any breaking change
