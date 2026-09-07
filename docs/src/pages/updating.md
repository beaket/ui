---
layout: ../layouts/doc.astro
title: Updating
---

# Updating

Your components are source files in the directory recorded by `beaket.ui.json`
(usually `src/components/ui`). They are not component implementations loaded
from `node_modules/@beaket/ui`. The CLI and runtime dependencies still use
`node_modules`; the copied component files belong to your app.

```text
GitHub registry at a release tag / commit
                 |
              ui add
                 v
       your components/ui/*.tsx  <-- your edits
                 |
          your app imports

ui diff reads these files. It does not rewrite them.
npm update changes dependencies, not these copied files.
```

## Four different operations

| Operation                                        | What changes                                                                                                                         | What does not                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Run a newer CLI, such as `npx @beaket/ui@latest` | The tool version you execute                                                                                                         | Existing component source and theme CSS            |
| `ui diff [component]`                            | Nothing; reads recorded base, local source and target registry                                                                       | Source, configuration and backups                  |
| `ui add <component>`                             | Copies selected components and their registry dependencies; installs required npm packages; records successfully installed baselines | Skipped local files retain their previous baseline |
| `ui theme`                                       | Regenerates the managed CSS block and records its hash; a successful switch also saves the theme name                                | Consumer CSS outside the managed markers           |

`add` can also offer to synchronize the configured theme after copying files.
Its `--overwrite` option applies to both component replacement and that theme
sync. Use a clean commit and review both source and CSS changes.

## Before updating

Read the [Changelog](/ui/changelog), then commit your current component files,
CSS and `beaket.ui.json`. That configuration records the source ref, SHA-256
content hash and CLI version for each copied file. Keep it in version control.

The default registry matches the CLI release tag. You can deliberately choose
a different tag or commit with `--registry-ref`, or opt into the current main
commit with `--latest`. These options are mutually exclusive. Missing release
tags cause an error; the CLI never silently substitutes main. Historical
2.8.0 and 3.0.0 releases have no tags.

```bash
# Read the changelog first. Running a newer tool does not upgrade your files.
npx @beaket/ui@latest diff button
# Or explicitly inspect the current main registry:
npx @beaket/ui@latest diff button --latest
```

The diff separates your edits from upstream edits when a verified baseline is
available. Git must be installed for three-way comparison. Exit codes are
`0` for clean/local-only changes, `1` for mergeable upstream changes,
`2` for conflicts, and `3` for unknown baselines or operational errors.
An exit code of 1 is review information, not permission to discard your edits.

Older installations have no recorded baseline. They receive an explicit
unknown-baseline result and a two-way diff. Do not overwrite a customized file
just to create a baseline. Recover the original source from version control
when possible, and compare or hand-merge it.

## Keep customization outside the copied file first

Composition, `className`, and a small app-owned wrapper usually cover layout,
branding and default props:

```tsx
import { Button, type ButtonProps } from "@/components/ui/button";

// Store outside the vendored UI directory, for example components/app-button.tsx.
export function AppButton(props: ButtonProps) {
  return <Button size="sm" {...props} />;
}
```

The caller can still override `size`, `className` and handlers. Replacing the
copied `button.tsx` does not overwrite this wrapper. It can still expose an
upstream behavior change, so run your app's tests after every update.

Fork the copied source when you need to change internal rendering or behavior
that its composition and props cannot express. A custom variant inside its
CVA table is a source edit: keep a small diff and regression test for it.

## Replacement is not merging

By default, changed existing files ask for confirmation with **No** selected.
Matching files are left alone. Review the diff and hand-merge customizations
when you need to keep them. There is no automatic merge command.

```bash
npx @beaket/ui@latest add button
# Only after reviewing and committing your current work:
npx @beaket/ui@latest add button --overwrite
```

**Treat `--overwrite` as permission to discard local edits in the target
files.** Every replacement first saves the previous file as `.bak`, then
`.bak.1`, `.bak.2`, and so on without replacing earlier backups. A backup
failure aborts that replacement. These are recovery copies, not a merge
strategy or a substitute for version control. Review the resulting Git diff,
restore or reapply needed edits, and run your tests before committing.

## Theme updates have their own boundary

```bash
npx @beaket/ui theme --theme eucalyptus --diff
npx @beaket/ui theme --theme eucalyptus --dry-run
# Apply only after review; confirmation defaults to No.
npx @beaket/ui theme --theme eucalyptus
```

Both preview flags are read-only, even with `--overwrite`: no CSS, config or
backup is written. The managed block has a DO NOT EDIT header and stored hash;
a mismatch warns about hand edits. Replacements save numbered backups.

Put brand values in the generated override section after
`/* beaket:theme:end */`, keeping its light, system-dark and forced-dark
selectors. That section survives later theme switches. Plain `:root`
overrides can lose to the generated dark selectors. See
[Themes](/ui/themes) for selector specificity, `data-theme`, and reduced motion.
