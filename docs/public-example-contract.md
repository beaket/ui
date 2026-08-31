# Public example contract

Issue #786 establishes `src/examples/` as the only public-example boundary. A module at
`src/examples/<component>/<example>.tsx` is consumer-ready TSX: it imports only the component,
its required public context, and ordinary React dependencies, then default-exports the component
rendered beside its code block. The docs site reads that exact file through Vite's `?raw` import;
it never derives snippets from a Storybook CSF file.

`src/examples/manifest.json` assigns each module a stable `<component>.<example>` ID, a visible
title, its compatibility story key, and `behavior` plus `hydration` metadata. `static` examples
use `hydration: "none"`; `interactive` examples use `hydration: "visible"`. The later SSR preview
work can choose an island boundary from this metadata without evaluating browser globals during
server render.

Storybook imports the default export from the public module and may add controls, parameters,
decorators, wrappers, and `play` tests in `*.stories.tsx`. Those are QA-only and never enter the
public module or displayed source. A wrapper that changes the visible example is not allowed in
the docs path; Storybook-only wrappers must be invisible QA scaffolding.

The registry's `previewStory` and `sections` remain compatibility keys during migration. The
contract validator requires public examples for the migrated Button, Input, and Dialog keys;
other components keep the current preview loader only until the repository-wide migration issue.
That migration owns removal of `extractExports`, raw story-source lookup, and the fallback path.

Run `pnpm validate:examples` (also part of `pnpm typecheck`) to reject duplicate IDs, unsupported
metadata, missing modules, missing migrated registry references, browser-only render paths, and
Storybook leakage. The proof set is Button (static/native), Input Affixes (stateful), and Dialog
(portal/Radix-backed).
