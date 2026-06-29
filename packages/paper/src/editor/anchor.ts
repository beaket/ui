import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";

// Anchor for selection-based annotations — provides mechanism only, delegates policy to the consumer (ADR-0014).
// beaket anchored to the *rendered plain text* (quote-highlights.ts), but we anchor to the **markdown source**
// (CONTEXT: single source of truth = markdown). So source↔source, simple and consistent, with no HTML/flat-text machinery.

/**
 * anchor = quote (source substring, primary key) + offset (source offset, candidate-selection hint).
 * end is derived as offset + quote.length (we don't store a redundant `to`).
 * prefix/suffix are reserved slots (C context anchor, ADR-0014 decision 7) — unused for now, but kept
 * from the start so that B→C is a backward-compatible extension. Anchor is pure JSON (strings and numbers only).
 */
export interface Anchor {
  quote: string;
  offset: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Captures a selection range as an anchor (ADR-0014 decision 3). Does not normalize — since we match
 * quote source↔source, the quote must also be source (stripping markers would break matching).
 * Only needs .state (sliceDoc + syntaxTree for the subsequent snap) — works and tests without a mounted view.
 */
// Inline marker tokens that get hidden (same set as inlineSyntaxHiding) — snap when an endpoint falls inside one.
const SNAP_MARK_NODES = new Set([
  "EmphasisMark",
  "CodeMark",
  "StrikethroughMark",
  "LinkMark",
  "URL",
]);

/** Returns the node if pos is *strictly inside* a hidden marker token, otherwise null. */
function markStrictlyAt(state: EditorState, pos: number): { from: number; to: number } | null {
  for (let n: SyntaxNode | null = syntaxTree(state).resolveInner(pos); n; n = n.parent) {
    if (SNAP_MARK_NODES.has(n.name) && n.from < pos && pos < n.to)
      return { from: n.from, to: n.to };
  }
  return null;
}

export function createAnchor(state: EditorState, from: number, to: number): Anchor {
  // If an endpoint falls inside a hidden marker, snap it *toward the visible content* to exclude the
  // partial marker (decision 3) — capturing a clean `bold` instead of a messy quote like `*bold**`.
  // A plain visible selection falls on token boundaries, so it's unchanged. Pull the start to the marker's
  // right edge (content) and the end to the marker's left edge (content).
  const fromMark = markStrictlyAt(state, from);
  const toMark = markStrictlyAt(state, to);
  const snappedFrom = fromMark ? fromMark.to : from;
  let snappedTo = toMark ? toMark.from : to;
  // If the selection is entirely inside a marker and the endpoints cross, collapse to an empty anchor (no visible content).
  if (snappedFrom > snappedTo) snappedTo = snappedFrom;
  return { quote: state.sliceDoc(snappedFrom, snappedTo), offset: snappedFrom };
}

/** Three states per anchor (ADR-0014 decision 5). Don't collapse approximate into exact/orphaned — different confidence means different UX. */
export type AnchorStatus = "exact" | "approximate" | "orphaned";

/** Re-resolve result — gives from/to alongside the status since the decoration layer uses positions. orphaned has no position. */
export type ResolvedAnchor =
  { status: "exact" | "approximate"; from: number; to: number } | { status: "orphaned" };

// Ported tuning constants (beaket quote-highlights.ts). Named so they can be adjusted after observing real orphan rates.
const FUZZY_RADIUS_FLOOR = 120; // Lower bound on the search radius around offset — ties perf to quote length, not doc length
const FUZZY_MIN_QUOTE_LEN = 12; // Below this, Levenshtein is too noisy → no approximation
const FUZZY_MAX_RATIO = 0.25; // Reject if edit distance > 25% * qLen

/**
 * Re-resolves an anchor from quote+offset on save/reload (ADR-0014). During a session CM6 mapPos keeps up,
 * so this function isn't needed — it's only used when positions drift (saved↔current doc, deletions, etc.).
 * exact match (candidate closest to offset) → bounded fuzzy → orphaned.
 */
export function resolveAnchor(doc: string, anchor: Anchor): ResolvedAnchor {
  const { quote, offset } = anchor;
  if (quote.length === 0) return { status: "orphaned" }; // An empty quote can't be anchored

  const exact = findClosestExact(doc, quote, offset);
  if (exact >= 0) return { status: "exact", from: exact, to: exact + quote.length };

  const approx = findApproximate(doc, quote, offset);
  if (approx) return { status: "approximate", from: approx.from, to: approx.to };

  return { status: "orphaned" };
}

/** Among all occurrences of quote, the start position closest to offset (-1 if none). */
function findClosestExact(doc: string, quote: string, offset: number): number {
  let best = -1;
  let bestDist = Infinity;
  for (let idx = doc.indexOf(quote); idx >= 0; idx = doc.indexOf(quote, idx + 1)) {
    const dist = Math.abs(idx - offset);
    if (dist < bestDist) {
      bestDist = dist;
      best = idx;
    }
  }
  return best;
}

/**
 * When exact matching fails, slides a window around the offset hint to find the minimum-Levenshtein span (ported from beaket).
 * Short quotes aren't approximated — in the source-based port, if exact matching (global) already failed, bounded
 * exact matching fails too, so approximating a short quote is structurally impossible → straight to orphaned.
 */
function findApproximate(
  doc: string,
  quote: string,
  offset: number,
): { from: number; to: number } | null {
  const qLen = quote.length;
  if (qLen < FUZZY_MIN_QUOTE_LEN) return null;

  const radius = Math.max(qLen, FUZZY_RADIUS_FLOOR);
  const searchStart = Math.max(0, offset - radius);
  const searchEnd = Math.min(doc.length, offset + radius + qLen);
  const maxAllowed = Math.floor(qLen * FUZZY_MAX_RATIO);

  let bestDist = maxAllowed + 1;
  let bestStart = -1;
  let bestEnd = -1;
  for (let start = searchStart; start < searchEnd; start++) {
    // qLen, ±20% windows absorb small insertions/deletions.
    const lengths = [qLen, Math.max(1, Math.floor(qLen * 0.8)), Math.ceil(qLen * 1.2)];
    for (const winLen of lengths) {
      const end = start + winLen;
      if (end > searchEnd) continue;
      const dist = boundedLevenshtein(doc.slice(start, end), quote, bestDist);
      if (dist < bestDist) {
        bestDist = dist;
        bestStart = start;
        bestEnd = end;
        if (dist === 0) break;
      }
    }
    if (bestDist === 0) break;
  }

  if (bestStart < 0 || bestDist > maxAllowed) return null;
  return { from: bestStart, to: bestEnd };
}

/**
 * Levenshtein distance with a ceiling-based early exit. When the distance definitively exceeds the ceiling,
 * returns ceiling+1 to cut obvious non-match work in the inner loop (ported from beaket, pure function).
 */
function boundedLevenshtein(a: string, b: string, ceiling: number): number {
  if (Math.abs(a.length - b.length) > ceiling) return ceiling + 1;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > ceiling) return ceiling + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}
