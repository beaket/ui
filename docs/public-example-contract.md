# Public example contract

Issue #786 establishes `src/examples/` as the only public-example boundary. A module at
`src/examples/<component>/<example>.tsx` is consumer-ready TSX: it imports only the component,
its required public context, and ordinary React dependencies, then default-exports the component
rendered beside its code block. The docs site reads that exact file through Vite's `?raw` import;
it never derives snippets from a Storybook CSF file.

Nothing declares that set: a module's path _is_ its identity. `getPublicExample(component, story)`
kebab-cases the registry's story key to find `src/examples/<component>/<example>.tsx`, so the file
name and the section key are the same fact written once. Whether an example hydrates is likewise
one fact in one place — `docs/src/components/interactive-example.tsx` imports the interactive
modules explicitly, which both answers the question and keeps static examples out of the client
bundle.

Storybook imports the default export from the public module and may add controls, parameters,
decorators, wrappers, and `play` tests in `*.stories.tsx`. Those are QA-only and never enter the
public module or displayed source. A wrapper that changes the visible example is not allowed in
the docs path; Storybook-only wrappers must be invisible QA scaffolding.

The registry's `previewStory` and `sections` are stable lookup keys, not Storybook dependencies.
The contract validator requires a public example for every registry hero and section, and the
docs renderer reads only those modules. Storybook remains free to import a public module for
visual coverage while retaining its own controls and interaction tests.

Run `pnpm validate:examples` (also part of `pnpm typecheck`) to reject missing modules, examples
nothing documents, missing default exports, browser-only render paths, Storybook leakage, and a
docs-registered example that does not exist. The proof set is Button (static/native), Input
Affixes (stateful), and Dialog (portal/Radix-backed).
