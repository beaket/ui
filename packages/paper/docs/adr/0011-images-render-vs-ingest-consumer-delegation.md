# 0011 — Images separate "render" from "ingest": render inside the source model, delegate ingest to the consumer

- **Status:** Accepted
- **Date:** 2026-06-16
- **Provenance:** Imported & translated from the `sandbox-beaket-editor` prototype on 2026-06-21.
- **Supersedes:** —
- **Superseded-by:** —
- **Amends:** —

---

# Images separate "render" from "ingest" — render inside the source model, delegate ingest to the consumer

## Context

This started from "how should we represent images?" (displaying web images, drag-and-drop, component ergonomics, with Typora as a reference). While working through it, it became clear that this is in fact **two problems with entirely different difficulty and scope**.

- **render**: the URL is _already inside the markdown text_ (`![alt](url)`). This fits the model where markdown is the source of truth (DECISIONS.md) 100% — there is nothing to decide.
- **ingest**: when a local file is dropped or pasted, what we hold is **only the binary (a File), with no URL**. To produce a URL, we would have to **store it somewhere**, but **persistence is out of the first-pass scope** (DECISIONS.md: an in-memory sandbox). This is exactly where it gets stuck.

**Why we cannot copy Typora verbatim:** Typora's four paths (referencing the original path, copying into a folder, uploading to a server, and the clipboard) all work because they rely on **a desktop app's filesystem access**. We are a **browser component with no storage**, so what is honestly achievable is only (a) rendering web URLs and (b) delegating the binary to the consumer.

## Decision 1 — separate render/ingest, and do render only in the first pass

Render is self-contained within the editor (the URL is already in the source). Ingest depends on a storage policy that the editor **cannot decide**, so we separate it and hand it to the consumer (Decision 3). If you treat both problems as one lump, "where do we upload on drop?" ends up blocking render as well — splitting them lets render work immediately.

## Decision 2 — render reuses the "horizontal rule `---`" pattern rather than a table widget

A line that is a stand-alone image (`![alt](url)` is the whole line) is rendered when the cursor is outside it, and exposes the source when the cursor lands on it. This "the line with the cursor = source" rule already exists for the horizontal rule in `blockSyntaxHiding` (ADR-0009) — replacing the HR's `::after` horizontal rule with an `<img>` widget is exactly what an image is.

- We attach **`guardedDecorations` (a ViewPlugin) + an inline `Decoration.replace({widget})`** over the line range. The table widget's complexity (a StateField, `atomicRanges`, `coordsAt`) is **unnecessary** here — reveal-on-cursor and the composing guard (ADR-0004) are inherited for free through the same mechanism as the HR. (The table needs atomic ranges because it is permanently hidden; the image is the exact opposite, because it must expose the source.)
- Mid-sentence inline images are not rendered and keep their source (only stand-alone block images are in the first-pass scope).
- Because asynchronous loading changes the height, we refresh the height model from `img.onload` via `view.requestMeasure()` (ADR-0003, preventing scroll jumps). A load failure falls back to an alt-text surface box (ADR-0009 tokens).
- **Remaining limitation:** `estimatedHeight` is not set — loading a large image outside the viewport can cause a scroll jump (on-screen, requestMeasure corrects it). If it becomes a problem, we will update this ADR.

## Decision 3 — ingest is delegated to a consumer callback, with a default of a `blob:` in-session URL

The editor provides only the mechanism (intercepting drop/paste + inserting `![alt](url)`); the policy (where to store?) is decided by the consumer. This is the **mechanism-in-editor / policy-in-consumer** split — it extends ADR-0007's **"a conduit per consuming party"** philosophy into the ingest direction: for what the editor cannot decide, it only opens a conduit and passes it through (consumer delegation).

- `createEditor(el, { onInsertImage?: (file: File) => string | Promise<string> })` — once the consumer uploads/stores and returns a URL, the editor inserts `![filename](url)` **as a stand-alone-line block in a single transaction** (one undo step). Async (upload) is allowed.
- **The default (when no callback is given) = in-session render via a `blob:` URL from `URL.createObjectURL`.** This is consistent with the in-memory sandbox character — it is honest that it breaks on refresh.
- Insertion isolates the image onto its own line (if mid-line, it splits upward + always trails a newline) and places the cursor on the **line below** → because there is no cursor on the image line, Decision 2 renders it immediately ("drop and the image appears").
- **By design (not an oversight):** with the blob default, a `blob:` URL enters the document, so ADR-0007's markdown copy (the AI handoff) exports a URL that cannot be resolved outside the session. This is an inherent property of the ephemeral-blob choice the user accepted (it also breaks on refresh), and it is resolved once the consumer supplies a permanent URL.

