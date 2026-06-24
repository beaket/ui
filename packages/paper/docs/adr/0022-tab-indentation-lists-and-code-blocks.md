# 0022 — Tab indentation for lists and code blocks (scoped, never globally bound)

- **Status:** Accepted
- **Date:** 2026-06-24
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

## Context

Tab was bound in only two places: the popup menus (slash `/`, triggers `@`/`[[`) consume it to
select/complete, and a blockquote line uses it to change quote depth (ADR-0009 decision 6). Everywhere
else Tab fell through to the browser default — which on a content-editable surface moves focus _out of
the editor_. So a writer pressing Tab to indent a list item or to indent code was instead flung out of
the editor (the same "the expected behavior doesn't happen" feedback that drove ADR-0009 decision 6 to
extend the blockquote handler to content lines).

We want the two natural Tab behaviors a writer expects:

- **Lists** — Tab nests the item one level deeper, Shift+Tab lifts it one level shallower
  (Obsidian/Typora convention).
- **Fenced code blocks** — VSCode-style indent: Tab indents (insert a unit, or indent every line of a
  multi-line selection), Shift+Tab outdents.

Table-cell Tab navigation (spreadsheet-style next/prev cell) and code-block auto-closing brackets were
raised and **deferred** — the former is subview _navigation_ rather than a text edit, the latter
interacts with the existing `wrap-selection` input handler and the IME guard. Each is its own follow-up.

## Decision

### 1. Tab is never bound globally — each handler is context-scoped and yields

We deliberately do **not** add `@codemirror/commands`' `indentWithTab`. A global Tab binding traps
keyboard focus inside the editor (an accessibility regression) and would, on a plain paragraph,
silently turn text into an indented code block (4 leading spaces = code block in CommonMark). Every
Tab handler instead returns `false` when the cursor is not in its context, preserving the default
focus-move outside editable structures. Prose is left entirely alone.

### 2. Lists — nest under the preceding sibling, by the **syntax tree** (not a regex)

`extensions/list-keys.ts` (`listKeymap`, `Prec.highest`). Valid markdown nesting depth is not "any
number of spaces": a nested item must be indented to exactly the **content column of the item it nests
under** (2 under `- `, 3 under `1. `). So, unlike the blockquote handler's regex, the list handler
reads the real `syntaxTree`:

- **Tab** nests the item under its **preceding sibling** `ListItem`. The first item of a list has no
  parent to nest under, so Tab there is a **consumed no-op** (not a focus escape).
- **Shift+Tab**: if the item is nested, lift it to the grandparent level (sibling of its parent item);
  at top level, **strip the marker** (lift it out of the list into a paragraph).
- The **whole item subtree** (continuation lines + child items) shifts by a uniform delta, so relative
  nesting is preserved across multi-line items.
- **Blockquote-aware**: a list inside a blockquote lives _after_ the `> ` prefix, so all indent columns
  are measured, and all edits applied, relative to each line's quote prefix — never the raw line start
  (which would corrupt the `>` markers).

### 3. Code blocks — delegate to the stock CM commands, guarded

`extensions/code-block-enter.ts` adds Tab and Shift+Tab → `indentLess`, each guarded so it fires only
when **both ends of the selection** sit on a code **content** line (the fence delimiter lines are
excluded, for parity with the Enter handler, so Tab can't push a ` ``` ` past 3 spaces and break the
fence). Tab uses `insertIndentUnit`: an empty selection inserts one indent **unit of spaces** at the
cursor, a non-empty selection defers to `indentMore` (indents every spanned line). We do **not** use the
stock `insertTab` — it inserts a literal `\t` on an empty selection (only its multi-line branch uses the
unit), and a hard tab is inconsistent with our spaces-everywhere indentation. `indentUnit` is left at
its default (2 spaces) rather than set globally (a global `indentUnit` would also feed the markdown
indent service).

### 4. Precedence — the one interaction that had to be resolved

A list line **inside** a blockquote is matched by both the list and the blockquote handlers. The list
intent is the more specific one, so the list must win. Wiring (`create-editor.ts`), all at
`Prec.highest` except code which is `Prec.high`:

`slashCommand` → `triggerMenu` → **`listKeymap`** → `blockquoteKeymap` … then `codeBlockEnter`
(`Prec.high`).

At equal precedence the earlier-registered keymap wins, so: an open menu's Tab beats the list (the menu
handlers return `false` when closed); the list beats the blockquote on a quoted list line; and because
both the list and blockquote handlers **yield inside a fenced code block** (they return `null`/`false`
when a `FencedCode`/`CodeBlock` ancestor is seen first), Tab inside a code block — even one nested in a
list or quote — falls through to `codeBlockEnter` at `Prec.high`.

## Trade-offs and rejected alternatives

- **Global `indentWithTab`** — rejected (focus trap + the prose→code-block hazard above).
- **"Insert N spaces" for lists** — rejected: it passes a space-count test while producing invalid
  nesting or a code block. The discriminating check is that the parsed tree nests deeper.
- **v1 limits (accepted, may be revised):** ordered-list numbers are not renumbered on indent/outdent
  (the source author owns the numbering); a **range selection** in a list and an **in-code-block list
  line** fall through; top-level Shift+Tab strips only the first line's marker. These mirror the
  blockquote handler's single-line content-line limitation.
- **Table-cell Tab navigation** and **code-block auto-brackets** — deferred to follow-ups (above).

## Tests

`list-keys.test.ts` — Tab nesting under a preceding sibling (bullet + ordered), first-item no-op,
subtree carry, Shift+Tab lift-to-parent and top-level marker strip, subtree carry, yields (prose,
in-code-block, range selection), and keymap integration including a **list line inside a blockquote**
(indents the list, not the quote). The nesting assertions check the **parsed `ListItem` depth**, not
the space count (per the decision). `code-block-enter.test.ts` — Tab/Shift+Tab indent/outdent inside a
fence, yields outside. As with ADR-0010, jsdom does not lazy-load language parsers, so the felt
multi-line/IME behavior is confirmed by real-browser verification.
