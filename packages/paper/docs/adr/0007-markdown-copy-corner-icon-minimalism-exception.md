# 0007 — Markdown copy is always exposed as a corner icon, an explicit exception to visual minimalism

- **Status:** Accepted
- **Date:** 2026-06-15
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Markdown copy is always exposed as a corner icon, and this is an explicit exception to visual minimalism

## Context

This started from the requirement: "how do we export a document written in the editor so that an AI agent understands it best?" Two things surfaced during the grilling process.

First, **there is no output-format problem.** The document's source of truth is markdown text (CONTEXT.md), and the format an AI (LLM) understands best is also markdown — there is nothing to convert. Wrapping it in a code fence or a preamble actually makes the LLM misread it as "a code block to be displayed," so the optimal output is raw, unprocessed markdown exactly as it is.

Second, **there is no new copy logic to write either.** CM6's default copy handler serializes `state.sliceDoc`, not the DOM (the rendered grid). So even though the Table Widget permanently hides the `|` structural syntax from the screen (ADR-0002), Cmd+A → Cmd+C already places complete RAW markdown — including the `|` characters — on the clipboard. Even a partial selection that spans a table yields the source text rather than the rendered text (verified against a real copy event in the browser).

So what was missing was not a feature but only **a discoverable affordance that says "this is how you get RAW markdown out"** (confirmed with the user).

## Decision

We provide the **Markdown copy** action — which copies the entire document to the clipboard as raw, unprocessed markdown — through a single **always-visible corner icon** at the top-right of the editor. On click it copies the whole document regardless of the current selection, with a "Copied" toast for feedback. The ordinary Cmd+C (copy the selected range) is left untouched.

This is the **first deliberate exception** to CONTEXT.md's "lightness / visual minimalism (minimize persistent UI beyond text and cursor)." In a product that does not even give tables a persistent toolbar, we introduce a persistent UI element for the first time. We nail down the boundary of the exception as follows:

- **Allowed:** a single action that applies to the entire document (currently just Markdown copy). Such an action has no context to attach it to (no specific table, no specific line), so there is no natural place to surface it on hover/focus.
- **Still disallowed:** operations that have a context are exposed only on hover/focus, per the existing principle — the table grip menu, the edge `+` button, and so on. The expansion "we already have a corner icon, so it's fine to add a toolbar" is exactly the line this ADR holds.

## Icon discoverability — glyph and accessibility label

The affordance must convey the meaning "copies RAW markdown." The channel differs by consumer:

- For an **AI agent that reads the accessibility tree**, the button's `aria-label`/`title` ("Copy document as Markdown (for AI)") is read directly — it is already unambiguous, independent of the icon shape.
- For an **agent that only sees the human eye / a screenshot**, a generic copy glyph (a clipboard shape) reads as "just copy" and conveys the markdown meaning weakly. So we make the icon the **standard Markdown mark (an `M` plus `↓` inside a rounded rectangle)**, which signals "markdown" at a glance even without text.

In other words, discoverability is guaranteed at two layers: the semantic text (aria-label/title) is read by machines, and the Markdown mark is read by humans.

## Alternatives and reasons for rejection

- **A corner button that appears on hover** — with zero idle UI this is the most faithful to minimalism, but the AI handoff is a deliberate, global action ("hand off this whole document"), so we judged that always being visible is better for discoverability. User's choice.
- **A slash-command entry** — in CONTEXT.md the slash has the identity of an "insertion menu" at an empty position. Copy is not insertion, so the meaning is mismatched, and it is also not "the experience of pressing a button."
- **A keyboard shortcut (Cmd+Shift+C) only** — being the web-standard copy shortcut it is familiar to users, but it is invisible and therefore does not provide the discoverability of "AI-ready markdown comes out here." We keep the shortcut as a secondary affordance alongside the icon, but it is insufficient as the sole solution.

## The agent path — a lossless source mirror (a11y/DOM)

