import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { createAnchor, resolveAnchor } from "./anchor";
import { markdownExtension } from "./extensions/markdown";

// Anchor capture contract (ADR-0014 decisions 2·3). Coordinate-independent pure functions → deterministic unit tests (ADR-0005).
// anchor = quote (source substring) + offset (source offset). end = offset + quote.length (derived, not stored).
// createAnchor only needs .state — tested without a mounted view.

function stateOf(doc: string): EditorState {
  return EditorState.create({ doc });
}

/** State with a populated syntaxTree (snapping needs the syntax tree to identify mark nodes). */
function mdStateOf(doc: string): EditorState {
  const state = EditorState.create({ doc, extensions: markdownExtension() });
  ensureSyntaxTree(state, doc.length, 5000);
  return state;
}

describe("createAnchor — core", () => {
  it("captures quote = source slice, offset = from", () => {
    const s = stateOf("The quick brown fox");
    const a = createAnchor(s, 4, 9); // "quick"
    expect(a.quote).toBe("quick");
    expect(a.offset).toBe(4);
  });

  it("derives end as offset + quote.length (does not store a redundant to)", () => {
    const s = stateOf("가나다라마");
    const a = createAnchor(s, 1, 4); // "나다라"
    expect(a.offset + a.quote.length).toBe(4);
    expect(a).not.toHaveProperty("to");
  });

  it("does not normalize quote — source as-is including hidden markers (source↔source matching)", () => {
    const s = stateOf("a **bold** b");
    const a = createAnchor(s, 2, 10); // "**bold**" — includes markers
    expect(a.quote).toBe("**bold**");
  });

  it("prefix/suffix slots are in the type from the start but left empty (B→C backward compat, decision 7)", () => {
    const s = stateOf("hello");
    const a = createAnchor(s, 0, 5);
    expect(a.prefix).toBeUndefined();
    expect(a.suffix).toBeUndefined();
  });

  it("empty selection (from===to) yields an empty-string quote", () => {
    const s = stateOf("hello");
    const a = createAnchor(s, 2, 2);
    expect(a.quote).toBe("");
    expect(a.offset).toBe(2);
  });
});

describe("createAnchor — hidden marker snap (decision 3)", () => {
  // 'a **bold** b' : 'a '=0..2, '**'=2..4, 'bold'=4..8, '**'=8..10, ' b'=10..12
  it("does not snap a plain visible selection (boundary outside markers)", () => {
    const a = createAnchor(mdStateOf("a **bold** b"), 4, 8); // "bold"
    expect(a).toMatchObject({ quote: "bold", offset: 4 });
  });

  it("snaps to content, excluding the marker, when the start falls inside the opening marker", () => {
    const a = createAnchor(mdStateOf("a **bold** b"), 3, 8); // start between '**' (3)
    expect(a).toMatchObject({ quote: "bold", offset: 4 }); // partial marker excluded → clean
  });

  it("snaps to content, excluding the marker, when the end falls inside the closing marker", () => {
    const a = createAnchor(mdStateOf("a **bold** b"), 4, 9); // end between the closing '**' (9)
    expect(a).toMatchObject({ quote: "bold", offset: 4 });
  });

  it("keeps only the visible content even when both ends are partial markers (the ADR `*bold**` case)", () => {
    const a = createAnchor(mdStateOf("a **bold** b"), 3, 9); // start inside '**' (3), end inside '**' (9)
    expect(a).toMatchObject({ quote: "bold", offset: 4 });
  });

  it("does not snap a selection on inline-code backtick boundaries", () => {
    // 'x `c` y' : 'x '=0..2, '`'=2..3, 'c'=3..4, '`'=4..5
    const a = createAnchor(mdStateOf("x `c` y"), 3, 4); // "c", boundary — no snap
    expect(a.quote).toBe("c");
  });

  it("does not snap when there is no markdown syntax (plain text)", () => {
    const a = createAnchor(mdStateOf("plain text here"), 6, 10); // "text"
    expect(a).toMatchObject({ quote: "text", offset: 6 });
  });
});

