# @beaket/ui

## 4.0.0

### Major Changes

- [#906](https://github.com/beaket/ui/pull/906) [`0d51ce4`](https://github.com/beaket/ui/commit/0d51ce4be915e49140a026db2389d27717ce681b) Thanks [@jihnma](https://github.com/jihnma)! - Breaking: `Tooltip` no longer mounts its own `TooltipProvider`

  `Tooltip` wrapped every instance in its own `TooltipPrimitive.Provider`, so a
  `TooltipProvider` placed around a group was shadowed by the inner one and its
  `delayDuration` could never reach a tooltip. The provider is now what it is in
  Radix — required, and the single place the delay is configured.

  ```diff
  - <Tooltip delayDuration={700}>…</Tooltip>
  - <Tooltip delayDuration={700}>…</Tooltip>
  + <TooltipProvider delayDuration={700}>
  +   <Tooltip>…</Tooltip>
  +   <Tooltip>…</Tooltip>
  + </TooltipProvider>
  ```

  Every `Tooltip` must now sit inside a `TooltipProvider`; Radix throws otherwise.
  Mount one near the root of your app. `delayDuration` stays available on a single
  `Tooltip` as a per-tooltip override of the provider's value, and the provider
  still defaults to `0`.

### Minor Changes

- [#949](https://github.com/beaket/ui/pull/949) [`44a97c6`](https://github.com/beaket/ui/commit/44a97c6e9ee5dc43ee4b3caefd90677d93cd768b) Thanks [@jihnma](https://github.com/jihnma)! - Pin registry downloads to the CLI release tag. Use --registry-ref to select a tag or commit, or --latest to explicitly resolve main to a commit. Missing release tags fail with explicit fallback guidance instead of silently fetching main.

  Record the registry ref, SHA-256 hash and CLI version for each installed file in beaket.ui.json, preserving existing baselines when local changes are skipped. Diff compares the recorded baseline, local source and target release, verifies baseline hashes, and separates local customizations from upstream changes. Exit codes are 0 for clean/local-only, 1 for mergeable updates, 2 for conflicts, and 3 for unknown baselines or errors. Comparing changes on both sides requires Git. Overwrite remains an explicit replacement with backups; automatic merging is deferred.

### Patch Changes

- [#947](https://github.com/beaket/ui/pull/947) [`5ff6181`](https://github.com/beaket/ui/commit/5ff6181bafd2445bb28a94f676835769c50c0ee5) Thanks [@jihnma](https://github.com/jihnma)! - Type development warnings without requiring Node globals in browser projects, remove DataTable's unused generic, and generate documented React requirements from the registry. Remove the deprecated baseUrl option from installation instructions.

- [#906](https://github.com/beaket/ui/pull/906) [`0d51ce4`](https://github.com/beaket/ui/commit/0d51ce4be915e49140a026db2389d27717ce681b) Thanks [@jihnma](https://github.com/jihnma)! - Remove `className` redeclarations from six component prop types

  `AvatarProps`, `CheckboxProps`, `RadioGroupProps`, `RadioItemProps`,
  `SwitchProps`, and `TextareaProps` each redeclared `className?: string` inside an
  interface already extending a props type that provides it. It reached no
  consumer and no docs table — the props generator excludes `className`. Types are
  unchanged. `CheckboxProps`, `RadioGroupProps`, and `RadioItemProps` are now type
  aliases, matching `LabelProps`.

  `PaginationBaseProps` and `DataTableProps` keep theirs: neither extends a DOM
  props type, so the declaration is the only source.

- [#906](https://github.com/beaket/ui/pull/906) [`0d51ce4`](https://github.com/beaket/ui/commit/0d51ce4be915e49140a026db2389d27717ce681b) Thanks [@jihnma](https://github.com/jihnma)! - `alert`, `badge`, and `switch` no longer depend on `class-variance-authority`

  Each used `cva` for a single flat variant map with no compound variants — a
  lookup keyed by one prop. `alert.tsx` already spelled the same lookup twice as a
  plain object (`variantIcons`, `variantTitles`) directly beneath the `cva` call.
  The three now use a plain object too, so `ui add alert|badge|switch` installs one
  package fewer. `button` and `card` keep `cva`, where two axes and compound
  variants earn it.

  Rendered class strings are unchanged. `AlertProps` and `SwitchProps` drop the
  `VariantProps<…>` they extended, which restated literal unions the interfaces
  already declare.

- [#947](https://github.com/beaket/ui/pull/947) [`5ff6181`](https://github.com/beaket/ui/commit/5ff6181bafd2445bb28a94f676835769c50c0ee5) Thanks [@jihnma](https://github.com/jihnma)! - Preserve local files in numbered backups before overwriting, label overwritten files explicitly, and recommend reviewing diffs before discarding customizations. Resolve transitive registry dependencies when adding a component. Theme updates now ask before replacing tokens, and re-running init preserves existing configuration and directs theme switches to the theme command.

## 3.1.0

### Minor Changes

- [#901](https://github.com/beaket/ui/pull/901) [`4628023`](https://github.com/beaket/ui/commit/4628023738155ac21501912d9b63f830d587bdef) Thanks [@jihnma](https://github.com/jihnma)! - Drop four dependencies and one migration path.

  - `Label` and `Separator` render a plain `<label>` and `<div role="separator">` instead of wrapping `@radix-ui/react-label` / `@radix-ui/react-separator`. Same DOM, same `data-slot`/`data-orientation`/`aria-orientation`, two fewer packages for a project that installs them. Radix Label's one behavior beyond the element — suppressing text selection when a label is double-clicked — is gone with it.
  - The CLI drops `fs-extra` and `picocolors` for `node:fs/promises` and `node:util.styleText`, which raises its floor to **Node 22.13** (now declared in `engines`).
  - `ui theme` and `ui add` no longer recognise a theme block written before the `/* beaket:theme:start */` markers shipped (April 2026, [#309](https://github.com/beaket/ui/issues/309)). An unmarked block is now left alone and the current theme is appended after it; re-run `npx @beaket/ui init` if your CSS still carries one.

## 3.0.0

### Major Changes

- [#890](https://github.com/beaket/ui/pull/890) [`22104a3`](https://github.com/beaket/ui/commit/22104a3fd90c329ad081b21c6bc01e6eb0cf1ace) Thanks [@jihnma](https://github.com/jihnma)! - Breaking: `RadioGroup.Item`, `<Component>Props` names, and `closeWhen` is gone

  Three breaking changes batched into one sign-off, because a major bump is a cost paid once (`docs/git-rules.md`).

  ### `RadioItem` → `RadioGroup.Item`

  Radio was already a true compound component — it shares state through Radix's context — and only the packaging disagreed with `Select` and `Tabs`.

  ```diff
  - import { RadioGroup, RadioItem } from "@/components/ui/radio";
  + import { RadioGroup } from "@/components/ui/radio";

    <RadioGroup defaultValue="a">
  -   <RadioItem value="a" />
  +   <RadioGroup.Item value="a" />
    </RadioGroup>
  ```

  `RadioItemProps` keeps its name and stays exported. `data-slot="radio-item"` is unchanged.

  ### Generic `Props` → `<Component>Props`, exported everywhere

  `Props` lands in _your_ codebase, where it is un-greppable and forces `import { Props as ButtonProps }`. Four exported names change:

  ```diff
  - import { Button, type Props } from "@/components/ui/button";
  + import { Button, type ButtonProps } from "@/components/ui/button";
  ```

  | Was                    | Now             |
  | ---------------------- | --------------- |
  | `badge.tsx` `Props`    | `BadgeProps`    |
  | `button.tsx` `Props`   | `ButtonProps`   |
  | `checkbox.tsx` `Props` | `CheckboxProps` |
  | `input.tsx` `Props`    | `InputProps`    |

  The rest is free: `AvatarProps`, `DialogProps`, `SheetProps` and `TextareaProps` were generic `Props` that nobody could import, and `AlertProps`, `SelectTriggerProps`, `TooltipProps` and `TooltipProviderProps` were named right but unexported. Exporting a props type is what lets you write a wrapper — the first thing anyone does with a copy-pasted component.

  ### `closeWhen` removed from Dialog and Sheet

  ```diff
  - <Dialog open={open} onOpenChange={setOpen} closeWhen={result?.ok}>
  + <Dialog open={open} onOpenChange={setOpen}>
  ```

  Close it from the state you already own: `useEffect(() => { if (result?.ok) setOpen(false); }, [result])`.

  `closeWhen` was the only reason Dialog and Sheet hand-rolled controlled/uncontrolled state that Radix's `Root` already implements. With it gone, `open` and `onOpenChange` pass straight to Radix, and the render-time ref write that served it disappears with it. The dev warning for `open` without `onOpenChange` is unchanged.

### Minor Changes

- [#876](https://github.com/beaket/ui/pull/876) [`b8015bb`](https://github.com/beaket/ui/commit/b8015bb9b006c77e8754464efe3f9f65badafc1c) Thanks [@jihnma](https://github.com/jihnma)! - `Breadcrumb.Link` and `Navigation.Link` accept `asChild`

  Both hardcoded a plain `<a href>`, so in Next.js or React Router a consumer had to either lose client-side navigation or rewrite the component — which, under Open Code, means forking the file forever. `asChild` renders the consumer's own element instead:

  ```tsx
  <Breadcrumb.Link asChild>
    <Link href="/docs">Docs</Link>
  </Breadcrumb.Link>
  ```

  Under `asChild` the component injects nothing: the child owns its tag, and `Navigation.Link` skips its press-travel wrapper the way Button skips its spinner. Both components now list `@radix-ui/react-slot` in the registry.

- [#887](https://github.com/beaket/ui/pull/887) [`005e77f`](https://github.com/beaket/ui/commit/005e77f6f2a991d32bade483d4228c3034b2f78e) Thanks [@jihnma](https://github.com/jihnma)! - DataTable defers its global filter, and the render-time ref writes are gone

  **F6** — typing in the search field re-ran filtering and re-rendered the whole table in the same commit. The input is now bound to the immediate value and the table receives a `useDeferredValue` of it: typing stays responsive and the expensive pass lags by design.

  **F2** — `data-table.tsx` carried two hand-rolled "latest ref" writes _during render_ (`tableRef.current = table`, `onSelectionChangeRef.current = onSelectionChange`) — a shape React tells you not to write and that React Compiler, which runs in **your** build, refuses to optimize past. `useEffectEvent` replaces both: it is the official answer for an Effect calling the freshest callback, and it closes over the freshest `table` as well, so the second ref disappears with the first.

  `textarea.tsx` had the same render-time write for its forwarded-ref merge. That is not an Effect callback, so `useEffectEvent` does not apply; the ref is simply gone and the merge depends on `ref` directly.

  `data-table` now declares `"react": ">=19.2.0"` in the registry (`useEffectEvent`); `add` warns if your project is below it. `useDeferredValue` is a React 18 API and needs no floor.

- [#877](https://github.com/beaket/ui/pull/877) [`a955418`](https://github.com/beaket/ui/commit/a955418601f5c53105812054334db20f6bdd21c1) Thanks [@jihnma](https://github.com/jihnma)! - `data-slot` on every element DataTable renders

  `data-table.tsx` was the only component in the registry with **zero** `data-slot` attributes, so its entire DOM was unaddressable from outside — part of why it compensates with `getRowClassName` and a 20-prop interface.

  Hyrum's Law says something becomes the contract whether we choose it or not. `data-slot` is the blessed observable: stable, named, free at runtime, and explicitly not the class names, which are ours to rewrite on every redesign.

  24 of the 28 rendered elements now carry a `data-table-*` slot — `data-table`, `-toolbar`, `-search`, `-search-icon`, `-container`, `-table`, `-header`, `-header-row`, `-select-head`, `-head`, `-head-content`, `-sort-indicator`, `-sort-icon`, `-body`, `-row`, `-select-cell`, `-cell`, `-empty-row`, `-empty-cell`, `-empty`, `-footer`, `-summary`.

  The other four are composed controls — `Input`, two `Checkbox`es and `Pagination` — which keep their own slots rather than being overwritten; they are addressable through the named container around each.

  Attributes only. No API change.

- [#885](https://github.com/beaket/ui/pull/885) [`8a6c2bc`](https://github.com/beaket/ui/commit/8a6c2bc4ff9ac2c7abf5e69c759ce01706fd316d) Thanks [@jihnma](https://github.com/jihnma)! - `Dialog.Trigger` and `Sheet.Trigger` parts

  Dialog and Sheet accepted the trigger as a `ReactNode` prop and exposed no `Trigger` part, so the sugar **was** the API. A consumer who needed two triggers, or a conditional one, or a trigger that is not the first child, had nowhere to go — and a `ReactNode` prop is structurally invisible: nothing in the type says `trigger` must be focusable.

  ```tsx
  <Dialog>
    <Dialog.Trigger>
      <Button>Open</Button>
    </Dialog.Trigger>
    <Dialog.Trigger>
      <Button variant="ghost">Also open</Button>
    </Dialog.Trigger>
    <Dialog.Title>…</Dialog.Title>
  </Dialog>
  ```

  Radix's context was already mounted here; the wrapper simply did not expose the part. `asChild` defaults to `true`, matching `Dialog.Close`, so the natural nesting keeps the consumer's own element.

  Additive: `trigger` keeps working unchanged and is now literally sugar that renders this part. A `Trigger` child is placed as a sibling of the portal rather than as content inside it, so triggers and content each land where they are legal.

- [#884](https://github.com/beaket/ui/pull/884) [`35d7666`](https://github.com/beaket/ui/commit/35d7666aac5061478791f34c098cb0528a41fc73) Thanks [@jihnma](https://github.com/jihnma)! - Button's `loading` falls back to the form's pending state

  React 19's `useFormStatus` is documented as a **design-system** hook: a submit button nested in a `<form>` can read the form's pending state directly, with no prop drilling and no wiring by the consumer. Until now every consumer wired `loading` by hand for the most common case there is.

  ```tsx
  <form action={save}>
    <Button type="submit">Save</Button> {/* spins and disables on its own */}
  </form>
  ```

  `loading` remains the override — supplied, it wins, including `loading={false}`. The fallback applies only to a `type="submit"` button; an ordinary button is untouched, and under `asChild` the component still injects nothing at all.

  No new registry dependency: `react-dom` ships in lockstep with `react`, and adding it to a component's `dependencies` would run `npm install react-dom` in your project.

- [#883](https://github.com/beaket/ui/pull/883) [`8510bab`](https://github.com/beaket/ui/commit/8510bab86cb1195cdcaffeeb491997d640030def) Thanks [@jihnma](https://github.com/jihnma)! - `add` warns when your React is older than a component needs

  A registry component is copied into a project whose React version we do not control, and `registry.json` declared npm dependencies but never a React floor — so a component using a 19.2-only API would land in an 18.x project and fail at runtime with no warning.

  `registry.json` now carries a top-level `"react"` floor, and a component needing more can carry its own. `add` reads the React you actually have (`node_modules/react/package.json`, falling back to the declared range read as its minimum) and says so when the floor is unmet:

  ```
  ! tabs needs React >=19.2.0 — found 18.3.1.
    The files are still copied; they may fail at runtime until React is upgraded.
  ```

  **A check, not an install.** Putting `"react"` in a component's `dependencies` would have run `npm install react` in your project — pulling React to latest as a side effect of `add button` — which is the opposite of declaring a minimum. The files are still written either way: you may be about to upgrade, and a copy-paste library has no business changing your React version. An unparseable floor, or a React version that cannot be determined, produces no warning rather than a guess.

- [#879](https://github.com/beaket/ui/pull/879) [`f5f23ce`](https://github.com/beaket/ui/commit/f5f23cea4b43644f89dd4d89a9af367a593ddace) Thanks [@jihnma](https://github.com/jihnma)! - `Pagination` is a flexible compound component: `Pagination.Previous`, `.Item`, `.Ellipsis`, `.Next`

  Pagination was one function with configuration props, a discriminated union with `never` guards, and hardcoded `<a href>`s — so the consumer's router was unusable and the page-number algorithm was entangled with rendering.

  The root now holds `page` / `totalPages` / navigation mode in context and the parts read it, each taking `asChild`:

  ```tsx
  <Pagination page={page} totalPages={10} buildPageUrl={(p) => `/page/${p}`}>
    <Pagination.Previous />
    <Pagination.Item page={1} />
    <Pagination.Ellipsis />
    <Pagination.Item page={10} asChild>
      <Link href="/page/10">10</Link>
    </Pagination.Item>
    <Pagination.Next />
  </Pagination>
  ```

  Additive: `mode="link"` / `mode="button"` keep working unchanged and are now sugar that lays the same parts out for you. `PaginationBaseProps`, `PaginationLinkProps` and `PaginationButtonProps` are exported alongside the new `PaginationItemProps` and `PaginationEllipsisProps`.

- [#880](https://github.com/beaket/ui/pull/880) [`75391da`](https://github.com/beaket/ui/commit/75391da5e225c8a463300df18bbe848573712cc9) Thanks [@jihnma](https://github.com/jihnma)! - `Alert.Title` and `Alert.Description` parts

  `Alert` took its title as a content prop — `title?: string` — which forced the props type to `Omit<…, "title">` and could only ever be extended by another content prop: `title` invites `titleIcon`, then `titleClassName`, then `renderTitle`. A `string` title also cannot be reordered, wrapped, conditionally rendered or styled.

  ```tsx
  <Alert variant="warning">
    <Alert.Title className="uppercase">
      Deploy blocked <Badge>3</Badge>
    </Alert.Title>
    <Alert.Description>Two required checks have not reported yet.</Alert.Description>
  </Alert>
  ```

  Namespacing, not context — the parts share no state, so a provider would be pure machinery. The variant icon stays on the root, where the variant lives.

  Additive: `title` keeps working as the sugar over the parts, including the variant-name default (`"Warning"`, `"Note"`, …), and bare children are still wrapped as the description. Parts must be direct children of `Alert`.

- [#876](https://github.com/beaket/ui/pull/876) [`b8015bb`](https://github.com/beaket/ui/commit/b8015bb9b006c77e8754464efe3f9f65badafc1c) Thanks [@jihnma](https://github.com/jihnma)! - `Navigation` takes a root `value`; `Navigation.Link` derives its own active state

  The consumer answered "is this the current page?" by hand on every single link. The root now holds that one answer and each link compares its own `value`:

  ```tsx
  <Navigation value={pathname}>
    <Navigation.Link href="/docs" value="/docs">
      Docs
    </Navigation.Link>
  </Navigation>
  ```

  Additive: the root's `value` is optional, an explicit `active` still overrides the derived state, and a `Navigation.Link` used with no root `value` behaves exactly as before. The context accessor deliberately does not throw when there is no provider — throwing would require more of existing callers.

- [#881](https://github.com/beaket/ui/pull/881) [`2f3064a`](https://github.com/beaket/ui/commit/2f3064aef5a574edf6005d39bf66c9847100da06) Thanks [@jihnma](https://github.com/jihnma)! - `DataTable` is a flexible compound over the TanStack instance

  `DataTableProps` exposes **20 configuration props** — among them `emptyMessage` _and_ `emptyState`; `onRowClick`, `onRowMouseEnter`, `onRowMouseLeave`; `getRowClassName`. That is the mechanical result of answering layout questions with props instead of with children, and by Ousterhout's measure it makes DataTable a shallow _logic_ component: real complexity behind a wide interface, so the consumer pays twice — once to learn it, again when the 21st need is not on the list.

  The root now builds the TanStack `table` object and hands it back; the parts read it:

  ```tsx
  <DataTable columns={columns} data={data} searchable paginated>
    {(table) => (
      <>
        <DataTable.Toolbar searchPlaceholder="Filter people…" />
        <DataTable.Table>
          <DataTable.Head />
          <DataTable.Body>
            {table.getRowModel().rows.map((row) => (
              <DataTable.Row key={row.id} row={row} className={rowClass(row)} onMouseEnter={…} />
            ))}
          </DataTable.Body>
        </DataTable.Table>
        <DataTable.Pagination />
      </>
    )}
  </DataTable>
  ```

  `emptyMessage`/`emptyState` become `DataTable.Empty`; `getRowClassName`, `onRowMouseEnter` and `onRowMouseLeave` become ordinary props on your own `<DataTable.Row>`.

  Additive: all 20 props keep working and now lay out exactly these parts, so the sugar path and the composed path render the same DOM by construction. Removing any of the 20 is a separate breaking decision.

- [#875](https://github.com/beaket/ui/pull/875) [`77ea99f`](https://github.com/beaket/ui/commit/77ea99f917876dd6024db7435c9edee1fdad6f24) Thanks [@jihnma](https://github.com/jihnma)! - `ref` now typechecks on Badge, Blockquote, Button, `Dialog.Header`/`.Footer` and `Sheet.Header`/`.Footer`

  These seven prop declarations extended `React.HTMLAttributes` / `React.ButtonHTMLAttributes`, which do not carry `ref`. React 19 moved `ref` into intrinsic element props, so `React.ComponentProps<"button">` does. Passing a `ref` to any of the seven failed to typecheck for no reason anyone intended; they now extend `React.ComponentProps<…>` like the rest of the registry.

  Widened type only — nothing that compiled before stops compiling.

- [#886](https://github.com/beaket/ui/pull/886) [`352b6f5`](https://github.com/beaket/ui/commit/352b6f52d758684fc21bdf749055e22e89f5fc6f) Thanks [@jihnma](https://github.com/jihnma)! - `Tabs.Content` takes `keepMounted`

  Radix unmounts inactive tab panels, so scroll position, uncommitted form input and any in-panel state are destroyed on every tab switch. `forceMount` was the only escape and it keeps the panel **fully live** — the opposite extreme.

  ```tsx
  <Tabs.Content value="draft" keepMounted>
    <textarea /> {/* survives a trip to another tab */}
  </Tabs.Content>
  ```

  `keepMounted` is React 19.2's `<Activity mode="hidden">`: state preserved, effects torn down, re-render deprioritized. **Off by default** — this adds a way out, it does not change what Tabs already does.

  Under `keepMounted` the panel is hidden with `data-[state=inactive]:hidden` rather than Radix's `hidden` attribute, which `forceMount` disables — so an inactive panel leaves no empty box in the layout or the accessibility tree.

  Requires React >= 19.2, which the `tabs` entry in `registry.json` now declares; `add` warns if your project is below it.

### Patch Changes

- [#875](https://github.com/beaket/ui/pull/875) [`77ea99f`](https://github.com/beaket/ui/commit/77ea99f917876dd6024db7435c9edee1fdad6f24) Thanks [@jihnma](https://github.com/jihnma)! - Avatar drops the module-level hydration guard

  `avatar.tsx` carried a `let hydrated = false` module global and a post-mount render gate to work around a React 19 SSR hydration mismatch ([#291](https://github.com/beaket/ui/issues/291)): Radix's `useIsHydrated`, built on `useSyncExternalStore`, returned `true` during client hydration, so a cached image rendered `<img>` where the server had rendered the fallback `<span>`.

  Root cause is gone upstream. `@radix-ui/react-avatar` 1.2.6 no longer uses that mechanism — the image loading status is a plain `useState("idle")`, identical on the server and on the first client render. The guard cost every Avatar a `useState`, a `useEffect`, and one blank frame before the image appeared.

  A new `SsrHydrationTest` story renders the avatar with `renderToString`, hydrates it with a warmed image cache, and asserts React recovered from no errors — so a future Radix bump that reintroduces the mismatch fails loudly instead of silently.

- [#875](https://github.com/beaket/ui/pull/875) [`77ea99f`](https://github.com/beaket/ui/commit/77ea99f917876dd6024db7435c9edee1fdad6f24) Thanks [@jihnma](https://github.com/jihnma)! - Dialog, Sheet, DropdownMenu, Table and Avatar attach their parts with one `Object.assign`

  These five files attached parts by post-hoc mutation (`Dialog.Title = DialogTitle`) while the other six compound components used a single `Object.assign`. One expression is the complete public surface, instead of a surface scattered down the file and dependent on statement order — and TypeScript's expando-function support means a typo in `Dialog.Titel = …` quietly adds a property rather than failing.

  Identical public shape. Nothing to change when re-copying.

## 2.8.0

### Minor Changes

- [#808](https://github.com/beaket/ui/pull/808) [`2e9f99a`](https://github.com/beaket/ui/commit/2e9f99a681c19a5260abd13434aa8be908da0277) Thanks [@jihnma](https://github.com/jihnma)! - Install the shared type, spacing, border, and radius foundation with semantic and palette tokens so copied components render with their intended scale and shapes.

### Patch Changes

- [#812](https://github.com/beaket/ui/pull/812) [`3d6db4d`](https://github.com/beaket/ui/commit/3d6db4d5b88da42827e23e7354637ad10149ac93) Thanks [@jihnma](https://github.com/jihnma)! - Stop generating a `$schema` URL that does not resolve in new configuration files.

- [#810](https://github.com/beaket/ui/pull/810) [`aa9c1d8`](https://github.com/beaket/ui/commit/aa9c1d8864c8420d63ed2081deaeb83b9fc85952) Thanks [@jihnma](https://github.com/jihnma)! - Handle dependency installation failures without crashing the add command.

- [#813](https://github.com/beaket/ui/pull/813) [`872eed2`](https://github.com/beaket/ui/commit/872eed2bdb4f7a5666f926873beee843b1c2541e) Thanks [@jihnma](https://github.com/jihnma)! - Detect component aliases and Tailwind CSS entry files from referenced TypeScript configs.

- [#814](https://github.com/beaket/ui/pull/814) [`73a7e07`](https://github.com/beaket/ui/commit/73a7e07c86d02545ec8af507c6513c2412844e06) Thanks [@jihnma](https://github.com/jihnma)! - Show dependency installation progress before the add command begins installing packages.

## 2.7.0

### Minor Changes

- [#774](https://github.com/beaket/ui/pull/774) [`6dce543`](https://github.com/beaket/ui/commit/6dce54336fae1e500f5edab1e0afb0b80df72d7b) Thanks [@jihnma](https://github.com/jihnma)! - Remove the non-functional `--surface-brand` and `--shadow-size-active` values from every built-in palette, reducing the authored theme contract from 32 to 30 values.

  - `--surface-brand` is removed because no semantic token or shipped component referenced it. No replacement is needed; use a semantic background role such as `--color-bg-emphasis` when styling a brand-emphasis surface.
  - `--shadow-size-active` is removed because active pressables intentionally drop their shadow and translate by 1px; all semantic shadow roles derive from `--shadow-size`.

  The dependency audit also identifies `--tone-8` through `--tone-10` as reserved rather than functional. They remain for compatibility with the public 12-step neutral ramp and future deep-ink roles; the other 27 palette values are all reachable from the semantic layer.

  Existing CSS produced by an older `init` remains valid because consumers own that CSS, but these two custom properties continue to have no effect. Run `npx @beaket/ui theme` to refresh the configured theme, or `npx @beaket/ui theme --theme <preset>` to switch presets and replace the managed block with the 30-value contract. Customized palettes can instead delete the two declarations manually.

- [#781](https://github.com/beaket/ui/pull/781) [`09d2097`](https://github.com/beaket/ui/commit/09d2097db6a7e008b739709ce6002a544fb2b269) Thanks [@jihnma](https://github.com/jihnma)! - Add a dark Solace palette that follows `prefers-color-scheme: dark`, including complete generated documentation tokens and forced-dark Storybook support.

- [#782](https://github.com/beaket/ui/pull/782) [`b509d5f`](https://github.com/beaket/ui/commit/b509d5f4263604d5accc3c65012cd38a540965ed) Thanks [@jihnma](https://github.com/jihnma)! - Define and apply a system-wide accent hierarchy so keyboard focus, open ownership, hover intent,
  selection, persistent affordance, and content navigation no longer compete at equal weight.

  - Buttons and interactive cards are neutral at rest, reveal a thin accent edge on hover, and hold a
    grown edge only while they own an open overlay. Primary emphasis now comes entirely from its ink
    surface; the secondary button returns to neutral material.
  - Checkbox, Radio, Switch, Navigation, Tabs, and Pagination drop their standing accent edges.
    Choice controls reveal action on hover, while navigation and tabs reserve accent for the selected
    lens.
  - Writing fields retain their cap-off focus edge, Select retains its open-owner edge, and menu rows
    retain their inset active rule under an explicit channel-precedence policy.
  - Add dense Storybook coverage plus native and Radix-backed interaction checks for simultaneous
    focus, open, active-row, and selection states.

### Patch Changes

- [#711](https://github.com/beaket/ui/pull/711) [`21f1cd4`](https://github.com/beaket/ui/commit/21f1cd45207d2e8cce64a7a4c59b5923be4ae089) Thanks [@renovate](https://github.com/apps/renovate)! - Migrate DataTable to the TanStack Table v9 feature and state APIs while preserving sorting,
  filtering, pagination, selection, and exported table types.

- [#780](https://github.com/beaket/ui/pull/780) [`5261301`](https://github.com/beaket/ui/commit/5261301d7e31411ef137fd3049b38b51d454c82f) Thanks [@jihnma](https://github.com/jihnma)! - Re-cut the Solace semantic signals so small text, icons, borders, tints, and solid states remain
  distinguishable under simulated protanopia, deuteranopia, and tritanopia.

  - danger: `#af5340` → `#a44735`
  - warning: `#ce8042` → `#d18b3f`
  - success: `#00896c` → `#3f8a55`
  - info: `#4c6bb6` → `#53628f`
  - info-alt: `#008597` → `#005f72`, with the knockout switched to the paper endpoint
  - accent remains `#2b5bff`

  The browser-backed audit evaluates all 15 role pairs across six semantic forms and four vision
  modes using the Machado 2009 full-severity transforms and OKLab distance floors. Storybook now
  includes a dedicated small-mark comparison and reinforces semantic status examples with readable
  labels and distinct icon shapes.

- [#778](https://github.com/beaket/ui/pull/778) [`8d971e9`](https://github.com/beaket/ui/commit/8d971e9d5152df3144ab74f96125279aa2bf36ae) Thanks [@jihnma](https://github.com/jihnma)! - Rebalance the Solace light neutral ramp into a monotonic OKLab progression while preserving its warm-paper and cool-ink endpoints.

  The source hex values produce these OKLab lightness values and adjacent differences (rounded to three decimals):

  | Tone | Before L | Before ΔL | After L | After ΔL |
  | ---- | -------: | --------: | ------: | -------: |
  | 0    |    0.963 |         — |   0.963 |        — |
  | 1    |    0.966 |    -0.003 |   0.920 |    0.043 |
  | 2    |    0.934 |     0.032 |   0.820 |    0.100 |
  | 3    |    0.838 |     0.096 |   0.730 |    0.090 |
  | 4    |    0.639 |     0.199 |   0.639 |    0.091 |
  | 5    |    0.616 |     0.023 |   0.585 |    0.054 |
  | 6    |    0.540 |     0.076 |   0.525 |    0.060 |
  | 7    |    0.455 |     0.085 |   0.455 |    0.070 |
  | 8    |    0.386 |     0.070 |   0.390 |    0.066 |
  | 9    |    0.328 |     0.058 |   0.325 |    0.064 |
  | 10   |    0.252 |     0.075 |   0.245 |    0.080 |
  | 11   |    0.128 |     0.124 |   0.128 |    0.117 |

  The automated palette contract permits 0.04–0.12 OKLab L across the full ramp and tightens the functional `tone-3` through `tone-7` steps to 0.05–0.10. This keeps the paper and deepest-ink ends flexible while preventing functional roles from collapsing or jumping abruptly.

- [#773](https://github.com/beaket/ui/pull/773) [`51041c8`](https://github.com/beaket/ui/commit/51041c8e0b7c39e051e6f72d9a5305b6b1610592) Thanks [@jihnma](https://github.com/jihnma)! - Enforce browser-resolved contrast guarantees for every built-in theme palette. Correct role
  hover/active mixtures, knockout choices, and dark neutral values exposed by the new policy.

- [#777](https://github.com/beaket/ui/pull/777) [`eea28a5`](https://github.com/beaket/ui/commit/eea28a5d9e0216f57513410ef45d85fada54d7a2) Thanks [@jihnma](https://github.com/jihnma)! - Restore visible depth between the Solace light page, raised, and overlay surfaces while preserving its restrained warm-paper character and existing contrast guarantees.

## 2.6.0

### Minor Changes

- [#683](https://github.com/beaket/ui/pull/683) [`02bd7e9`](https://github.com/beaket/ui/commit/02bd7e991d3d6ba80f4f0006987e0aad033a0d34) Thanks [@jihnma](https://github.com/jihnma)! - feat(cli): tell existing users when a component's style has moved

  Copied components don't auto-update, so a consumer on an older style had no way to know a component now differs from the registry — `add` only knew "a file is here" and asked to overwrite, learning nothing about whether their copy was actually out of sync.

  - **`diff` command** — `npx @beaket/ui diff` lists every installed component as matching the registry or differing from it; `npx @beaket/ui diff <component>` prints the line-by-line diff between your copy and the registry, then points you at `add <component> --overwrite` (or hand-merging if you've customized it). It never writes — you own the code. A difference may be an upstream restyle or your own edits; without installed-version tracking the CLI can't tell them apart, so it frames it as a difference and leaves the choice to you.
  - **Smarter `add`** — an existing file is compared against the registry: files already matching are left untouched (no prompt), and only files that differ prompt to overwrite, with wording that says your copy is out of sync rather than just that a file exists. Skipped files point at `diff` to see what changed.

## 2.5.0

### Minor Changes

- [#681](https://github.com/beaket/ui/pull/681) [`3655067`](https://github.com/beaket/ui/commit/36550678c98c8161a6428766485cfacf6f745273) Thanks [@jihnma](https://github.com/jihnma)! - Card is a surface, not a template.

  Reframed the Card around its material rather than an imposed structure. Its identity is now the drawn surface — square corners, a single-ink border, and the grey offset shade that marks a raised thing — and it imposes no header/body/footer: the root carries sensible padding and a column gap so you can pour any content straight in and it sits right. This is what pulls it away from reading like a Dialog, whose Cancel/confirm footer was the tell.

  - **`elevation` prop** (`flat` \| `shade` \| `overlay`, default `shade`) replaces the old `shadow?: boolean`. `shade` is the quiet grey offset that says "raised surface"; `overlay` lifts it onto `bg-bg-overlay` with the heavier offset; `flat` sits flush.
  - **`interactive` prop** — when the whole card is a link it earns the accent edge in place of the grey shade: thin at rest, grown on hover, dropped onto the edge when pressed. Pair with `asChild` to render a real `<a>` (the one place a surface carries the vivid voice).
  - **`Card.Section`** — an edge-to-edge helper that cancels the root padding so media and full-width rules reach the card's edges.
  - `Header` / `Title` / `Description` / `Action` / `Content` / `Footer` remain as optional, padding-free layout helpers — never the required anatomy.

  Migration: replace `<Card shadow>` with `<Card elevation="shade">` (now the default, so plain `<Card>` also lifts); a card with no shade is `<Card elevation="flat">`.

## 2.4.0

### Minor Changes

- [#635](https://github.com/beaket/ui/pull/635) [`cff40cf`](https://github.com/beaket/ui/commit/cff40cf346d23912791d3c0c0d4a4f2ae29b6120) Thanks [@jihnma](https://github.com/jihnma)! - Accent becomes the interaction voice.

  The `accent` signal — the one vivid ink each theme reserves for "what you can act on" — now actually carries interaction across the system, resolving the long-standing "two blues" (accent vs. `signal-info`) in Solace:

  - **Primary button**: the ink fill gains a 1px `accent-solid` edge, with `accent`-warmed hover/active surfaces (previously a plain `border-strong` with no hover shift).
  - **Secondary button**: now an `accent` tint (`accent-bg` + `accent-fg` + `accent-border`) that deepens its border on hover, instead of a neutral grey surface.
  - **Links & focus rings** (`--color-fg-link`, `--color-border-focus`): repointed from `signal-info` to `signal-accent`, so `signal-info` returns to meaning only "info". Solace's primary focus is now a single blue (edge + ring) rather than two.

  Two new semantic tokens back the primary hover/active states — `--color-bg-emphasis-hover` and `--color-bg-emphasis-active` (`accent`-warmed mixes of `bg-emphasis`) — bringing the semantic layer to 66 names.

  Accessibility: because `accent` is now link/focus text (which needs 4.5:1 against the page), three palette accents were re-cut to clear that floor — Marigold (light), Porcelain (dark), and Tobacco (dark). The other themes already passed.

- [#636](https://github.com/beaket/ui/pull/636) [`fede846`](https://github.com/beaket/ui/commit/fede846a1bf6d23c1b81c11d81bd11a4bb31c200) Thanks [@jihnma](https://github.com/jihnma)! - feat(theme): action shadow — a thin accent edge under what you can press

  The offset shadow splits into two voices. Surfaces (cards, overlays) keep the
  grey shade; pressables now carry the one vivid voice as a thin sharp edge.

  - New semantic tokens `--shadow-offset-action` / `--shadow-offset-action-hover`
    (68 shared names now: 62 color + 6 shadow) — drawn with `--signal-accent`
  - Button: rest = 1px accent edge → hover grows to 2px → active drops the button
    onto the edge (`translate(1px,1px)`, shadow collapses); ghost/link/disabled
    stay flat, disabled keeps its dashed border
  - Solace palette thins `--shadow-size` 2px → 1px — softness of the paper,
    sharpness of the edge

- [#647](https://github.com/beaket/ui/pull/647) [`8729283`](https://github.com/beaket/ui/commit/87292830bcec14dc48cbb14df670e7a0a01c3184) Thanks [@jihnma](https://github.com/jihnma)! - feat(breadcrumb): a quiet trail in one ink, not a switcher

  A breadcrumb is a trail — a sentence read left to right — not the lens that navigation and tabs are, so it doesn't join the fused-strip/glass-plate grammar. It stays in one ink: ancestor links now sit in muted ink (`text-fg-muted`) instead of standing accent, and the current page keeps full ink (`text-fg font-medium`). Pointing at a step darkens it from muted to full ink (`hover:text-fg`) rather than dropping the accent to ink as before, and the always-on underline is retired (`no-underline`) — the darkening is the affordance. The one accent mark is the keyboard focus ring; the vivid voice is kept for where you act, not spent on a standing row of links. No pressable edge (a link is not a key), no new tokens.

- [#649](https://github.com/beaket/ui/pull/649) [`3d36f73`](https://github.com/beaket/ui/commit/3d36f73ea0fb9054df9a1f565bbfbd099c4ebf44) Thanks [@jihnma](https://github.com/jihnma)! - feat(button): primary wears a light rim that sheds on engage

  The primary button's rest edge no longer doubles. Its border was the full accent
  (`border-accent-solid`) sitting directly over the full accent shadow — the same
  blue on both, so the two 1px lines merged into one thick 2px band on the bottom
  and right. The border now takes the lighter accent tone (`border-accent-border`),
  so at rest the light rim and the full-accent shadow read as two tones — depth,
  not a doubled line — with the strong voice living in the shadow where it grows
  and drops.

  On engage the rim sheds: `hover:border-transparent` (and `data-[state=open]`
  mirrors it) drops the rim into the ink fill so the accent consolidates into the
  one growing shadow rather than piling into a thick accent band. The border is
  added to the shared transition (`transition-[box-shadow,translate,border-color]`)
  so the rim fades with the shadow instead of snapping — which also smooths the
  hover border-color change on the other bordered variants. No new tokens; other
  variants and the rest/hover/press/held-open shadow grammar are unchanged.

- [#649](https://github.com/beaket/ui/pull/649) [`3d36f73`](https://github.com/beaket/ui/commit/3d36f73ea0fb9054df9a1f565bbfbd099c4ebf44) Thanks [@jihnma](https://github.com/jihnma)! - feat(button): remove the `mono` prop

  The `mono` prop (monospace + wide tracking for CTA-style text) had no documented
  role in the Ink & Instrument vocabulary, was demonstrated only by an orphan
  `MonoVariants` composition the docs never rendered (plus a redundant single
  story), and was a Button-only flourish. Monospace lives on where it means
  something — code badges, numeric table cells — not as a per-button toggle.

  The `mono` prop is dropped from `Button` along with its `Mono` and `MonoVariants`
  stories. Consumers who want monospace CTA text can pass `className="font-mono
tracking-wide"`. Since components are copy-paste, existing copies are unaffected.

- [#649](https://github.com/beaket/ui/pull/649) [`3d36f73`](https://github.com/beaket/ui/commit/3d36f73ea0fb9054df9a1f565bbfbd099c4ebf44) Thanks [@jihnma](https://github.com/jihnma)! - feat(button): remove the `stark` variant

  `stark` (a strong-bordered button that inverted to solid ink on hover) had no
  documented role in the Ink & Instrument vocabulary — it appeared nowhere in the
  design docs, was used only as a demo trigger in stories, and overlapped with
  `outline` (bordered neutral) and `primary` (solid ink). In a system where every
  mark is meant to be deliberate, an unarticulated variant is a cut, not a keeper.

  The `variant` union drops `"stark"`; the demo triggers that used it (dialog,
  sheet, dropdown-menu stories) move to `outline`. Since components are copy-paste,
  existing consumer copies are unaffected; new copies simply won't include it.

- [#645](https://github.com/beaket/ui/pull/645) [`fc298f9`](https://github.com/beaket/ui/commit/fc298f9a8165efd73f4985e33294763e6eddb8b1) Thanks [@jihnma](https://github.com/jihnma)! - feat(button): held-open triggers sustain the grown edge

  A Button acting as an overlay trigger (dropdown menu, popover) now holds its
  hover state while the overlay is open — the accent edge stays grown instead of
  springing back to rest. The trigger reads as the active owner of the menu it
  opened while remaining pressable: a lifted state, not a drop.

  The rule is variant-aware: `data-[state=open]:` mirrors each variant's `hover:`,
  so edge-bearing variants grow and hold their edge, and `ghost`/`link` keep their
  surface tint / underline with no edge and no press-travel. Radix sets
  `data-[state=open]` only on `asChild` triggers, so the styles are inert on
  ordinary buttons; modal (dialog/sheet) triggers sit behind the scrim, so the
  held edge is effectively visible only for non-modal triggers like DropdownMenu.

- [#645](https://github.com/beaket/ui/pull/645) [`fc298f9`](https://github.com/beaket/ui/commit/fc298f9a8165efd73f4985e33294763e6eddb8b1) Thanks [@jihnma](https://github.com/jihnma)! - feat(dropdown-menu): accent marks the highlighted row

  The highlighted/active menu row is no longer an ink stamp (full `bg-emphasis`
  slab). Instead the system's one vivid voice — the accent — marks the row you'd
  activate: a faint `accent-bg` wash plus a 2px accent left-rule (the engaged-edge
  weight, matching a hovered button's grown edge), with the ink text left at full
  density and the shortcut in `accent-fg`. Checkbox, radio, and sub-trigger rows
  adopt the same mark; the sub-trigger holds it while its submenu is open.
  Destructive rows swap accent → danger (`danger-bg` wash + danger rule).

  The menu panel and sub-menu panel now float on `shadow-offset-overlay` (the
  darker overlay shade) instead of the surface `shadow-offset` — a menu sits above
  cards, not among them.

- [#641](https://github.com/beaket/ui/pull/641) [`a13b651`](https://github.com/beaket/ui/commit/a13b65161ecfb3e736790c69d36c9f901ce5f8d6) Thanks [@jihnma](https://github.com/jihnma)! - feat(input, textarea): cap-off focus — retire the ring, the field engages the action edge

  Writing fields are quiet at rest; focusing one is "cap-off": the glowing focus ring is retired and a static accent edge (`shadow-offset-action`) appears under the field while engaged — no hover growth, no active drop, no transition. Invalid fields swap the edge to the new `--shadow-offset-action-danger` token (semantic tokens 68 → 69). The caret becomes the pen (`caret-accent-solid`) and selection uses the accent tint (`selection:bg-accent-bg`). Read-only fields gain dignity: the frame retreats to `border-border-muted` while the value stays full-ink, and focusing one shows the grey surface `shadow-offset` instead of the action edge — readable, not writable. Keyboard-nav rings on pressables (buttons, checkboxes, …) are unchanged.

- [#643](https://github.com/beaket/ui/pull/643) [`3dc0a0b`](https://github.com/beaket/ui/commit/3dc0a0b80c279a0f75ea11e701ad3cea4c208b5d) Thanks [@jihnma](https://github.com/jihnma)! - feat(navigation): the lens — navigation joins the instrument family

  Navigation was the last component on the legacy grey shadow ladder. It is now a fused hairline strip (cells share `border-border-muted` borders) carrying one static accent edge, and the current page is no longer stamped in ink — it sits under a glass lens plate: hairline top/left rim, ink bottom/right rim (ink gathers where every shadow in the system falls), filled with the faintest accent wash. The plate lies beneath the type, so the current label keeps full ink density. Pressing any other link travels its label 1px like an instrument key.

  Token changes (68 semantic names, was 69):

  - New: `--color-accent-bg-subtle` — accent-only faintest wash (8%), the lens fill
  - Removed: `--shadow-offset-hover` and `--shadow-offset-active` — the grey ladder had no users left; surfaces keep `shadow-offset`/`-overlay`, pressables keep the action edge

  Vertical layouts swap the fusion axis: `flex-col [&>li+li]:ml-0 [&>li+li]:-mt-px` on `Navigation.List`.

- [#637](https://github.com/beaket/ui/pull/637) [`e86c410`](https://github.com/beaket/ui/commit/e86c4104b6b0758c064942332315aac899526188) Thanks [@jihnma](https://github.com/jihnma)! - feat(pagination): one instrument — fused strip with a single accent edge

  Pagination adopts the action shadow, but as one machine rather than a row of
  buttons: cells fuse into a single strip (shared borders, no gaps) carrying one
  static 1px accent edge.

  - Strip: new `pagination-strip` slot wraps all cells with `shadow-offset-action`
  - Press: the chassis stays still — the pressed key's label travels 1px inside
    the frame while the cell darkens (`active:bg-bg-active`)
  - Current page: an ink-solid cell whose label stays held down 1px — the key
    locked at its landing point
  - Ellipsis becomes a bordered blank key; focus outline lifts above neighboring
    cell borders

- [#658](https://github.com/beaket/ui/pull/658) [`5b20afc`](https://github.com/beaket/ui/commit/5b20afc02043b2ce663bd3ca561f7faf64da1313) Thanks [@jihnma](https://github.com/jihnma)! - Select trigger becomes a field that opens.

  The select trigger is surfaced like a form field (input's paper, input's border) but [#646](https://github.com/beaket/ui/issues/646) gave it the full Button edge grammar — a standing accent edge, a hover that grows — so in a real form it was the one control that behaved like a button. But the dropdown "trigger" is loud at rest only because it's literally a `<Button>`; that rest-edge is Button-incidental, not trigger-essential.

  Select now stays **quiet at rest** among its field neighbors (no standing edge, no hover growth) and lifts the grown edge **only while its menu is open** — keeping the trigger-essence (`data-[state=open]:shadow-offset-action-hover`) and the keyboard focus ring. It's the one pressable that carries a ring but no rest edge. Invalid and disabled are unchanged; the resting form now reads as one quiet material.

- [#646](https://github.com/beaket/ui/pull/646) [`4fee10c`](https://github.com/beaket/ui/commit/4fee10c8ab74aaa17cab7f5fd5268dc7862d11c0) Thanks [@jihnma](https://github.com/jihnma)! - feat(select): held-open trigger + accent marks the highlighted row

  The Select trigger is the first form control that is also an overlay trigger — press it and a menu opens, exactly like a Dropdown. It now takes the same held-open pressable grammar as a Button rather than a writing field's cap-off: a thin accent edge (`shadow-offset-action`) at rest, grown on hover (`shadow-offset-action-hover`), held grown while the menu is open (`data-[state=open]:` — which Radix sets natively on `SelectPrimitive.Trigger`), dropped onto the edge on press (`active:` translate), and gone when disabled (`disabled:shadow-none`). Keyboard focus keeps the ring; invalid recolors the border and ring to danger while the pressable edge stays accent — role-agnostic, exactly as on a destructive Button. No new tokens.

  Select's own menu joins the system too: highlighted rows drop the ink stamp (`bg-emphasis` slab) for the accent mark introduced on DropdownMenu in [#645](https://github.com/beaket/ui/issues/645) — an `accent-bg` wash + a 2px accent left-rule (`data-[highlighted]:shadow-[inset_2px_0_0_0_var(--color-accent-solid)]`), ink text left at full density. The list panel now floats on `shadow-offset-overlay` (the darker overlay shade) instead of the surface `shadow-offset`.

- [#638](https://github.com/beaket/ui/pull/638) [`372c55f`](https://github.com/beaket/ui/commit/372c55fa814d1cb62efa7d68617fa737d85d3bf4) Thanks [@jihnma](https://github.com/jihnma)! - feat(checkbox, switch, radio): instrument grammar — static accent edge on small controls

  Small controls adopt the action shadow as instruments: the chassis floats on a
  static 1px accent edge (`shadow-offset-action`, no hover growth, no drop), and
  press physics belong to the inner key instead — the checkbox indicator and the
  switch thumb travel 1px under the press. Hover feedback is a surface tint
  (`bg-bg-hover` unchecked, `bg-bg-emphasis-hover` checked); a checked radio gets
  no press affordance since it cannot be unchecked. Disabled removes the edge.

  Switch checked also moves from `bg-success-solid` to ink (`bg-bg-emphasis`),
  matching checkbox/radio — state is carried by thumb position + ink, and the
  success role returns to meaning outcomes, not "on".

- [#630](https://github.com/beaket/ui/pull/630) [`fce6614`](https://github.com/beaket/ui/commit/fce66142abfe1c110732777ab9de40f4d0b925c0) Thanks [@jihnma](https://github.com/jihnma)! - New two-layer color token system + Solace theme.

  - **Semantic layer** (`themes/semantic.css`, new): the 64 names components use — `--color-bg/-raised/-overlay/-input/-hover/-active/-disabled/-emphasis`, `--color-fg/-muted/-subtle/-disabled/-on-emphasis/-link`, `--color-border/-muted/-strong/-focus`, six roles (`danger`, `success`, `warning`, `info`, `info-alt`, `accent`) × seven slots (`-solid`, `-fg-on-solid`, `-solid-hover`, `-solid-active`, `-fg`, `-bg`, `-border`), and `--shadow-offset/-hover/-active/-overlay`. Authored once, shared verbatim by every theme.
  - **Palette layer**: each theme now authors only 32 values — `--surface-0..2`, `--surface-brand`, `--tone-0..11`, six `--signal-*` inks, six `--signal-*-on` knockouts, and shadow size/color. Porcelain, Tobacco, Marigold, and Eucalyptus are re-cut to the new contract (signal hue/chroma kept; lightness moved only as far as the 4.5:1 knockout and 3:1 page floors require).
  - **New theme: Solace** (light-only, now the default) — warm paper, cool ink, equal-weight signals, one vivid blue reserved for action.
  - All components migrated to the semantic names; the old material names (`paper`, `ink`, `chrome`, `steel`, `frost`, `branch`, `signal-*`, `surface-N`, `shadow-offset-dark`) are removed. The new `--color-{role}-fg-on-solid` knockouts close the amber-on-button legibility gap.
  - `init`/`theme` now inject `semantic.css` + the chosen palette together; `--theme solace` supported and default.
  - The `prefers-contrast: more` override was removed: `--color-fg` is now the ramp's deepest ink, so maximum-contrast text is the default.

  Migration for consumers who customized tokens: re-run `npx @beaket/ui theme` to re-inject, then re-apply customizations against the 32 palette values (the semantic layer follows automatically). Class mapping highlights: `bg-paper`→`bg-bg`/`bg-bg-raised`/`bg-bg-overlay`/`bg-bg-input` by surface role, `text-ink`→`text-fg`, `text-steel`→`text-fg-muted`, `border-chrome`→`border-border`, `bg-branch`/`bg-ink`→`bg-bg-emphasis` (+`text-fg-on-emphasis`), `outline-signal-blue`→`outline-border-focus`, `bg-signal-red`→`bg-danger-solid` (+`text-danger-fg-on-solid`), `shadow-offset-dark`→`shadow-offset-overlay`.

- [#644](https://github.com/beaket/ui/pull/644) [`6adaf80`](https://github.com/beaket/ui/commit/6adaf80ecc65c37bf2eb0c1caae1bf2317660198) Thanks [@jihnma](https://github.com/jihnma)! - feat(tabs): the lens — tabs join the navigation layer's glass

  The tray retires. Tabs.List is now a fused hairline strip under one static accent edge (`shadow-offset-action`), and the selected tab sits under a glass lens plate instead of an ink stamp — hairline top/left rim, ink bottom/right rim, the faintest accent wash, plate beneath the type so the label keeps full ink density. Hover is a quiet surface tint; the switch itself is snappy (Radix activates a tab on press, so selecting it is instant by design). The unused `shadow` prop on Tabs.List is removed.

- [#650](https://github.com/beaket/ui/pull/650) [`49dfdcb`](https://github.com/beaket/ui/commit/49dfdcba2b9b59d85336a0f1bc3c6fcfd5f75db6) Thanks [@jihnma](https://github.com/jihnma)! - Each theme's accent gets its own taste — no longer five shades of the same purple.

  The `accent` is a theme's one vivid voice: it carries the secondary tint, links, focus ring, pressable edge, nav lens, and menu rule. Yet four of five palettes shipped the same default purple `--signal-accent`, so every theme but Solace read identically in its most characteristic moment. Each theme now answers in a hue drawn from its own world — light and dark both re-cut:

  - **Porcelain** → cobalt, the blue-and-white of 청화백자: `#1e40af` / `#7fa0f0`.
  - **Tobacco** → a warm taupe from its cigar-box world, in place of purple: `#6c5240` / `#bda488`.
  - **Eucalyptus** → a teal-blue — the trust of blue, kept a leaf's-width green so it stays clear of the pure-blue themes and its own cyan `info-alt`: `#175a84` / `#4fb0d6`.
  - **Solace** (electric blue) and **Marigold** (violet) are unchanged — Marigold is now the family's _one_ violet, not one of four.

  Accessibility: because `accent` is link/focus text (`--color-fg-link`), which needs 4.5:1 against the page, every new value was gated against its theme's `tone-0` in both light and dark before selection. A pale celadon and Marigold's namesake gold were both rejected for failing that floor on light paper. Regenerated `docs/src/data/theme-tokens.json` and `docs/public/theme-init.js`.

### Patch Changes

- [#649](https://github.com/beaket/ui/pull/649) [`3d36f73`](https://github.com/beaket/ui/commit/3d36f73ea0fb9054df9a1f565bbfbd099c4ebf44) Thanks [@jihnma](https://github.com/jihnma)! - fix(button): ghost and link no longer leak the accent edge

  Ghost and link were meant to have no accent edge, but the base applied
  `shadow-offset-action` to every variant and their `shadow-none` override never
  won — twMerge can't dedupe a custom shadow utility against `shadow-none`, so both
  classes survived and the custom edge won the cascade. Ghost showed a blue 1px
  edge at rest (and grew it on hover); link wore a button edge instead of reading
  as a link.

  The accent edge now lives on the variants that carry it (via a shared `edge`
  string appended to primary/destructive/outline/secondary/success/stark/warning)
  rather than on the base, so ghost and link simply omit it — kept out, not
  overridden. Ghost is now fully quiet (ink text, grey hover fill, no edge); link
  reads as a link (accent text, hover underline, no edge). Edged variants are
  unchanged. No token or palette change.

- [#649](https://github.com/beaket/ui/pull/649) [`3d36f73`](https://github.com/beaket/ui/commit/3d36f73ea0fb9054df9a1f565bbfbd099c4ebf44) Thanks [@jihnma](https://github.com/jihnma)! - fix(button): outline hovers on the accent edge, not a grey fill

  The outline button was airy at rest but filled with a grey wash on hover
  (`hover:bg-bg-hover`) on top of its accent edge growing — two signals at once,
  and the fill read as muddy against the paper. Outline now drops the grey fill on
  hover and held-open and leans on the accent edge it already grows (from the base
  grammar); the press keeps a faint grey settle (`active:bg-bg-active`) to confirm
  the drop. Ghost is unchanged: with no edge, its grey fill is its only hover
  signal. No token or palette change — `bg-hover` is a shared, already-light token;
  this was a grammar fix, not a color one.

- [#613](https://github.com/beaket/ui/pull/613) [`3287d19`](https://github.com/beaket/ui/commit/3287d19d6197c71db538353ddcad351028c3fda2) Thanks [@jihnma](https://github.com/jihnma)! - fix(cli): add a 10s timeout to registry fetches and preserve the original error

  `fetchRegistry` and `fetchComponent` called `fetch()` with no `AbortController`, so a slow or
  unreachable GitHub raw CDN hung the CLI until the OS-level TCP timeout fired (potentially minutes).
  Both catch blocks also discarded the underlying error, collapsing ENOTFOUND / ECONNREFUSED / proxy
  failures into the generic "Make sure the repository is public." message.

  Each request now aborts after 10s and the thrown message includes the real cause (or
  "request timed out after 10s" when the timeout fires), so `npx @beaket/ui add button` against a
  degraded network fails fast with an actionable reason.

- [#656](https://github.com/beaket/ui/pull/656) [`a98d75b`](https://github.com/beaket/ui/commit/a98d75b9bb81c7567c4a84cc84762822a3f027bf) Thanks [@jihnma](https://github.com/jihnma)! - Switch now renders an invalid state.

  Switch was the only form control with no `aria-invalid` styling — a required switch marked invalid (e.g. an unaccepted terms toggle) showed no visual change, while its instrument siblings Checkbox and Radio both recolor. It now follows the same instrument grammar: `aria-invalid` recolors the border and focus ring to danger while the accent edge stays (role-agnostic, exactly as on Checkbox/Radio and the Select trigger).

- [#659](https://github.com/beaket/ui/pull/659) [`d4cfb2c`](https://github.com/beaket/ui/commit/d4cfb2c77f0fe5c194f102923fb4da24ee7b146f) Thanks [@jihnma](https://github.com/jihnma)! - Switch off-state now responds to hover.

  The switch was the one instrument with no hover feedback when off — its checked track warms on hover and its siblings Checkbox and Radio tint their surface, but the off-channel sat inert. It now darkens one token step on hover (`border-muted` → `border`), completing the instrument grammar: hover tints the surface, press travels the key (the switch already travels its thumb, so no active tint is added).

## 2.3.1

### Patch Changes

- [#409](https://github.com/beaket/ui/pull/409) [`785955d`](https://github.com/beaket/ui/commit/785955d7f043bd64125bbddd9dd73794f65417d7) Thanks [@jihnma](https://github.com/jihnma)! - Align `Input` props type with the rest of the library: extends `React.ComponentProps<"input">` instead of `React.InputHTMLAttributes<HTMLInputElement>`, matching `Textarea`. Removes redundant `className` and `ref` declarations (already inherited). No runtime behavior change. Closes [#333](https://github.com/beaket/ui/issues/333).

## 2.3.0

### Minor Changes

- [#339](https://github.com/beaket/ui/pull/339) [`28ca093`](https://github.com/beaket/ui/commit/28ca093639c978ea207bc994a7a566cfb7e718f6) Thanks [@jihnma](https://github.com/jihnma)! - Re-tune prose body text color across all four themes to eliminate long-reading eye fatigue while preserving brutalist identity.

  **Problem.** `graphite` on `frost`/`paper` was running at ~18–20.4:1 contrast — above the research-backed 10–15:1 sweet spot (Bauer & Cavonius, Lin & Huang) and higher than every major design system (Apple 16.7:1, GitHub 15.5:1, Linear 16.2:1, Notion 10.6:1, Medium 14:1). Excess contrast induces halation and is especially punishing on dense Japanese kanji strokes. `graphite` and `ink` were also nearly identical (ΔE<1) so the two tokens had collapsed semantically.

  **Changes per theme (light / dark):**
  - **Porcelain**: graphite `#030508 → #1e2229` / `#e6eaee → #c4cad4`; ink `#080b10 → #0a0d14` / `#dce0e6 → #e6eaee`; iron `#282b2f → #15191f` / `#b4bcc6 → #aab2bd`; dark paper `#06080c → #0d1117` (reduces dark-mode halation + re-adaptation fatigue).
  - **Eucalyptus**: graphite `#0a1025 → #1e2638` / `#e8ecf4 → #c6cdde`; ink `[#162036](https://github.com/beaket/ui/issues/162036) → #0e1628` / `#dce2ec → #e8ecf4`; iron `[#243250](https://github.com/beaket/ui/issues/243250) → #151d30` / `#b0bace → #a6aec4`; dark paper `#060a14 → #0e1320`.
  - **Marigold**: graphite `#0a0a0a → #1f1f1f` / `#f5f5f5 → #d8d8d8`; ink `[#121212](https://github.com/beaket/ui/issues/121212) → #0a0a0a` / `#ececec → #f5f5f5`; iron `[#262626](https://github.com/beaket/ui/issues/262626) → [#141414](https://github.com/beaket/ui/issues/141414)` / `#d0d0d0 → #c0c0c0`; dark paper `#0a0a0a → [#101010](https://github.com/beaket/ui/issues/101010)` (conservative — preserves neon identity). Shadow references rebound (`--shadow-offset` now uses `iron`; `-dark` variant uses `ink`) to keep the "ink-black heavy shadow" semantic intact after the ink/graphite value swap.
  - **Tobacco**: graphite `[#111110](https://github.com/beaket/ui/issues/111110) → #26231e` / `#eceae0 → #cfcabc`; ink `#1a1a18 → #14130f` / `#e2e0d6 → #eceae0`; iron `#312f2c → #1c1a16` / `#c0bcb2 → #b4b0a6`; dark paper `#0c0b0a → #14130f`.

  **Token semantics clarified (via values, not rename):**
  - `graphite` = prose body (tuned for sustained reading, 13–14:1 light, ~12:1 dark).
  - `ink` = UI primary / strong interactive (kept punchy — buttons, `bg-ink` tooltips, strong borders).
  - `iron` = structural dark accent / shadow (moved below graphite on the dark axis to preserve scale distance now that graphite has softened).

  **Other:**
  - `--color-border-strong` rebound from `graphite` to `ink` so softening prose text does not weaken the brutalist border language.
  - New `@media (prefers-contrast: more)` block in `styles.css` restores the original near-black `graphite` for users who request maximum contrast at the OS level (accessibility escape hatch).

- [#338](https://github.com/beaket/ui/pull/338) [`15835aa`](https://github.com/beaket/ui/commit/15835aaa4d509c986f1639872ae17c4cfaef0843) Thanks [@jihnma](https://github.com/jihnma)! - Add `resizable` prop to `Textarea` so it can auto-grow with content while also letting the user drag the handle to make it taller. The manually dragged height becomes a floor — content can still push it larger but won't shrink it below the user's chosen size. Closes [#332](https://github.com/beaket/ui/issues/332).

### Patch Changes

- [#335](https://github.com/beaket/ui/pull/335) [`618f25b`](https://github.com/beaket/ui/commit/618f25b6c547e8cd98affd18aa1d0a212a0fe9dd) Thanks [@jihnma](https://github.com/jihnma)! - Fix CSS token duplication between `src/css-variables.css` and `src/themes/porcelain.css`. The two files had drifted out of sync (different hex values for `graphite`, `ink`, `signal-blue`, `signal-green`, surface layers) and `css-variables.css` lacked the dark-mode block. Removed `src/css-variables.css` and made `src/themes/porcelain.css` the single source of truth — `src/styles.css` now imports it directly.

## 2.2.0

### Minor Changes

- [#307](https://github.com/beaket/ui/pull/307) [`2603a9c`](https://github.com/beaket/ui/commit/2603a9c32d1a91b0909cb9c85a3f256817e28b69) Thanks [@jihnma](https://github.com/jihnma)! - Add ref prop support to Input component for direct DOM access (e.g. focus management)

- [#309](https://github.com/beaket/ui/pull/309) [`4d95dec`](https://github.com/beaket/ui/commit/4d95dec0b762e4bc086f40d873dd95833834b7b4) Thanks [@jihnma](https://github.com/jihnma)! - Add theme token sync to CLI. Running `npx @beaket/ui add -o` now also updates outdated CSS design tokens. New `npx @beaket/ui theme` command for standalone theme sync and switching.

## 2.1.2

### Patch Changes

- [#294](https://github.com/beaket/ui/pull/294) [`46aa6ec`](https://github.com/beaket/ui/commit/46aa6ec4315b101dff63c97b9403a06751930a81) Thanks [@jihnma](https://github.com/jihnma)! - fix: Avatar.Image hydration mismatch in React 19 SSR

  Added hydration guard to `Avatar.Image` that defers rendering until after mount. This prevents React hydration error [#418](https://github.com/beaket/ui/issues/418) caused by `@radix-ui/react-use-is-hydrated` returning `true` during client hydration in React 19, which made cached images render `<img>` while the server rendered `<span>` (fallback).

- [#296](https://github.com/beaket/ui/pull/296) [`7cc8d36`](https://github.com/beaket/ui/commit/7cc8d369368b4e944798b1ef7b8cac91709bb4e9) Thanks [@jihnma](https://github.com/jihnma)! - fix(porcelain): adjust warning (signal-amber) color from brownish #d88810 to orange-yellow #e09800 for better visual distinction

## 2.1.1

### Patch Changes

- [#287](https://github.com/beaket/ui/pull/287) [`5c50154`](https://github.com/beaket/ui/commit/5c5015472b029b31b64aa31ff8aca5350845f628) Thanks [@jihnma](https://github.com/jihnma)! - Brighten porcelain warning color from olive-toned #b58a00 to warm vintage amber #d89018. Add signal-amber-text token across all themes for accessible text/icon usage on light surfaces.

## 2.1.0

### Minor Changes

- [#257](https://github.com/beaket/ui/pull/257) [`09debe5`](https://github.com/beaket/ui/commit/09debe548d70e6b454b69d5ffb7b4efd7215b673) Thanks [@jihnma](https://github.com/jihnma)! - Add dark mode variants for all themes (Porcelain, Tobacco, Marigold, Eucalyptus) with automatic OS detection via prefers-color-scheme and manual light/dark toggle in docs

- [#260](https://github.com/beaket/ui/pull/260) [`2a240ce`](https://github.com/beaket/ui/commit/2a240ce68b56dfa88a7540ce6c235f5d1a155af0) Thanks [@jihnma](https://github.com/jihnma)! - Add button mode to Pagination component and refactor DataTable to use it

  Pagination now supports `mode="button"` with an `onPageChange` callback for client-side pagination, in addition to the existing `mode="link"` (default) with `buildPageUrl` for SSR-friendly navigation.

  DataTable's inline pagination has been replaced with the shared Pagination component, gaining ellipsis support for large page counts and ensuring visual consistency.

- [#236](https://github.com/beaket/ui/pull/236) [`fa45480`](https://github.com/beaket/ui/commit/fa45480fab5ada0d3b6dd3fbb2b31c7e684ed5c2) Thanks [@jihnma](https://github.com/jihnma)! - Remove 5 composed components in favor of primitive-first philosophy

  Removed: ConfirmationDialog, ErrorPage, SidebarLayout, BlankSlate, PageHeader

  These components were fixed-layout compositions of existing primitives (Dialog, Button, Alert, etc.) that restricted user freedom. Users should compose their own layouts using the primitive components directly.

- [#256](https://github.com/beaket/ui/pull/256) [`98083c3`](https://github.com/beaket/ui/commit/98083c33a888bf6ae38e09eb12044e308c88c7ba) Thanks [@jihnma](https://github.com/jihnma)! - Redesign signal colors across all themes for distinct personalities. Default green shifted from teal (167°) to emerald (150°) for clearer success recognition. Tobacco signals now use earthy pigments (indigo ink, brick, forest, ochre, plum, verdigris). Marigold pushed to max saturation with WCAG green fix (2.1:1 → ~5:1). Eucalyptus moved from Tailwind defaults to formal cobalt/crimson/jade/brass palette.

- [#249](https://github.com/beaket/ui/pull/249) [`168128d`](https://github.com/beaket/ui/commit/168128dae03e6dd97f286366f4440906a5c8126a) Thanks [@jihnma](https://github.com/jihnma)! - Add surface layer tokens (`surface-0`, `surface-1`, `surface-2`) for visual depth between page, cards, and elevated elements. Surface containers (Card, Dialog, Sheet, Alert, Table) use `bg-surface-1`; floating overlays (DropdownMenu, Select popup) use `bg-surface-2`.

- [#255](https://github.com/beaket/ui/pull/255) [`7e14e13`](https://github.com/beaket/ui/commit/7e14e13f321d3f5f80e3afbf15b7097fa3148893) Thanks [@jihnma](https://github.com/jihnma)! - Add four themes: Porcelain (cold precision, teal accent), Tobacco (warm pampas cream, terracotta), Marigold (loud poster-print signals, ink-black shadows), Eucalyptus (enterprise titanium blue-gray). Each transforms neutrals, signal colors, and shadow geometry. New `--theme` CLI flag. Interactive demo at `/themes`.

### Patch Changes

- [#239](https://github.com/beaket/ui/pull/239) [`7b6b49f`](https://github.com/beaket/ui/commit/7b6b49f92d517e03944a89346f9c0abe32a68e5b) Thanks [@jihnma](https://github.com/jihnma)! - Fix accessibility and consistency issues across 14 components
  - DataTable: add keyboard support (Enter/Space) on clickable rows, optimize selection useEffect
  - Button: add data-slot and default type="button"
  - Alert: remove line-clamp-1 from title
  - NavigationProgress: add aria-valuetext
  - Sheet: add hideCloseButton prop for Dialog API parity
  - Input, Textarea, Select: normalize focus indicators to focus-visible:outline
  - Radio: align border weight with Checkbox (border-graphite)
  - Tooltip: remove shadow-offset from dark surface
  - Blockquote: use border-l-2 to match border-width-medium token
  - Checkbox, Radio, Switch, Dialog/Sheet close: expand touch targets to 44px
  - Select: add disabled:border-chrome to match other form controls

- [#252](https://github.com/beaket/ui/pull/252) [`9d4f3e0`](https://github.com/beaket/ui/commit/9d4f3e0acc06c35834b8f267175973dffb70a555) Thanks [@jihnma](https://github.com/jihnma)! - fix: add missing `shadow` prop to Avatar for API consistency with Card and Table

- [#250](https://github.com/beaket/ui/pull/250) [`e9c59f6`](https://github.com/beaket/ui/commit/e9c59f66e7843414ba47e8c73e8d643137f0995b) Thanks [@jihnma](https://github.com/jihnma)! - fix: add missing `gap-2` to `Card.Footer` so children are spaced correctly

- [#266](https://github.com/beaket/ui/pull/266) [`04be083`](https://github.com/beaket/ui/commit/04be08310d8825dd5c9bdccfbde5a7e9b37d7825) Thanks [@jihnma](https://github.com/jihnma)! - Improve component prop documentation: extract compound component props (Card, Navigation, Tabs, Select, DropdownMenu), show enum literal values instead of "enum", filter className noise, fix ReactNode types showing as "any", and add inline option listings to JSDoc comments

- [#269](https://github.com/beaket/ui/pull/269) [`8d8c31c`](https://github.com/beaket/ui/commit/8d8c31cb7f19267b46fffefa7ed83aa99562fa21) Thanks [@jihnma](https://github.com/jihnma)! - Fix accessibility issues in DataTable, Pagination, and Input components

- [#240](https://github.com/beaket/ui/pull/240) [`5beb672`](https://github.com/beaket/ui/commit/5beb6723f57e892169e8b0c85b869c7c9f3d51d7) Thanks [@jihnma](https://github.com/jihnma)! - Add focus-visible indicator to DataTable clickable rows for keyboard navigation

- [#264](https://github.com/beaket/ui/pull/264) [`7add468`](https://github.com/beaket/ui/commit/7add46849d67ac6732e55c0a0bbd3a5444558c92) Thanks [@jihnma](https://github.com/jihnma)! - fix: resolve React 19 ref collision in Textarea and stabilize effect dependencies in DataTable, Dialog, Sheet

- [#253](https://github.com/beaket/ui/pull/253) [`cd1de9a`](https://github.com/beaket/ui/commit/cd1de9ae3249acdb5fa9316017ab70ffc5cef07f) Thanks [@jihnma](https://github.com/jihnma)! - fix: increase Switch `sm` size from 12×28px to 16×32px for better visibility

- [#251](https://github.com/beaket/ui/pull/251) [`5d86371`](https://github.com/beaket/ui/commit/5d863718e7c840bec18be32f2f79b046e2a559c4) Thanks [@jihnma](https://github.com/jihnma)! - fix: increase default Table cell padding from px-1.5 py-1 to px-4 py-2/py-2.5 for better readability

## 2.0.0

### Major Changes

- [#230](https://github.com/beaket/ui/pull/230) [`5dda5cf`](https://github.com/beaket/ui/commit/5dda5cf106ac8982dafd1d633209949d46e1a5e8) Thanks [@jihnma](https://github.com/jihnma)! - BREAKING: Migrate CSS variables to Tailwind v4 `@theme` convention with `--color-*` prefix
  - CSS tokens moved from `:root` to `@theme` block with `--color-*` prefix
  - Components now use clean Tailwind utilities (`bg-paper` instead of `bg-[var(--paper)]`)
  - Unified color token values with Beaket app (chrome, platinum, signal-blue)
  - Added `--color-muted` ([#737373](https://github.com/beaket/ui/issues/737373)) for WCAG AA-compliant muted text (replaces aluminum for text)
  - Added `--color-signal-red-text` (#b91c1c) for accessible red text on light backgrounds
  - Accessibility improvements across all components:
    - BlankSlate: decorative icons marked `aria-hidden`
    - Navigation: default `aria-label` on nav landmark
    - Button: spinner wrapped with `aria-live="polite"`
    - Switch: disabled state uses border-dashed pattern instead of opacity
    - DataTable: search input has `aria-label`
    - Checkbox: indeterminate state with Minus icon and ARIA support

### Minor Changes

- [#232](https://github.com/beaket/ui/pull/232) [`18ebbb6`](https://github.com/beaket/ui/commit/18ebbb6fa1ab7278192f6bb40a8cd5aa4c6770ca) Thanks [@jihnma](https://github.com/jihnma)! - Add 7 new components extracted from Beaket app
  - **Skeleton**: Loading placeholder with pulse animation
  - **ViewToggle**: Generic toggle button group for switching between views
  - **NavigationProgress**: Indeterminate progress bar for page navigation
  - **PageHeader**: Page header with title, count, and action slot
  - **ErrorPage**: Full-page error display with code, message, and action
  - **SidebarLayout**: Responsive layout with content and sidebar slots
  - **ConfirmationDialog**: Pre-built confirmation dialog with warning and loading state

### Patch Changes

- [#233](https://github.com/beaket/ui/pull/233) [`c71d810`](https://github.com/beaket/ui/commit/c71d810f75b41133f47e530d7e4f840cac9fd6cc) Thanks [@jihnma](https://github.com/jihnma)! - Fix accessibility and UX issues across 9 components
  - DataTable: add `aria-sort` on sortable headers and `scope="col"` for screen reader table navigation
  - ViewToggle: make `label` required for icon-only buttons (a11y)
  - Skeleton: add `role="status"` and `aria-label` for screen readers
  - Select: fix focus ring to use `focus-visible:` consistently
  - Badge: add missing `data-slot="badge"`
  - Avatar: add dev warning when `alt` prop is missing on Avatar.Image
  - Radio: fix broken disabled indicator dot color using `group-disabled` pattern
  - Navigation: add `transition-shadow`, `active:shadow-offset-active`, suppress shadow/hover when active
  - Switch: fix disabled+checked state showing green, improve thumb contrast when disabled

## 1.9.1

### Patch Changes

- [#194](https://github.com/beaket/ui/pull/194) [`8c73b0b`](https://github.com/beaket/ui/commit/8c73b0be3977873eada02c39c0891a66421e5436) Thanks [@jihnma](https://github.com/jihnma)! - Improve focus visibility for Switch and Tabs components by using outline-based focus indicators instead of subtle border color changes

- [#192](https://github.com/beaket/ui/pull/192) [`6c2e1cd`](https://github.com/beaket/ui/commit/6c2e1cdff06baf9ff972c61cb7cbed6c0897573a) Thanks [@jihnma](https://github.com/jihnma)! - Replace hardcoded `white` with palette tokens in Input, Table, and Badge components

## 1.9.0

### Minor Changes

- [#113](https://github.com/beaket/ui/pull/113) [`4e8f921`](https://github.com/beaket/ui/commit/4e8f92132854c5dfd5814dd64ccf33086e3adf63) Thanks [@jihnma](https://github.com/jihnma)! - Add support for installing multiple components at once: `npx @beaket/ui add alert button label`

- [#109](https://github.com/beaket/ui/pull/109) [`028aa68`](https://github.com/beaket/ui/commit/028aa68803bbda585ff75c91253da96b0fe07ba4) Thanks [@jihnma](https://github.com/jihnma)! - ### Breaking Changes
  - **Table**: Migrated to compound component pattern
    - Before: `import { Table, TableBody, TableCell, ... } from "@beaket/ui"`
    - After: `import { Table } from "@beaket/ui"` and use `Table.Body`, `Table.Cell`, etc.

  ### New Features
  - **Input**: Added `prefix` and `suffix` props for icon support
  - **Sheet**: Added `fullScreen` prop for full-width mobile navigation
  - **Button**: Hover/active states now use CSS variables for easier customization
    - Added `--signal-green-hover`, `--signal-green-active`
    - Added `--signal-red-hover`, `--signal-red-active`
    - Added `--signal-amber-hover`, `--signal-amber-active`

### Patch Changes

- [#111](https://github.com/beaket/ui/pull/111) [`df61ccd`](https://github.com/beaket/ui/commit/df61ccdd5daf2b930eecec26033b627c08daebb9) Thanks [@jihnma](https://github.com/jihnma)! - Refactor CSS variables to use single source of truth
  - Extract core CSS variables to `src/css-variables.css`
  - CLI now imports from generated file instead of hardcoding
  - Add `pnpm sync:css` script to sync variables to CLI

## 1.8.0

### Minor Changes

- [`6460127`](https://github.com/beaket/ui/commit/6460127): Add -y flag to init command for non-interactive mode

### Patch Changes

- [`dca002d`](https://github.com/beaket/ui/commit/dca002d): Fix bun detection to use bun.lock instead of bun.lockb

## 1.7.0

### Minor Changes

- [`ed42b5d`](https://github.com/beaket/ui/commit/ed42b5d): Improve Switch and Textarea components

  Switch:
  - Flatter, more horizontal proportions (reduced height by ~40%)
  - Uniform 2px padding on all sides
  - Corrected thumb translate values for symmetric left/right states

  Textarea:
  - Add `autoResize` prop (default: true) for automatic height adjustment based on content
  - Unify focus styling with Input component (ring-2 instead of border-only)

## 1.6.0

### Minor Changes

- [`1b61c60`](https://github.com/beaket/ui/commit/1b61c60): Auto-detect component path based on tsconfig alias configuration

### Patch Changes

- [`6ffa8c6`](https://github.com/beaket/ui/commit/6ffa8c6): Fix CLI init to include @theme block with shadow utilities for Tailwind CSS 4

## 1.5.1

### Patch Changes

- [`1d6083e`](https://github.com/beaket/ui/commit/1d6083e): Fix consistent form control borders and navigation active text
  - Standardize border color to --graphite for Checkbox, Select, Textarea
  - Remove meaningless hover border changes
  - Add text-inverse utility for navigation active state
  - Fix docs global styles conflicting with component styles

## 1.5.0

### Minor Changes

- [`2fa9067`](https://github.com/beaket/ui/commit/2fa9067): Add offset shadow system and new component variants
  - Button: Add offset shadow states, warning variant, mono prop
  - Badge: Add warning and code variants
  - Table: Add shadow prop, TableSectionHeader component
  - Card, Tabs: Add optional shadow prop
  - Dialog, Sheet, Dropdown, Tooltip: Add offset shadows

- [`df80cc1`](https://github.com/beaket/ui/commit/df80cc1): Add Blockquote, Breadcrumb, and Navigation components
  - Blockquote: Styled quotation with author attribution support
  - Breadcrumb: Compound component for navigation hierarchy
  - Navigation: Primary site navigation with offset shadow styling

## 1.4.0

### Minor Changes

- [`1b26167`](https://github.com/beaket/ui/commit/1b26167): Add Avatar component for displaying user profile images with fallback support
- [`69a50f4`](https://github.com/beaket/ui/commit/69a50f4): Add form components: Label, Textarea, Select, and Switch
  - Label: Form label with accessibility support via @radix-ui/react-label
  - Textarea: Multi-line text input with validation states
  - Select: Dropdown select with grouped options using compound pattern (Select.Trigger, Select.Content, Select.Item, etc.)
  - Switch: Toggle switch with size variants (sm, md, lg) via @radix-ui/react-switch

- [`0a6eb92`](https://github.com/beaket/ui/commit/0a6eb92): Add Phase 2 components: Tooltip, Separator, Card, Tabs, Sheet, and Alert
  - **Tooltip**: Popup that displays information on hover or focus
  - **Separator**: Visual divider for horizontal or vertical separation
  - **Card**: Container component with Header, Title, Description, Action, Content, and Footer sub-components
  - **Tabs**: Tab navigation component for switching between content panels
  - **Sheet**: Slide-out panel from any edge of the screen (left, right, top, bottom)
  - **Alert**: Callout component with semantic variants (note, tip, important, warning, caution)

- [`21e60c3`](https://github.com/beaket/ui/commit/21e60c3): Add Table and DataTable components
  - Table: Semantic HTML table components (TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption)
  - DataTable: TanStack Table-based component with sorting, filtering, pagination, and row selection
  - Update Button to use design tokens
  - Update CLAUDE.md with library architecture and design philosophy

- [`2304fb0`](https://github.com/beaket/ui/commit/2304fb0): Add Dialog component with compound pattern, controlled/uncontrolled modes, and Storybook tests
- [`4028bf6`](https://github.com/beaket/ui/commit/4028bf6): Add DropdownMenu component with compound pattern, checkbox/radio items, submenus, and keyboard shortcuts support
- [`27f74ac`](https://github.com/beaket/ui/commit/27f74ac): Add Pagination and BlankSlate components (Phase 3 migration)
  - Pagination: Server-side pagination with ellipsis support for SSR-friendly navigation
  - BlankSlate: Empty state component with preset icons and custom icon support

### Patch Changes

- [`86722d0`](https://github.com/beaket/ui/commit/86722d0): Make Tooltip self-contained by including TooltipProvider internally

## 1.3.0

### Minor Changes

- [`495bc3c`](https://github.com/beaket/ui/commit/495bc3c): Add Input component with brutalist design
- [`2633dec`](https://github.com/beaket/ui/commit/2633dec): Add Radio component for single-choice selection

## 1.2.0

### Minor Changes

- [`11f945c`](https://github.com/beaket/ui/commit/11f945c): Add Badge component with 6 variants: default, secondary, success, error, info, outline

## 1.1.1

### Patch Changes

- [`6916e4e`](https://github.com/beaket/ui/commit/6916e4e): Add usage field to registry.json for component documentation

## 1.1.0

### Minor Changes

- [`4901272`](https://github.com/beaket/ui/commit/4901272): Add Checkbox component with Radix UI primitives

## 1.0.0

### Major Changes

- [`5dfc775`](https://github.com/beaket/ui/commit/5dfc775): Simplify CLI and component structure

  **Breaking changes:**
  - `beaket.json` now only requires `components` path (removed `tailwind`, `aliases`, `paths.utils`)
  - Components are now single files (e.g., `button.tsx` instead of `button/button.tsx`)
  - `cn` utility is now inlined in each component

  **New `beaket.json` format:**

  ```json
  {
    "components": "src/components/ui"
  }
  ```

  **Migration:**
  1. Update `beaket.json` to new format
  2. Add CSS variables manually (see docs)
  3. Re-add components with `--overwrite` flag

### Minor Changes

- [`12e1451`](https://github.com/beaket/ui/commit/12e1451): Add overwrite prompt for existing files in CLI add command
  - Add `--overwrite` (`-o`) flag to force overwrite without prompting
  - Prompt user for confirmation when a file already exists
  - Show skipped files with instructions to use `--overwrite`
  - Improve progress display with checkmarks

## 0.1.8

### Patch Changes

- [`6ecf976`](https://github.com/beaket/ui/commit/6ecf976): Update CLI package description

## 0.1.7

### Patch Changes

- [`e30519c`](https://github.com/beaket/ui/commit/e30519c): Add JSDoc comments to Button component props

## 0.1.6

### Patch Changes

- [`e453371`](https://github.com/beaket/ui/commit/e453371): docs: add JSDoc comment to Button component
- [`e180d0f`](https://github.com/beaket/ui/commit/e180d0f): docs: add JSDoc comment to Button props
- [`14c4706`](https://github.com/beaket/ui/commit/14c4706): docs: add JSDoc comment to Spinner component
- [`51771f8`](https://github.com/beaket/ui/commit/51771f8): Rename ButtonProps to Props internally
- [`26470e9`](https://github.com/beaket/ui/commit/26470e9): fix: trigger auto-changeset only on PR open and use PR title
- [`7b1fb93`](https://github.com/beaket/ui/commit/7b1fb93): chore: apply code formatting and cleanup

## 0.1.5

### Patch Changes

- [`04f0200`](https://github.com/beaket/ui/commit/04f0200): Test changeset for verification
