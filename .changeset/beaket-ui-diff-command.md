---
"@beaket/ui": minor
---

feat(cli): tell existing users when a component's style has moved

Copied components don't auto-update, so a consumer on an older style had no way to know a component had been restyled upstream — `add` only knew "a file is here" and asked to overwrite, learning nothing about whether their copy was actually behind.

- **`diff` command** — `npx @beaket/ui diff` lists every installed component as up to date or having upstream changes; `npx @beaket/ui diff <component>` prints the line-by-line diff between your copy and the registry, then points you at `add <component> --overwrite` (or hand-merging if you've customized it). It never writes — you own the code.
- **Smarter `add`** — an existing file is compared against upstream: files already matching are left untouched (no prompt), and only a genuine upstream change prompts to overwrite, with wording that says your copy may be an older style rather than just that a file exists. Skipped files point at `diff` to see what changed.