// resolveAnchor re-resolve contract (ADR-0014 decisions 5·2). Ported beaket quote-highlights.ts *source-based*:
// removes the rendered-plain-text↔HTML machinery and carries over only the three states — exact match (candidate
// closest to offset) → bounded fuzzy Levenshtein → orphaned — and the tuning constants (radius/short-quote cutoff/25% threshold).
// Coordinate-independent pure functions (doc string + anchor → status/position) → deterministic unit tests (ADR-0005).

describe("resolveAnchor — exact", () => {
  it("returns exact + position when present exactly at offset", () => {
    const r = resolveAnchor("The quick brown fox", { quote: "quick", offset: 4 });
    expect(r).toEqual({ status: "exact", from: 4, to: 9 });
  });

  it("follows to exact (actual position) when an edit before it shifts the position but quote still exists", () => {
    // offset is the old 4, but "PRE " inserted before puts it actually at 8
    const r = resolveAnchor("PRE The quick brown fox", { quote: "quick", offset: 4 });
    expect(r).toEqual({ status: "exact", from: 8, to: 13 });
  });

  it("picks the candidate closest to offset when there are several", () => {
    // "cat" is at both 0 and 20. offset 18 → picks the later one (20)
    const doc = "cat ............... cat";
    const r = resolveAnchor(doc, { quote: "cat", offset: 18 });
    expect(r).toEqual({ status: "exact", from: 20, to: 23 });
  });

  it("works when offset is 0 / at a document boundary", () => {
    const r = resolveAnchor("hello world", { quote: "hello", offset: 0 });
    expect(r).toEqual({ status: "exact", from: 0, to: 5 });
  });
});

describe("resolveAnchor — approximate", () => {
  it("returns approximate + position when the quote was lightly edited but within threshold", () => {
    // anchor is "The quick brown fox jumps" (25 chars), body is "...fox leaps..." (3 substitutions ≤ 25%=6)
    const doc = "The quick brown fox leaps over the lazy dog";
    const r = resolveAnchor(doc, { quote: "The quick brown fox jumps", offset: 0 });
    expect(r.status).toBe("approximate");
    if (r.status !== "orphaned") {
      expect(doc.slice(r.from, r.to)).toBe("The quick brown fox leaps");
    }
  });

  it("rejects differences exceeding the threshold (25%) → orphaned", () => {
    const r = resolveAnchor("completely unrelated content here", {
      quote: "The quick brown fox jumps over the lazy dog",
      offset: 0,
    });
    expect(r.status).toBe("orphaned");
  });
});

describe("resolveAnchor — orphaned", () => {
  it("orphaned when the quote text was deleted", () => {
    const r = resolveAnchor("only some other words remain", { quote: "deleted phrase", offset: 5 });
    expect(r).toEqual({ status: "orphaned" });
  });

  it("short quote (<12 chars) goes orphaned without fuzzy on exact-match failure (Levenshtein not trustworthy)", () => {
    // "hella" is not in the body and is under 11 chars → no approximation attempted
    const r = resolveAnchor("hello world", { quote: "hella", offset: 0 });
    expect(r).toEqual({ status: "orphaned" });
  });

  it("empty quote can't be anchored → orphaned", () => {
    const r = resolveAnchor("hello", { quote: "", offset: 0 });
    expect(r).toEqual({ status: "orphaned" });
  });
});

describe("resolveAnchor — round-trip (the anchor survives edits)", () => {
  it("capture with createAnchor → recovers as approximate even after the anchored region is lightly edited", () => {
    const doc = "note: The quick brown fox jumps over the lazy dog";
    const from = doc.indexOf("The quick brown fox jumps");
    const anchor = createAnchor(stateOf(doc), from, from + "The quick brown fox jumps".length);
    // Re-resolve after the same region is edited "jumps"→"leaps" (no char-count change before it)
    const edited = doc.replace("jumps", "leaps");
    const r = resolveAnchor(edited, anchor);
    expect(r.status).toBe("approximate");
    if (r.status !== "orphaned")
      expect(edited.slice(r.from, r.to)).toBe("The quick brown fox leaps");
  });

  it("capture → follows to exact even when text inserted before shifts it", () => {
    const doc = "The quick brown fox";
    const anchor = createAnchor(stateOf(doc), 4, 9); // "quick"
    const edited = "PREFIX " + doc;
    const r = resolveAnchor(edited, anchor);
    expect(r).toEqual({ status: "exact", from: 11, to: 16 });
  });
});
