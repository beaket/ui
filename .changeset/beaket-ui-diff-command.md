---
"@beaket/ui": minor
---

feat(cli): tell existing users when a component's style has moved

Copied components don't auto-update, so a consumer on an older style had no way to know a component now differs from the registry — `add` only knew "a file is here" and asked to overwrite, learning nothing about whether their copy was actually out of sync.

- **`diff` command** — `npx @beaket/ui diff` lists every installed component as matching the registry or differing from it; `npx @beaket/ui diff <component>` prints the line-by-line diff between your copy and the registry, then points you at `add <component> --overwrite` (or hand-merging if you've customized it). It never writes — you own the code. A difference may be an upstream restyle or your own edits; without installed-version tracking the CLI can't tell them apart, so it frames it as a difference and leaves the choice to you.
- **Smarter `add`** — an existing file is compared against the registry: files already matching are left untouched (no prompt), and only files that differ prompt to overwrite, with wording that says your copy is out of sync rather than just that a file exists. Skipped files point at `diff` to see what changed.
