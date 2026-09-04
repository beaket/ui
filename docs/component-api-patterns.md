# Component API Patterns

**The API-shape counterpart to `CLAUDE.md` (design rules) and `.impeccable.md` (design context).** Those decide what a component _looks like_. This decides what it _is shaped like_ as an API — and, more importantly, **which changes it can survive**.

Maintainer doc. Lives outside the npm tarball and outside Astro routing (`docs/src/pages/`), like `git-rules.md`. No changeset needed to edit it.

**Status:** every "Today" note and Part 4 finding below was re-checked against the tree at `0cf033a` on 2026-09-04; where the code disagreed, the code won and the correction is inline. The work is tracked as **epic #856** with one child issue per finding — see the table at the end of Part 3.

Read Part 0 and Part 1 once — they are the reasoning the rules come from. Part 2 is the reference you come back to; **§12 rules on what every component should become**, and **Part 4 records where we are behind React 19.**

---

# Part 0 — The two facts that decide everything

Almost every rule in this document falls out of these two. If a rule ever seems arbitrary, re-derive it from here.

## Fact 1 — Open Code: the consumer owns the file

_Term: **"copy and paste, not install" / open code** — shadcn/ui's own framing of this distribution model. ✅ established._

Registry components are **copy-pasted verbatim** into the consumer's project. After the copy there is no link back to this repo.

