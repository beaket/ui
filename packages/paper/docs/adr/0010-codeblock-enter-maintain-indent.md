# 0010 — Enter inside a code block bypasses language-syntax auto-indentation and only "maintains the current line's indentation"

- **Status:** Accepted
- **Date:** 2026-06-14
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Enter inside a code block bypasses language-syntax auto-indentation and only "maintains the current line's indentation"

## Context

Per ADR-0006, code blocks lazy-load a language parser through `markdown({ codeLanguages: languages })`. A side effect of this is that a loaded language parser (such as python) contributes **its `indentService`, which adds syntax-based automatic indentation inside the code block.** Because the default Enter (`insertNewlineAndIndent`) invokes this service, the line after `def f():` is automatically indented, and as nesting deepens the indentation **accumulates** line by line. There is also a secondary problem: if you type the closing ` ``` ` after a deeply indented line, it ends up indented by four or more spaces and is no longer recognized as a fence.

The way this was discovered was itself the trap (a reinforcement of ADR-0005): the behavior reproduces **only in the browser** — the jsdom test environment does not lazy-load the language parser, so its `indentService` is empty and no accumulation appears. It was confirmed directly by injecting the exact source into the browser via `window.__view` (exposed in DEV).

## Decision

When the cursor is on a **content line of a fenced code block**, we intercept Enter at a higher priority than `defaultKeymap` (`Prec.high`) and perform **only "line break + copy the leading whitespace of the current line"** (`src/editor/extensions/code-block-enter.ts`). Because this does not pass through the language `indentService`, no syntax-based indentation is added, and the indentation is maintained across lines exactly as much as the user typed — predictable, with no accumulation.

The cases where we do not intervene (yielding to default behavior): a fence delimiter (` ``` `/`~~~`) line, outside a code block, a non-empty selection, and **during IME composition (`view.composing`)**. Yielding during composition follows the first-class CJK principle that Enter must act only as a composition commit (the spirit of ADR-0004).

## Trade-offs and rejected alternatives

We **gave up** IDE-style syntactic auto-indentation inside code blocks (for example, an automatic +1 level after a `:`). We are a markdown writing tool, not a code editor (CONTEXT.md: simplicity and lightness), and we judged that predictability takes precedence over IDE convenience. The "keep language auto-indent alive but only prevent accumulation" alternative was rejected because it is more complex and the per-language behavior varies too much — if it becomes necessary, this ADR will be revised.

## Tests

`code-block-enter.test.ts` — indentation maintained, no accumulation across successive Enters, no intervention on a fence delimiter, no intervention outside a code block, no intervention with a selection range. Because jsdom does not load the language parser, this test only pins the "maintain contract"; it does not reproduce the browser's `indentService` accumulation itself — that final confirmation is the responsibility of the `window.__view` browser verification (the same structure as the jsdom limitation in ADR-0005).
