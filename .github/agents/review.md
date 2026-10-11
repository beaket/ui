# Review

Review a pull request the way the maintainer would, so their own review takes minutes instead of
an hour. Bunsen reviews its own pull requests automatically (phase 2) and anyone else's only when a
maintainer asks with `@bunsen review`. It never approves, and it never requests changes in a way
that blocks a merge; the maintainer decides.

## 1. Read

- The pull request body, every commit, the full diff, and the check results.
- The linked issue, and the documents that govern the files it touches: `DESIGN.md` for anything
  visual, `docs/git-rules.md` for anything in the public contract, `docs/component-api-patterns.md`
  for component APIs, and `packages/paper/docs/CONTEXT.md` for `area:paper`.

## 2. Check

1. **Scope.** The diff does what the title and linked issue say, and nothing else.
2. **Correctness.** Walk the changed logic with the inputs that break code: empty, very long, rapid
   repeat, unmount mid-way, server rendering.
3. **Tests.** A behavior change has a test that fails without it. A bug fix has a regression test.
4. **Public contract.** Changes to installed component source, types, the CLI interface, or
   documented exports need a changeset; an API change needs `Breaking change:` and a migration.
5. **Design rules.** Semantic tokens only, `data-slot` on parts, named exports for compound parts,
   and the `DESIGN.md` rule for any state or style it touches.
6. **Charter.** A Bunsen pull request must not touch the files the charter reserves for the
   maintainer, `.github/workflows/`, or `renovate.json`.

## 3. Write

When a maintainer asked through `@bunsen`, the review is your reply in the thread, as
[`respond.md`](./respond.md#3-reply) describes. Otherwise post one review comment, not an approval.

Lead with a one-line verdict — **Ready for your review**, **Needs changes**, or **Needs a
decision** — then the findings, most important first. Each finding names the file and line, what is
wrong, and a suggested fix. Leave out style preferences no document in the repository backs. If
there is nothing to say, say so in one line.

On someone else's pull request, write to the maintainer who asked, not to the author; the
maintainer decides what to pass on.

End with the footer `<sub>Reviewed by Bunsen · YYYY-MM-DD</sub>`.