The usual justification for extension points — "extend, don't modify" (Meyer's Open–Closed Principle) — **does not apply here**. The consumer can modify. It is their file. They have a text editor.

So why offer `className`, `asChild`, and compound parts at all?

> **Because every edit the consumer makes is a fork.** A forked file can never take an upgrade, a bug fix, or a token migration. Extension points do not exist to prevent modification — they exist to make modification _unnecessary_, so the file stays recognisable as ours and can be re-copied later.

That reframes the whole library: **an extension point's value equals the number of edits it prevents.** `asChild` on a link prevents a rewrite of the entire component. A `titleClassName` prop prevents one line. This is the measure to use when deciding whether an API addition is worth it.

**Corollary — isomorphism replaces abstraction** (✳️ our phrasing; no prior art — do not cite it as a known pattern)**.** You cannot DRY across a copy boundary; there is no shared module to extract into. So duplication is not a defect here, it is the delivery mechanism. But it only pays off if the duplicates are _byte-identical_: a reader who has learned one file has then learned twelve. Duplication that drifts is the worst of both worlds — all of the repetition, none of the recognition.

## Fact 2 — Mechanism, not Policy

_Term: **separation of mechanism and policy** — Unix / X Window System. ✅ established, and older than any of the React patterns below._

The oldest idea in this document, from the X Window System and the Unix tradition: **a component supplies material and behavior; the consumer supplies the arrangement.**

- `Card` gives you a surface: a border, a padding, a gap, a drawn shade. That is mechanism.
- `Card.Header` gives you a ruled-header _reading_ if you want one. That is policy, offered and declined freely.
- A `Card` that rendered its own header from a `title` prop would have fused the two — and the only way back out is another prop.

This is the real reason the compound style is worth preferring, and the reason it composes with designs nobody has drawn yet. It is not about the dot in `Card.Header`; it is about **who decides the arrangement**. The dot is just the packaging.

---

# Part 1 — Design for Change (Information Hiding)

_Terms: **design for change** and **information hiding** — Parnas, 1972. **Hyrum's Law** — Hyrum Wright, Google. ✅ both established._

Parnas, 1972: decompose a system around **what is likely to change**, and hide each changeable decision behind an interface that does not change with it. The method is to name the changes first.

Here is what actually changes in this library. Each pattern in Part 2 exists to absorb exactly one row.

| What changes                                    | How often       | Who causes it | The pattern that absorbs it                               |
| ----------------------------------------------- | --------------- | ------------- | --------------------------------------------------------- |
| Visual design — color, shadow, spacing          | Constantly (us) | Us            | Semantic tokens + `cva` variants (§8). Never a raw value. |
| The consumer's layout and arrangement           | Constantly      | Consumer      | Compound parts + children (§1, §2)                        |
| A one-off style tweak                           | Constantly      | Consumer      | `className` last into `cn` (§5)                           |
| Needing to query, style, or test one node       | Constantly      | Consumer      | `data-slot` (§4)                                          |
| The host framework — Next.js, React Router, RSC | Rare, but total | Consumer      | `asChild` (§3)                                            |
| The underlying primitive — Radix, TanStack      | Occasional      | Upstream      | Own the props type at composition boundaries (§6)         |
| A new behavior or feature we want to ship       | Occasional      | Us            | Additive growth only (Part 3)                             |
| React itself                                    | Rare            | Upstream      | `React.ComponentProps`, no `forwardRef` (§6)              |

**Use this table as a filter.** Before adding any prop, name the row it serves. A prop that serves no row is speculation, and speculation is the thing that makes an API impossible to change later — because by then someone depends on it (Hyrum's Law).

**The evidence is already in this repo.** `DataTable` has **20 props**, all configuration. Among them: `emptyMessage` _and_ `emptyState`; `onRowClick`, `onRowMouseEnter`, `onRowMouseLeave`; `getRowClassName`. That is not carelessness — it is the predictable, mechanical result of answering layout questions with props instead of with children. Each prop was reasonable on the day it was added. The 20th was reasonable too. That is exactly the problem.

---

# Part 2 — The patterns

Each pattern is titled with **the name the industry actually uses**, so you can search for it, cite it in a review, and find prior art outside this repo. Where we use a term more loosely than its source does, that is flagged — a borrowed name that quietly shifts meaning is worse than no name.

| Standing | Meaning                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------- |
| ✅       | Established industry term. Use it in reviews and commit messages; outsiders will know it.                 |
| ⚠️       | Established term, but our usage is narrower or broader than the original. Read the note before citing it. |
| ✳️       | Coined in this repo. No prior art — do not present it as a known pattern.                                 |

| §   | Name                                                            | Standing | Where the term comes from                                                                     |
| --- | --------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| §1  | **Flexible Compound Components** / **Dot-Notation Namespacing** | ⚠️       | React community; Kent C. Dodds. Two independent axes wear the same name — see §1.1.           |
| §2  | **Progressive Disclosure** (Layered API)                        | ✅       | API design; named explicitly by Apple's SwiftUI team (WWDC22).                                |
| §3  | **Slot Pattern** (`asChild`)                                    | ✅       | Radix UI. Deliberately _not_ "Polymorphic Component" (`as` prop) — see §3.                    |
| §4  | **Styling Hooks** (part contract)                               | ✅       | Design-systems term; CSS Shadow Parts (`::part()`) is its standardized form.                  |
| §5  | **Escape Hatch**                                                | ✅       | React's own vocabulary ("Escape Hatches" is a section of the React docs).                     |
| §6  | **Anti-Corruption Layer**                                       | ✅       | Domain-Driven Design (Evans). Used here for the upstream-primitive boundary.                  |
| §7  | **Intention-Revealing Names**                                   | ⚠️       | DDD. A naming convention, not a pattern — do not oversell it.                                 |
| §8  | **Variants** & **Compound Variants**                            | ✅       | `cva`'s own terms. Panda CSS / vanilla-extract call the same thing **recipes**.               |
| §9  | **Controlled vs. Uncontrolled**                                 | ✅       | Official React terminology.                                                                   |
| §10 | **Make Illegal States Unrepresentable** (Discriminated Union)   | ✅       | Yaron Minsky, OCaml / Jane Street.                                                            |
| §11 | **Deep vs. Shallow Modules**                                    | ⚠️       | Ousterhout, _A Philosophy of Software Design_. The material/logic split on top of it is ours. |
| §12 | _(the verdict table — no pattern of its own)_                   | —        | Applies §1–§11 to every component in the registry.                                            |

Each section then runs: **POINT** (the one sentence to remember) → why it holds → the rule → where the code disagrees today.

## §1 Compound Components & Dot-Notation Namespacing

`Object.assign(Root, { Part })`

> **POINT: the root owns the material; the parts are optional, and the arrangement stays in the consumer's JSX.**

```tsx
export const Card = Object.assign(CardRoot, {
  Section: CardSection,
  Header: CardHeader,
  Title: CardTitle,
  // …
});
```

### 1.1 Two independent axes — and the dot is a real one

Kent C. Dodds, who taught this pattern to most of the industry, has had to correct the same misreading repeatedly: **the pattern is the implicit state sharing between root and parts.** But "the dot is not the pattern" is easy to over-read into "the dot does not matter", and that is wrong too. There are **two independent decisions** here, and conflating them in either direction causes a different mistake.

- **Axis A — mechanism: do the parts share state with the root?** This is what makes something a compound component. `<select>` and `<option>` are the canonical case: apart they do nothing, together they are the control.
- **Axis B — packaging: dot-notation, or flat exports?** This is a naming and discoverability decision, and it is **valuable on its own terms**, independent of Axis A.

The axes are genuinely orthogonal — every cell exists in the wild:

|                            | **Flat exports**                                                          | **Dot-notation**                                         |
| -------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| **No shared state**        | shadcn/ui ships `Card`, `CardHeader`, `CardTitle` as separate exports     | **our `Card`, `Table`, `Breadcrumb`** — namespaced parts |
| **Shared state (context)** | Radix's own packages (`import * as DialogPrimitive`), and **our `Radio`** | **our `Select`, `Tabs`, `Dialog`** — the full thing      |

**So: is it wrong to think of dot-notation as part of the compound pattern?** As a _practice_, no — the dot is the conventional packaging **for** compound components, the two ship together constantly, and reading `<Select.Trigger>` tells you instantly which family it belongs to. Treating it as part of the pattern's normal shape is fine.

It is wrong only as a _definition_, and the failure is concrete. If the dot defines the pattern, then:

- you look at `Card`, call it a compound component, and reach for context it does not need; or
- you read "compound components pass state to their children", implement it with `cloneElement`, and ship the broken version below.

**In this library the dot is the default packaging for both rows.** Axis B is settled: use `Object.assign`. Axis A is the question §1.3 answers.

### 1.2 On Axis A there are three mechanisms, and one of them is banned

| Mechanism                                                                                                      | Works at any depth?           | Verdict here                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **None** — parts are independent nodes                                                                         | Yes                           | ✅ **Correct when parts share no state.** Card, Table, Breadcrumb.                                                                                                                       |
| **`React.Children.map` + `cloneElement`** — the classic compound implementation, injecting props into children | **No — direct children only** | ❌ **Never.** Wrapping a part in a `<div>`, or producing parts from a `.map()`, silently breaks the injection. This is the pattern's best-known flaw and the reason context replaced it. |
| **React context**, provided by the root — _Flexible_ Compound Components                                       | Yes                           | ✅ **The real thing.** What Radix does, and what Select, Tabs, DropdownMenu, Tooltip, Dialog and Sheet already inherit.                                                                  |

The word _flexible_ in "Flexible Compound Components" is exactly this: it is the version that survives being wrapped.

### 1.3 The one question that decides Axis A

> **Would the consumer have to pass the same value to more than one part?**
>
> **Yes → flexible compound (context). No → namespacing.**

That is the whole test — and note that it decides **only Axis A**. Whichever way it lands, the parts still hang off the root with a dot. It is also a test about _the consumer's_ typing, not about how sophisticated the component feels. `Card.Title` needs nothing from `Card`, so context would be pure machinery. `Navigation.Link` needs to know which link is current — which today the consumer answers by hand, on every single link. That repetition is the signal.

Two corollaries worth stating, because both get violated in practice:

- **Do not use context to share styling.** Tokens, `data-slot`, and CSS `:has()` already do that without a provider — `card.tsx` selects its own layout from a child's presence with `has-data-[slot=card-action]`, no state involved. Context is for state a part **cannot compute for itself**.
- **Do not reach for context to avoid one prop.** One value passed to one part is not prop drilling. The pattern's costs — invisible coupling, re-render surface, harder isolated testing — are only worth paying when they buy the consumer real ergonomics.

### 1.4 If you do use context, these rules are not optional

Context is what makes the coupling invisible. These five rules make it audible again.

1. **Keep the context in the same file.** Fact 1 makes this free: one file, one `createContext`, no shared module to extract — the constraint that hurts elsewhere costs nothing here.
2. **Never call `useContext` directly from a part.** Go through a local hook that throws a named error: ``throw new Error("`Pagination.Item` must be used inside `<Pagination>`")``. A part that silently renders nothing outside its root is the single worst debugging experience this pattern produces.
3. **Memoize the value** (`useMemo`). An object literal in the root's render re-renders every consuming part on every keystroke — the documented failure mode of the pattern. Do this by hand even though React Compiler would do it for you: the compiler runs in _the consumer's_ build, and we do not control that (F3).
4. **Never export the context.** Exported means public, and public means permanent (Hyrum's Law, §4). The context is an implementation detail; the parts are the API.
5. **Context adds state, never restrictions.** Every part still takes `className` (§5) and `asChild` where it renders an element (§3). Sharing state is not a licence to close the component.

### 1.5 Why both axes earn their keep

_Axis A — parts, and the state behind them:_

- **It is Fact 2 in code.** The root carries the material — border, surface, shadow, padding. The parts carry layout only, and every one of them can be skipped, reordered, wrapped, or replaced with the consumer's own markup. Nothing in the component knows the shape of the finished thing.
- **Parts stay dumb, so they compose with the unforeseen.** A part that styles exactly one node has no opinion to conflict with. This is the flexibility itself — not a side effect of it.
  _Axis B — the dot itself. This is the half that is "just packaging", and it is still worth having:_

- **One import, a discoverable surface.** Typing `<Card.` lists everything that exists. Flat exports make a consumer import six names and wonder about a seventh.
- **It states the family at the call site.** `<Select.Trigger>` is self-evidently part of `Select`; `<SelectTrigger>` relies on a naming convention the reader has to trust.
- **The namespace cannot collide** with the consumer's own `Title` or `Header`.
- **One expression is the complete public surface.** Post-hoc mutation (`Dialog.Title = DialogTitle`) scatters the surface down the file and depends on statement order; TypeScript's expando-function support means a typo quietly adds a property instead of failing.

**Rules**

- The root is whatever owns state and material. Parts carry layout only.
- Name parts for their role, not their tag: `Card.Section`, `Table.Head`, `Breadcrumb.Page`.
- **Every part must be optional.** If the root is broken without it, it is not a part — it belongs in the root. (`Card`'s own source comment states this: parts are "optional layout helpers, never the required anatomy.")
- One export per file: the component, plus its props type. Parts are not exported individually.

**Today**

- _Assembly:_ `Object.assign` in Card, Breadcrumb, Navigation, Select, Tabs, Tooltip; post-hoc mutation (`Dialog.Title = …`) in Dialog, Sheet, DropdownMenu, Table **and Avatar** — five files. Identical public shape, two spellings — prefer `Object.assign`.
- _Shape:_ the Radix-backed components are flexible compound components already (their context is Radix's). The rest are namespaced parts. **Nothing in this repo writes its own context yet** — §12 says where that changes.
- _Odd one out:_ `Radio` is the only Radix-backed component exported flat (`RadioGroup` + `RadioItem` as two names) instead of `RadioGroup.Item`. It is a true compound component wearing the wrong packaging.

## §2 Progressive Disclosure — a core you compose, plus sugar you may ignore

> **POINT: children carry content and arrangement; props carry behavior. A convenience prop is allowed only as a shortcut _over_ the compositional path, never as the only path to it.**

This supersedes the blunter "composition over configuration". The blunt version is wrong, and `Dialog`'s `trigger` prop is why: it makes the common case one line, and that is real value. Alan Kay's formulation is the one that survives — **simple things simple, complex things possible** — and it requires _two_ layers, not a choice between them.

| Belongs in a prop                     | Belongs in children                             |
| ------------------------------------- | ----------------------------------------------- |
| `preventClose`, `loading`, `disabled` | Title text, footer buttons, the trigger element |
| `elevation`, `variant`, `size`        | Icons, descriptions, custom rows                |
| `active`, `open` / `onOpenChange`     | Anything a consumer might reorder or wrap       |

**Why it holds**

- **A content prop can only be extended by another content prop.** `title` invites `titleIcon`, then `titleClassName`, then `renderTitle`. Children absorb all three for free, at zero API cost. `DataTable`'s `emptyMessage` + `emptyState` pair is this exact sequence, already completed.
- **Content props cannot be reordered, wrapped, conditionally rendered, or styled** — the four things consumers actually ask for.
- **A `ReactNode` prop is structurally invisible.** Nothing in the type tells the consumer that `trigger` must be focusable.
- **The layering test:** a boolean switch on the root (`preventClose`) has a fixed cost forever. A `ReactNode` slot is the first member of a family. Charge the second one accordingly.

**Rule** — ship the compositional path first. Add sugar afterwards, only if it collapses a genuinely common case, and only where removing the sugar would still leave the component fully usable.

**Today** — Dialog and Sheet take `trigger` with no `Dialog.Trigger` beneath it: the sugar _is_ the API, so a consumer who needs two triggers or a conditional one has nowhere to go. `Alert` takes `title`. `Pagination` and `DataTable` are configuration end to end. New components follow the table; these change only when the file is open for other reasons (Part 3).

## §3 The Slot Pattern — `asChild`, never an `as` prop

> **POINT: anything that renders `<a>` or `<button>` must let the caller supply the element, or it is unusable with the consumer's router.**

```tsx
const Comp = asChild ? Slot : "button";
```

_Term: the **Slot pattern** (Radix's `Slot` utility + an `asChild` boolean). It is **not** the **Polymorphic Component** pattern — that name belongs to the `as` / `component` prop family (Styled Components, Chakra, MUI). Using the right name matters in review: the two solve the same problem and one of them is the reason we said no to the other._

**Why it holds**

- **This is the library's largest real-world integration gap.** `Breadcrumb.Link`, `Navigation.Link`, and `Pagination` hardcode `<a href>`. In Next.js or React Router the consumer must lose client-side navigation — or rewrite the component, which by Fact 1 means forking it forever. One `asChild` prop prevents a whole-file fork; by the measure in Part 0, that is the highest-value API addition available in this package.
- **`as` / `component` props do not type cleanly.** They demand a generic whose props depend on the tag, which wrecks inference, complicates `ref`, and produces unreadable errors. `asChild` inverts it: the child is written by the consumer, so its type is already correct and untouched.
- **One mental model.** Radix already works this way and half this library wraps Radix. Two polymorphism idioms is one too many. (This is where React converged after mixins → HOCs → render props: slots compose without nesting and without type gymnastics.)

**Rules**

- Under `asChild`, inject nothing. See `Button`: `type` and `disabled` apply only when `asChild` is false, and the spinner is skipped — the child owns its tag.
- Opting out is fine but must be _stated in the type_: `Switch` uses `Omit<…, "asChild">` because a switch is its own instrument.

**Today** — **offered as a prop** by Button (`button.tsx:17`), Card root (`card.tsx:52`), and `Dialog.Close` / `Sheet.Close` (`dialog.tsx:172`, `sheet.tsx:207` — defaulted to `true` and forwarded to Radix); `switch.tsx:49` is the documented `Omit` opt-out. The other `asChild` occurrences are **internal forwarding, not an offered prop**: `dialog.tsx:100` / `sheet.tsx:131` wrap the `trigger` node, `select.tsx:53` is `SelectPrimitive.Icon asChild`. Missing where it costs the most: `Breadcrumb.Link`, `Navigation.Link`, `Pagination`. Adding it is purely additive (Part 3, safe).

## §4 Styling Hooks — `data-slot` on every rendered element

> **POINT: pick the contract you want people to depend on, and hand it to them — or they will depend on your class names instead.**

_Term: **styling hooks** — the design-systems name for internals a component deliberately exposes for outside styling. The web platform standardized the same idea as **CSS Shadow Parts**: a `part` attribute selected from outside with `::part()`. `data-slot` is that contract, done with an attribute selector because we ship light DOM, not shadow DOM._

**Why it holds**

- **Hyrum's Law says something will become a contract whether you choose it or not.** With enough users, every observable detail gets depended on. `data-slot` is the _blessed_ observable: stable, named, free at runtime, and explicitly not the class names — which are ours to rewrite every time the design changes.
- **It survives the copy.** After a consumer restyles the file, the slots still identify the parts.
- **It lets a parent see its own children.** `has-data-[slot=card-action]:grid-cols-[1fr_auto]` in `card.tsx` is layout reacting to composition. Class-name targeting cannot do this.
- **Tests read like the DOM**, and stop breaking on copy changes.

**Rule** — kebab-case, `<component>-<part>`, matching the file name. Distinguish look-alike roles: `dialog-close` (the X) vs `dialog-close-action` (a footer button).

**Today** — near-universal, with one hole: **`data-table.tsx` has zero `data-slot`s** — the only component in the registry with none; the other 25 carry between 1 (`button`, `badge`, `label`, `skeleton`) and 14 (`dropdown-menu`). Its entire DOM is unaddressable, which is part of why it compensates with `getRowClassName` and 20 props.

## §5 The Escape Hatch — `className` is the last word, and custom utilities never layer

> **POINT: the consumer's class always wins; and any utility `tailwind-merge` doesn't know must be selected, never stacked.**

Every component ends with `cn(<internal classes>, className)`, so `tailwind-merge` lets the consumer override. This is `.impeccable.md` Principle 4 — _opinionated defaults, flexible overrides_ — expressed in code.

**The invariant that is easy to break:** `tailwind-merge` does not know our custom utilities (`shadow-offset`, `shadow-offset-action`, `shadow-offset-overlay`) and **cannot dedupe them against each other**. Two in one class list both apply, and the result is not the design.

**Rule** — mutually exclusive custom utilities are chosen by **compound variants**, never layered and overridden. `cardVariants` is the reference implementation and keeps the reasoning in a comment above it. Anything twMerge cannot arbitrate must be arbitrated in the variant table.

## §6 Platform Props, with an Anti-Corruption Layer at the boundary

> **POINT: `extends React.ComponentProps<…>` for free correctness; hand-write the props type wherever the component is a composition the primitive doesn't own.**

```tsx
export interface CardRootProps extends React.ComponentProps<"div"> { … }        // our element
interface Props extends React.ComponentProps<typeof CheckboxPrimitive.Root> { … } // we *are* the primitive
```

_Term: **Anti-Corruption Layer** (Domain-Driven Design) — a boundary that stops an external model's concepts from leaking into yours. Radix is the external model here; the question each component must answer is whether it sits inside that boundary or on it._

**Why it holds**

- Native attributes, `ref` (React 19 — no `forwardRef` boilerplate) and event handlers arrive free and stay correct as React evolves. A hand-written attribute list is a list of the attributes we happened to think of.
- **But re-exporting a primitive's props type points our API's stability at someone else's release cycle.** Twelve components currently surface Radix types. That is correct where the component _is_ the primitive with our paint on it (Checkbox, Label, Separator, Switch): there the coupling is honest, and Radix is a declared dependency in `registry.json` anyway.
- It is wrong where the component is **our** composition. `Dialog` and `Sheet` already get this right: both hand-write their own `Props` rather than inheriting `DialogPrimitive.Root`'s, because `trigger` / `preventClose` / `closeWhen` are ours, not Radix's. The rule already exists in the code — it just was not written down.

**Rule** — when a custom prop shadows a native one, `Omit` it so the conflict is visible in the type: `Omit<React.ComponentProps<"input">, "prefix">` (Input), `Omit<…, "title">` (Alert).

**Today** — six components still use the pre-React-19 `HTMLAttributes` families, which silently drop `ref` from their public type. See **F1**, the cheapest fix in this document.

## §7 Intention-Revealing Names — name the props type after the component, and export it

> **POINT: `export interface ButtonProps` — because this name lands in someone else's codebase, not ours.**

**Why it holds** — the file is standalone, so `Props` reads fine _here_ and badly everywhere else: a consumer importing two components writes `import { Props as ButtonProps }`, and `Props` is un-greppable across a codebase. Exporting it is what lets them write a wrapper, which is the first thing anyone does with a copy-pasted component.

**Today** — mixed, and only a quarter of it is actually breaking to fix:

| State                                  | Where                                                                                                                                                                                                                                                                                                                 | Cost to fix                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Named **and** exported — nothing to do | `CardRootProps`, `BlockquoteProps`, `DataTableProps`, `NavigationProgressProps`, `PaginationProps`, `RadioGroupProps`, `RadioItemProps`, `TableProps`                                                                                                                                                                 | —                                             |
| Named, **not** exported                | `AlertProps` (`alert.tsx:45`), `SwitchProps` (`switch.tsx:47`), `NavigationLinkProps` (`navigation.tsx:33`), `SelectTriggerProps` (`select.tsx:20`), `TooltipProps` / `TooltipProviderProps` (`tooltip.tsx:7,19`), `PaginationBaseProps` / `PaginationLinkProps` / `PaginationButtonProps` (`pagination.tsx:7,30,46`) | **Free** — add `export`                       |
| Generic `Props`, not exported          | `avatar.tsx:10`, `dialog.tsx:9`, `sheet.tsx:9`, `textarea.tsx:7`                                                                                                                                                                                                                                                      | **Free** — rename                             |
| Generic `Props`, **exported**          | `badge.tsx:7`, `button.tsx:8`, `checkbox.tsx:8`, `input.tsx:6`                                                                                                                                                                                                                                                        | **Breaking** — renames a public name (Part 3) |

So the §7 sweep is four breaking renames, not a wholesale break.

## §8 Variants & Compound Variants — `cva` when there is a matrix, role names always

> **POINT: two or more variant axes → `cva`. And call it `destructive`, never `red`.**

**Why it holds**

- `cva` puts the variant matrix, the defaults and the compound rules in one readable block instead of scattering them through template literals, and `VariantProps` derives the type so styles and props cannot drift. Below that threshold it is ceremony around a string — a ternary is the honest answer.
- **Role names survive a redesign; appearance names start lying at the next one.** This is the lesson CSS learned the expensive way in the `.red` / `.pull-left` era, and it is the same reason `CLAUDE.md` bans raw palette values in components. A name should say what a thing _is for_.

**Rules**

- Sizes are `sm | md | lg` (+ `icon` where it applies). No other vocabulary.
- Repeated fragments get a named `const` — `const edge = "hover:shadow-offset-action …"` in `button.tsx` — so a shared grammar is stated once and reads as one idea.

**Today** — `cva`: Button, Card, Alert, Badge, Switch. Inline strings with ternaries: Radio, Navigation, Tabs. Hand-rolled class constants: Pagination.

## §9 Controlled vs. Uncontrolled, with a dev warning

> **POINT: the consumer decides whether this state is theirs — and if they half-decide, tell them in the console instead of failing silently.**

Internal state by default; `open` + `onOpenChange` takes over; a one-time `console.warn` in non-production when `open` arrives without `onOpenChange`.

_Term: **Control Props** — one of the inversion-of-control patterns Kent C. Dodds groups with compound components. Its siblings are deliberately **not** used here: **State Reducer** (the caller replaces the component's reducer) and **Prop Getters** (the component returns prop bundles instead of rendering) buy total control at the price of an API a reader has to learn before they can use a button. In a library the consumer can simply edit (Fact 1), that trade is a bad one — they can change the code instead of learning a protocol._

**Why it holds** — it hands ownership of the state to the caller without taxing the caller who does not want it, and the warning catches the one failure mode that is otherwise silent and baffling: a dialog that opens and then refuses to close.

**Rules**

- Warn, never throw. A misconfigured prop must not take down the page.
- Guard with `process.env.NODE_ENV !== "production"` and fire once (`hasWarnedRef`).
- Keep the block **byte-identical** across components — this is Fact 1's isomorphism rule. It cannot be extracted; its whole value is instant recognition. Copy it from `dialog.tsx`, do not improve it in place. (The component name inside the warning string is the only difference between `dialog.tsx:74` and `sheet.tsx:105` today, and the only one permitted.)

**Before you copy it:** the block also contains a render-time ref write that React tells you not to do, and that `useEffectEvent` now replaces (**F2**). And Radix's `Root` already implements controlled/uncontrolled itself. In `Dialog` and `Sheet` the wrapper state exists _only_ to serve `closeWhen`. Drop `closeWhen` and, measured: the prop, its effect (**exactly 11 lines** — `dialog.tsx:81-91`, `sheet.tsx:112-122`) and the `onOpenChangeRef` pair it needs go with it — **~14 lines per file**, rising to ~25 if the rest of the open-state wrapper (`internalOpen` / `isControlled` / `handleOpenChange`) is also handed back to Radix's `Root`. The dev warning stays either way; it is about `open` without `onOpenChange`, not about `closeWhen`. Do not add this block to a Radix-backed component that has no equivalent need.

## §10 Make Illegal States Unrepresentable

> **POINT: if two props must never appear together, say so in the type — do not check for it at runtime.**

```ts
interface PaginationLinkProps {
  mode?: "link";
  buildPageUrl: (p: number) => string;
  onPageChange?: never;
}
interface PaginationButtonProps {
  mode: "button";
  onPageChange: (p: number) => void;
  buildPageUrl?: never;
}
```

**Why it holds** — the invalid combination fails at the call site, and each mode's required prop is genuinely required instead of optional-and-hoped-for. A runtime guard finds the same bug later, in someone else's app.

**When not to** — if the modes differ only in _which element gets rendered_, `asChild` (§3) deletes the union outright. Pagination's two modes are exactly that case: the union is the expensive answer to a question `asChild` had already answered.

## §11 Deep vs. Shallow Modules — two kinds of component, two different rules

> **POINT: most components are material and should be shallow. A few are logic — and those must be deep: much behavior behind a narrow interface, never a wide one.**

_Term: **deep vs. shallow modules** — Ousterhout, *A Philosophy of Software Design* (✅ established). The **material / logic** split layered on top is ✳️ ours: a convenient label for this library, not a term anyone outside will recognise._

|                | **Material components** (the majority)                         | **Logic components** (`DataTable`, `Pagination`)                                          |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| What they hold | Marks on the page: border, surface, type, state cues           | Real algorithms: sorting, filtering, pagination, selection                                |
| Correct shape  | Shallow and numerous — many small parts, each styling one node | **Deep**: a lot of behavior behind a small interface                                      |
| Extend by      | Adding a part                                                  | Handing back control (`asChild`, children, a `table` instance) — **not** by adding a prop |
| Failure mode   | Too many props for something that renders one `<div>`          | An interface as wide as the feature list                                                  |

Ousterhout's measure is the ratio of functionality to interface. A shallow _material_ component is fine — its interface is small because its job is small. A shallow _logic_ component is the classic mistake: `DataTable` carries genuine complexity **and** exposes 20 props, so the consumer pays twice — once to learn the interface and again when the 21st need is not on the list.

**Rule** — for a logic component, every new requirement is first attempted as _giving something back_ (a slot, a part, the underlying instance) and only becomes a prop when that fails. Ask: _does this prop describe behavior, or is it an arrangement question I failed to hand back?_

## §12 The shape each component should have

§1–§11 are the rules. This is the ruling: every component in the registry, what it is today, and what it should be. Nothing here is a rewrite for its own sake — each row names the reader-visible problem it fixes, and the **Landing** column says whether it can ship without a break (Part 3).

**Correct as they are — leave them alone.**

| Component                                                                                                    | Shape                               | Why it is right                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card, Table, Breadcrumb                                                                                      | Namespaced parts                    | Parts share no state. `card.tsx` even resolves its one cross-part dependency in CSS (`has-data-[slot=card-action]`) rather than in a provider — exactly as §1.3 asks. |
| Select, Tabs, DropdownMenu, Tooltip, Avatar                                                                  | Flexible compound (Radix's context) | The state is genuinely shared and genuinely implicit. Nothing to add.                                                                                                 |
| Button, Badge, Input, Textarea, Checkbox, Switch, Label, Separator, Skeleton, Blockquote, NavigationProgress | Single element, flat export         | No internal structure, so no dot. A namespace here would be ceremony.                                                                                                 |

**Should change — with the reason and the cost.**

| Component                                      | Today                                                                                  | Should be                                                                                                                                                               | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Landing                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Pagination**                                 | One function, 4 config props, a `mode` union with `never` guards, hardcoded `<a href>` | **Flexible compound.** Root holds `page` / `totalPages` / navigation mode in context; `Pagination.Item`, `.Previous`, `.Next`, `.Ellipsis` read it                      | Fixes three findings at once: the union disappears (§10), the router problem disappears with `asChild` on the parts (§3), and the page-number algorithm stops being entangled with rendering. **Prior art: shadcn/ui's Pagination is exactly this shape** — `Pagination` › `PaginationContent` › `PaginationItem` › `PaginationLink` / `Previous` / `Next` / `Ellipsis`. The consumer passes `page` once to the root instead of to every cell — §1.3's test, answered yes. | ✅ **Additive** — add the parts, keep the current props working as the §2 sugar layer.     |
| **DataTable**                                  | 20 config props, zero `data-slot`s                                                     | **Flexible compound over the TanStack instance.** Root builds the `table` object and provides it; `DataTable.Toolbar`, `.Head`, `.Row`, `.Empty`, `.Pagination` read it | The `table` instance _is_ the shared state — this is the one component whose context is unarguable. TanStack Table is headless by design; wrapping it in 20 props re-adds the shell it deliberately omitted. Every prop then becomes a part or disappears: `emptyMessage`/`emptyState` → `DataTable.Empty`; `getRowClassName`/`onRowMouseEnter`/`onRowMouseLeave` → the consumer's own `<DataTable.Row>`. Deep module, narrow interface (§11).                             | ✅ **Additive** — parts first, props deprecated later.                                     |
| **Navigation**                                 | Namespaced; consumer sets `active` by hand on every `Navigation.Link`                  | **Flexible compound.** Root takes the current value; `Navigation.Link` compares its own `value` and derives `active`                                                    | The same value is answered on every part — §1.3's exact signal. Today's "is this the current page?" logic is copy-pasted down the consumer's nav.                                                                                                                                                                                                                                                                                                                          | ✅ **Additive** — root `value` is optional; an explicit `active` prop keeps overriding it. |
| **Radio**                                      | True compound (Radix) exported flat as `RadioGroup` + `RadioItem`                      | `RadioGroup` + `RadioGroup.Item`                                                                                                                                        | It already shares state through Radix's context; only the packaging disagrees with Select and Tabs.                                                                                                                                                                                                                                                                                                                                                                        | ❌ **Breaking** — renames an export. Batch it (Part 3).                                    |
| **Alert**                                      | `title` prop, description via children                                                 | `Alert.Title` + `Alert.Description` parts                                                                                                                               | Content in a prop (§2). No state is shared, so namespacing is the right shape — not context. The variant icon stays on the root, where the variant lives.                                                                                                                                                                                                                                                                                                                  | ✅ **Additive** — parts alongside the prop.                                                |
| **Dialog, Sheet**                              | Compound, but the trigger arrives as a `ReactNode` prop                                | Add `Dialog.Trigger` / `Sheet.Trigger`                                                                                                                                  | Radix's context is already there; our wrapper simply does not expose the part. A consumer needing two triggers, or a conditional one, currently has nowhere to go (§2).                                                                                                                                                                                                                                                                                                    | ✅ **Additive** — `trigger` stays as sugar.                                                |
| **DropdownMenu, Table, Dialog, Sheet, Avatar** | Parts attached by post-hoc mutation — five files                                       | One `Object.assign`                                                                                                                                                     | Consistency only. Same public shape either way (§1).                                                                                                                                                                                                                                                                                                                                                                                                                       | ✅ **Additive** — pure refactor, no API change.                                            |

**Deliberately left alone, and worth recording why:** `Input`'s `prefix` / `suffix` stay props. They look like content, but the root adjusts its own padding from their presence — a JS conditional (`prefix && "pl-9"`, `input.tsx:57`) inside a second render branch that only exists when an affix is present — and a `:has()` selector (`has-[[data-slot=input-prefix]]:pl-9`) would buy composition we have no demand for. Two props, fixed cost — revisit only if a third affix appears.

---

---

# Part 3 — Growth, not Breakage

_Term: **growth vs. breakage** — Rich Hickey, "Spec-ulation" (2016). ✅ established._

Rich Hickey's rule for evolving an interface: **you may require less, or provide more. Never require more or provide less.** That maps directly onto this repo's changeset policy (`docs/git-rules.md`: `major` is blocked by default).

| Kind of change                                                                                   | Example                                              | Verdict                                                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **Provide more** — a new optional prop, a new compound part                                      | Adding `asChild` to `Breadcrumb.Link`                | ✅ Safe. `minor`. Do it now.                                           |
| **Require less** — an existing required prop becomes optional                                    | `buildPageUrl` becoming optional                     | ✅ Safe. `minor`.                                                      |
| **Add a part alongside sugar** — the compositional path added under an existing convenience prop | `Dialog.Trigger` added while `trigger` keeps working | ✅ Safe, and the correct way to repair a §2 violation without a break. |
| **Require more** — a new required prop, a narrowed type                                          | —                                                    | ❌ Breaking. Blocked.                                                  |
| **Provide less** — a removed or renamed export, a removed prop                                   | `Props` → `ButtonProps`, dropping `closeWhen`        | ❌ Breaking. Blocked; needs maintainer sign-off.                       |

**How to land §12.** The verdict table already carries the classification. In order of value:

1. **Additive, high value — do these deliberately.** `asChild` on `Breadcrumb.Link` / `Navigation.Link` / Pagination's parts; the Pagination and DataTable compound APIs; `Dialog.Trigger` / `Sheet.Trigger`; `Alert.Title` / `Alert.Description`; `data-slot`s throughout `DataTable`. Every one of them ships as a `minor` with the current API untouched — the old prop simply becomes the §2 sugar over the new core.
2. **Additive, cosmetic — do these while passing through.** `Object.assign` conversions, and the React-19 catch-up in Part 4 that costs nothing: **F1** (`ref` in the public type), **F5** (`useFormStatus` fallback), **F6** (`useDeferredValue`).
3. **Breaking — batch them, with sign-off.** `RadioGroup.Item`, `Props` → `<Component>Props`, dropping `closeWhen` and the hand-rolled controlled state it justifies (**~14 lines per file**, ~25 if the rest of the open-state wrapper also goes back to Radix's `Root` — see §9).

The **"Today"** notes in Part 2 are the evidence behind these rows, not a separate backlog.

## Tracking — epic #856

| Issue       | Finding                                                                                        | Gate                                  |
| ----------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- |
| #857        | F1 — `ref` in public prop types                                                                | — do first                            |
| #858        | land this document at `docs/component-api-patterns.md`                                         | —                                     |
| #859        | §3 `asChild` on `Breadcrumb.Link` / `Navigation.Link`                                          | —                                     |
| #860        | §4 `data-slot` throughout `data-table.tsx`                                                     | —                                     |
| #861        | F0 React floor in `registry.json`                                                              | **gates #869, #870**                  |
| #862        | §12 Pagination → flexible compound                                                             | —                                     |
| #863        | §12 DataTable → flexible compound                                                              | after #860                            |
| #864        | §12 Navigation root `value`                                                                    | after #859 (same file)                |
| #865 / #866 | §12 `Alert.Title`·`.Description` / `Dialog.Trigger`·`Sheet.Trigger`                            | —                                     |
| #867 / #868 | F5 `useFormStatus` / F6 `useDeferredValue`                                                     | no floor needed                       |
| #869 / #870 | F2 render-time ref writes / F4 Tabs `keepMounted`                                              | after #861                            |
| #871 / #872 | §1.5 `Object.assign` / F7 avatar flag                                                          | —                                     |
| #873        | Part 3 breaking batch — `RadioGroup.Item`, the four exported `Props` renames, drop `closeWhen` | after all of the above, with sign-off |

---

# Part 4 — Where we stand against React 19

The repo pins **React 19.2.8** (`package.json`), the current stable line — there is no 19.3 or 20. React 19 made `ref` an ordinary prop and retired `forwardRef`; **19.2** (Oct 2025) added `<Activity>`, `useEffectEvent`, `cacheSignal` and Performance Tracks; and **React Compiler 1.0** went stable in Oct 2025.

Below is where our components are behind that platform. Each item says what is wrong, what React now offers, and what it costs to adopt.

_Verification note (updated 2026-09-04, tree at `0cf033a`): these were type-level readings of the source; they have since been checked against a working tree with `node_modules` installed. **F1 is now confirmed by a real typecheck** — all seven declarations fail, individually probed. F0's proposed fix turned out not to work as written and is rewritten below. What is still **unverified**: that Radix `Tabs.Content` unmounts inactive panels (F4 — documented Radix behavior, not demonstrated by a test here), and whether the pinned `@radix-ui/react-avatar` still needs the F7 workaround._

### The constraint that governs all of it

A registry component is copied into a project whose React version **we do not control**, and `registry.json` declares npm dependencies but **never a React version floor**. So "React 19.2 added X" is not on its own a reason to use X.

> **Fix this first: the registry must state a React floor.** Today a component using a 19.2-only API would be copied into an 18.x project and fail at runtime with no warning from the CLI. Everything below marked _raises the floor_ depends on this existing.

**But not by adding a bare `react` entry to `dependencies` — that was this document's original advice and it is wrong.** Checked against the actual format:

- `dependencies` carries **bare package names, no versions** — all 17 unique entries today (`@radix-ui/*`, `clsx`, `lucide-react`, `tailwind-merge`, `@tanstack/react-table`, …) are plain names. A `"react"` entry expresses no floor at all.
- `add.ts` collects `def.dependencies` into a set and hands it to `installDependencies()`, which runs `npm install <names>` / `<pm> add <names>` (`packages/cli/src/utils/files.ts:84-87`). So a bare `"react"` would run `npm install react` in the consumer's project — **pulling React to latest and potentially upgrading it** as a side effect of `add button`.

Two workable options, and it is a maintainer call:

1. **A versioned spec in `dependencies`** — `"react@>=19.2"`. Both npm and pnpm accept that syntax, so no CLI change, but it changes the meaning of a field that has never carried a version, and it still _installs_ rather than _checks_.
2. **A separate documented floor** — one React minimum for the registry (or per component), read by `add` and **verified against the consumer's installed version**, warning rather than installing. This is what a floor actually is.

### F1 — `ref` is missing from seven public prop declarations (five files)

`React.HTMLAttributes` and `React.ButtonHTMLAttributes` do **not** include `ref`. `React.ComponentProps<"button">` does, because React 19 moved `ref` into intrinsic element props. So this fails to typecheck today, for no reason anyone intended — **confirmed, not inferred**: a probe passing a `ref` to all seven produced seven `TS2322`s and nothing else, while `<Input ref={inputRef} />` compiled clean.

```tsx
<Button ref={buttonRef}>Save</Button> // `ref` does not exist on type Props
```

The repo already proves the difference: `input.tsx` destructures `ref` straight out of `Omit<React.ComponentProps<"input">, "prefix">` and it compiles.

**Affected:** `button.tsx`, `badge.tsx`, `blockquote.tsx`, `dialog.tsx` (`Header`, `Footer`), `sheet.tsx` (`Header`, `Footer`).
**Fix:** use `React.ComponentProps<…>`, per §6 — the rule exists, these files predate it.
**Cost:** additive (a widened type). No floor change. **Do this one first.**

### F2 — The hand-rolled "latest ref" pattern now has an official API

Three components carry this:

```tsx
const onOpenChangeRef = useRef(onOpenChange);
onOpenChangeRef.current = onOpenChange; // a write during render
```

Two problems. First, **writing a ref during render is something React explicitly tells you not to do** — it is not a pure render, and it is exactly the shape React Compiler's lint rules flag. Second, this is the "latest ref" workaround that **`useEffectEvent` (19.2) replaces**: it exists to let an Effect call the freshest version of a callback without listing it as a dependency.

**Affected — five sites, not three:**

| File             | Line | What                                                                   |
| ---------------- | ---- | ---------------------------------------------------------------------- |
| `dialog.tsx`     | 67   | `onOpenChangeRef` — exists only for `closeWhen`                        |
| `sheet.tsx`      | 98   | same                                                                   |
| `data-table.tsx` | 178  | `onSelectionChangeRef` — the genuine `useEffectEvent` case             |
| `data-table.tsx` | 175  | `tableRef.current = table` — **same shape, missed on the first pass**  |
| `textarea.tsx`   | 37   | `externalRef.current = ref` — **same shape, missed on the first pass** |

`useEffectEvent` replaces only the Effect-callback case (`data-table.tsx:178`). The last two are not Effect callbacks: `tableRef` may not be needed at all, and `textarea.tsx:37` is a forwarded-ref merge that wants a different fix. Do not force the hook onto them — they are listed here because they are the same Rules-of-React violation and the same compiler bail-out (F3), not because they have the same cure.

**Cost:** _raises the floor_ to React 19.2, for the one site that uses the hook. Do it after the registry declares one.
**Note:** in `dialog.tsx` and `sheet.tsx` the whole block exists only to serve `closeWhen` (§9). Deleting `closeWhen` removes the problem instead of modernising it — the lazier fix, and the one to prefer.

### F3 — React Compiler is stable, and we still cannot depend on it

React Compiler 1.0 (Oct 2025) makes `useMemo` / `useCallback` unnecessary in most code. It is a **build-time** tool, and a copy-pasted component runs in **the consumer's build**. We cannot know whether it is enabled.

> **Rule: every component must be correct and adequately fast without the compiler, and merely faster with it.** Keep manual memoization where it is load-bearing (§1.4's context value); do not add any that is only decorative.

The corollary is stricter than it looks: **our components should follow the Rules of React closely enough that the compiler never bails out on them** — because a consumer who turns the compiler on gets nothing from a file it refuses to optimize. F2's render-time ref write is precisely such a bail-out.

### F4 — `<Activity>` is the right tool for hidden-but-alive UI

Radix's `Tabs.Content` unmounts inactive panels — documented Radix behavior, **not demonstrated by any test in this repo; confirm with a story before shipping the prop** — so scroll position, uncommitted form input, and any in-panel state are destroyed on every tab switch. `forceMount` keeps them mounted but also keeps them fully live. **`<Activity mode="hidden">` (19.2)** is the API for exactly this middle ground: state preserved, effects torn down, re-render deprioritized.

**Candidate:** `tabs.tsx`, behind an opt-in prop (`keepMounted`) — a default-off shortcut, per §2.
**Cost:** _raises the floor_ to React 19.2.

### F5 — `Button`'s `loading` prop reimplements what the platform gives free

React 19's `useFormStatus` is documented as a **design-system** hook: a submit button nested in a `<form>` can read the form's pending state directly, with no prop drilling and no wiring by the consumer.

```tsx
const { pending } = useFormStatus(); // true while the form's action runs
```

Today every consumer wires `loading` by hand for the most common case there is — a submit button in a form.

**Fix, in §2's shape:** keep `loading` as the explicit override; when it is not supplied and the button is a submit button, fall back to `useFormStatus().pending`.
**Honest caveats:** the hook returns `false` outside a `<form>` (harmless), and it must be called from a component _inside_ the form — `Button` always is. **`react-dom` becomes a declared dependency** of the button component.
**Cost:** additive at React 19.0.

### F6 — `DataTable`'s global filter re-filters synchronously on every keystroke

`setGlobalFilter` on every `onChange` re-runs filtering and re-renders the whole table in the same commit. `useDeferredValue` — React 18, no floor change — keeps typing responsive and lets the expensive pass lag by design.

**Cost:** additive.

### F7 — Lower priority, recorded so it is not lost

`avatar.tsx` carries a module-level `let hydrated = false` to work around a Radix `useIsHydrated` behavior under React 19 SSR (issue #291). **This is not a server-state leak** — `useEffect` never runs during SSR, so the flag stays `false` on the server — but it is invisible state shared across every Avatar instance in the module. It should carry a link to the upstream issue so it can be deleted when that is fixed, rather than surviving as folklore.

**Correction:** the comment is _not_ missing a reference — `avatar.tsx:41` already says "See #291". But **#291 is this repo's own issue** (`beaket/ui#291`, _"fix: Avatar.Image hydration mismatch in React 19 SSR"_), and it is **CLOSED** — so it can never signal that the workaround is safe to delete. What is missing is the **upstream** Radix issue, or an explicit note that no upstream tracking issue exists. Check whether the pinned `@radix-ui/react-avatar` still reproduces the behavior first; the answer may be that the flag simply goes.

---

# Part 5 — Checklist for a new component

1. **Name the change it absorbs.** Every prop maps to a row of the Part 1 table, or it does not ship.
2. Internal structure? → root + parts, one `Object.assign` (§1).
3. **Would the consumer pass the same value to more than one part?** Yes → flexible compound (context, with the five rules of §1.4). No → namespacing, and no provider (§1.3).
4. Behavior, or content in disguise? → content becomes children; sugar only _over_ a compositional path (§2).
5. Renders `<a>` or `<button>`? → it takes `asChild` (§3).
6. Every rendered element has a `data-slot` (§4).
7. Props extend `React.ComponentProps<…>`; hand-write the type where the component is our composition (§6).
8. Props type named `<Component>Props` and exported (§7).
9. Two or more variant axes → `cva`; role-named variants; `sm|md|lg` sizes (§8).
10. Custom shadow utilities selected by compound variant, never layered (§5).
11. Owns open/closed state → controlled + uncontrolled + dev warning, copied byte-identical (§9).
12. `className` last into `cn` (§5).
13. Logic component? → deep, narrow interface; hand control back instead of adding props (§11).
14. Then the `Required Checklist` in `CLAUDE.md`: story with `play`, registry entry, changeset.

---

# References

The named patterns above, in their original sources. Cited so a reviewer can check whether we are using a term the way its author meant it.

- **Information hiding / design for change** — D. L. Parnas, _On the Criteria To Be Used in Decomposing Systems into Modules_ (1972)
- **Mechanism, not policy** — Unix / X Window System design tradition
- **Open–Closed Principle** — Bertrand Meyer, _Object-Oriented Software Construction_ (1988)
- **Hyrum's Law** — <https://www.hyrumslaw.com/>
- **Growth vs. breakage** — Rich Hickey, _Spec-ulation_ (Clojure/conj 2016)
- **Deep modules** — John Ousterhout, _A Philosophy of Software Design_ (2018)
- **Anti-Corruption Layer / intention-revealing names** — Eric Evans, _Domain-Driven Design_ (2003)
- **Make illegal states unrepresentable** — Yaron Minsky (Jane Street), _Effective ML_; see also <https://fsharpforfunandprofit.com/posts/designing-with-types-making-illegal-states-unrepresentable/>
- **Compound components** (and why the dot is _not_ the pattern) — <https://kentcdodds.com/blog/compound-components-with-react-hooks>
- **Flexible compound components, control props, state reducer, prop getters** — Kent C. Dodds, _Advanced React Patterns_: <https://github.com/kentcdodds/advanced-react-patterns>
- **The classic pattern's direct-children limitation, and context's costs** — <https://www.smashingmagazine.com/2021/08/compound-components-react/> and <https://www.patterns.dev/react/compound-pattern/>
- **Pagination as a compound component (prior art)** — <https://ui.shadcn.com/docs/components/base/pagination>
- **Slot pattern / `asChild`** — <https://www.radix-ui.com/primitives/docs/utilities/slot> and <https://www.radix-ui.com/primitives/docs/guides/composition>
- **Progressive disclosure in API design** — Apple, _The craft of SwiftUI API design_ (WWDC22): <https://developer.apple.com/videos/play/wwdc2022/10059/>
- **Styling hooks / CSS Shadow Parts** — <https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Shadow_parts>
- **Variants / compound variants** — <https://cva.style/>; the same concept as **recipes** in <https://panda-css.com/docs/concepts/recipes>
- **Controlled vs. uncontrolled components** — React documentation
- **Open code / copy-paste distribution** — shadcn/ui: <https://ui.shadcn.com/docs/registry/getting-started>
- **React 19.2 release** (`<Activity>`, `useEffectEvent`, `cacheSignal`) — <https://github.com/facebook/react/releases/tag/v19.2.0>
- **React Compiler 1.0** — <https://react.dev/blog/2025/10/07/react-compiler-1>
- **`useFormStatus`** — <https://react.dev/reference/react-dom/hooks/useFormStatus>
- **React versions** — <https://react.dev/versions>