## Decision 4 — drag indicator: snap to line boundaries + "block box" coordinates

If the drop location is invisible, the user misses. We make **"the visible insertion line = the actual insertion position"** match — we snap the drop coordinate to the nearest line boundary (upper half of a line = above the line, lower half = below the line) and draw an accent line at that boundary (ADR-0009 signal-blue, 2px, radius 0). `drop` uses the **same snap function** as `dragover`, so it lands exactly where it was shown. A plain "region highlight" was rejected because it cannot tell you "exactly where".

- The indicator is **pure overlay DOM** (`position:fixed`), not editor state, so it is unrelated to decoration recomputation and the composing guard (lightweight). On `dragover` it also shows the copy cursor via `dropEffect='copy'`. Flicker is prevented by hiding on `dragleave` only when the drag fully leaves the editor (relatedTarget outside) — flicker from entering over a child is soon restored by `dragover`.
- **An external file drop only fires if `dragover`'s default behavior is prevented (`preventDefault`)** — otherwise the browser opens the file.

> **Coordinate trap (found via a screenshot of a real user drop) — glyph box vs block box:** when we took the indicator's Y from `coordsAtPos` (= the **glyph** boundary), on lines with large padding such as headings **the line crossed the characters.** The glyph box is inside the padding, so the boundary fell on top of the text. **Fix:** use the top/bottom of `view.lineBlockAt(pos)` (= the **line block box**, padding included), converted to client coordinates via `view.documentTop`. The boundary then falls in the gap between blocks (measured: hovering a heading whose glyph range is 277–303 still places the line at 251 = the block-box top). This is **the same flavor of coordinate discipline** as ADR-0009's "padding is included in the line box so coordinates are accurate, but margins cannot be measured by CM6".

## Alternatives and rejections

- **Image = the table widget pattern (block StateField + atomic + coordsAt)** — reveal-on-cursor is the crux, but the table is permanently hidden, the exact opposite. The HR pattern (Decision 2) already solves reveal → the table's complexity is unnecessary.
- **The editor handling ingest directly (built-in server upload / folder copy)** — storage is out of scope, and a browser has no filesystem. Consumer delegation is the only honest conduit (Decision 3).
- **Sizing (both syntax and a resize UI)** — deferred for the first pass. ① The `![alt|300]` syntax is outside the CommonMark + GFM dialect (DECISIONS.md), so we do not invent it. ② A resize UI has not yet cleared the bar of "there must be a reason to add it" (DECISIONS.md lightness) — we just added web-URL display and have not observed real demand. **The same as GitHub's precedent** — there is no dedicated resize UI, and size is delegated to text (`<img width="300">` HTML). Note that "GitHub does not resize" is a misconception (it can, via the HTML attribute). The actual violation is not the resize _feature_ but **a separate model where the size information is not serialized into the markdown text** (a violation of the core rule). The condition for resuming: if it follows the same **hover/focus reveal + text serialization** pattern as the table grips, it is consistent with the principles → we update this ADR then.
- **Highlighting the whole drop region** — it can say "drop here and it goes in" but not "exactly where", so it cannot prevent misses (Decision 4's snapped insertion line solves this).

## Implementation notes (CJK first-class / testing)

- Render goes through `guardedDecorations`, so it automatically satisfies the composing guard (ADR-0004) contract — with the widget's `eq()` (same url/alt/title → DOM reuse), the DOM is unchanged during composition. Verified with a synthetic IME (zero exceptions on docChange during composition, the widget keeps the same node).
- **Deterministic contract tests (ADR-0005):** the core of ingest (resolver → insert → render) is unit-tested in jsdom via the pure functions `handleImageFiles` / `insertImageBlock` / `altFromFilename`, without synthesizing events or a DataTransfer. `parseImage` is also pure.
- **Coordinate-dependent logic is impossible in jsdom (coordinates are 0) → substituted with browser verification:** render's reveal (click and arrow keys both ways), ingest event firing (synthesized drop/paste), and the drag indicator's snap / block-box coordinates / cleanup. All measured in the running dev server.
- **Remaining real-world verification:** an actual OS file drag and an actual clipboard Cmd+V cannot be 100% reproduced by synthesis — confirmed via a real user drop / real paste (the same limitation as real IME typing). The drag-indicator coordinate bug was caught exactly in such a real drop.