Right after the primary decision, we empirically measured "can an AI agent that drives the browser directly also receive this output?" The result was negative: when the agent clicks, the result goes to the **OS clipboard**, which the agent cannot read; and when it reads the page directly it receives a **lossy render** (the table `|` is gone, `**` is gone, UI and the toast are mixed in) — confirmed via read_page/get_page_text. In other words, the corner icon is fundamentally a human affordance.

So, to support agents as well, we added a **visually hidden live mirror**: a `<pre class="cm-md-source">` that holds the entire RAW markdown and is refreshed on every `docChanged`. The hiding uses a clip technique (`position:absolute; width:1px; clip-path:inset(50%); white-space:pre`) — **`display:none`/`visibility:hidden` are forbidden because they also remove the element from the accessibility tree**. Because it is a sibling element, it is independent of the decorations/widgets, so it can be refreshed safely outside the composing guard (ADR-0004).

Results per channel, validated empirically against a complex document (multiple code blocks, five-level nesting, a code block inside a list, triple-nested quotes, and a table with alignment / empty cells / escapes):

- **Human** (icon / Cmd+Shift+C → clipboard): byte-complete.
- **JS-capable agent** (reading the mirror's `textContent`/`innerText` directly): byte-complete — even indentation inside code blocks and nested lists is preserved (`innerText === doc`).
- **Generic text extraction** (Readability-style, get_page_text): receives the mirror but **normalizes leading whitespace per line**, which damages nested-list and indented-code structure. This is the extraction tool's behavior and cannot be fixed on our side (markdown requires real whitespace indentation, so workarounds like nbsp are not possible). → The recommended path is "read the mirror element directly."
- **Screenshot-only agent**: unsupported, since the mirror is not on screen (out of scope).

Discoverability: read_page exposes the mirror as a `region "Document Markdown source (for AI)"`, so an agent can find it by label and read that element's text.

## Out of scope — remaining extension points

The primary consumer is still the **human** (copy → paste into a chat). The screenshot-only agent, and the indentation loss of get_page_text-style extraction, are left unresolved — we will revise this ADR if and when they become necessary.

## Follow-up — per-code-block copy (2026-06-15)

We added a block-level action that copies only the code inside a code block to the clipboard (`codeBlockCopy.ts`; the code fence ```and the language line are excluded — extracted as the range of the`CodeText` child node). We note this explicitly because it is **the first case that tests the boundary this ADR drew**.

- **Always-visible exposure is a privilege reserved for the single global document action (Markdown copy) only.** Code copy is an operation bound to the context of "a specific block," so it belongs to the same class as the "still disallowed" items above (table menu, `+` button) → it is **exposed only on hover**. The fact that a corner icon now exists does not stretch contextual operations into persistent UI; we held that line as-is.
- **CM6 trap:** there is no wrapper DOM enclosing a block (the `.cm-content > .cm-line` siblings are laid out flat), so pure CSS `:hover` cannot cover a multi-line block (it responds only on the first line that holds the button, and `:has` turns on all blocks at once). So a ViewPlugin uses `mousemove → posAtCoords → find the enclosing FencedCode` and turns on only that block's button with `cm-code-copy-visible`. The toggle only touches the sibling button's class, leaving the decoration/widget structure unchanged → safe outside the composing guard (ADR-0004).
- **Anchor:** the button is attached to the first _content_ line (the opening/closing fence lines are collapsed to a 0.5em strip while the cursor is outside them, so they cannot hold a button — ADR-0009). When the cursor enters the block (touched), the fences unfold and the anchor shifts, so the button is attached in render mode only.
- **Shared clipboard semantics:** we extracted `markdownCopy.copyText` (clipboard write + silent failure) so that document copy and block copy use identical semantics. Feedback is a check icon on the button itself (~1.2s) instead of a toast — when a block is near the bottom of the document, a top toast is too far away.

The pure function (`extractFencedCodeText`) is pinned by regression tests (with/without a language, empty block, unclosed fence, multiple lines), and the click / clipboard / hover / DOM concerns were verified in the browser (ADR-0005).
