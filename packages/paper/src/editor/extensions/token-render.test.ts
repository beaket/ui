import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { markdownExtension } from "./markdown";
import { findTokenMatches, tokenAtEdge, type TokenSpec } from "./token-render";

// Atomic token rendering contract (ADR-0017). findTokenMatches / tokenAtEdge are pure and
// coordinate-independent, so they are deterministic jsdom contract-test targets (ADR-0005). The widget
// DOM, placement, and the live atomic cursor/backspace behavior are carved out for the browser
// (invariant #4) — verified in the playground. These tests assert on the resolved range structure,
// independent of how a token is finally rendered.

// A mention token like the trigger API inserts: [@Name](user:id). The capture group carries identity.
const mention: TokenSpec = {
  pattern: /\[@([^\]]+)\]\(user:([^)]+)\)/,
  render: (m) => ({ label: `@${m[1]}` }),
};

const stateOf = (doc: string) => EditorState.create({ doc, extensions: [markdownExtension()] });

const ranges = (doc: string, specs: TokenSpec[] = [mention]) => {
  const state = stateOf(doc);
  return findTokenMatches(state, specs, 0, doc.length).map((t) => ({
    from: t.from,
    to: t.to,
    label: t.view.label,
  }));
};

describe("findTokenMatches — matching", () => {
  it("matches an inserted mention and reports its source range + the rendered label", () => {
    const doc = "hi [@Grace Hopper](user:u_003) there";
    expect(ranges(doc)).toEqual([{ from: 3, to: 30, label: "@Grace Hopper" }]);
  });

  it("matches multiple tokens on one line", () => {
    const doc = "[@A](user:1) and [@B](user:2)";
    expect(ranges(doc).map((r) => r.label)).toEqual(["@A", "@B"]);
  });

  it("matches tokens across multiple lines", () => {
    const doc = "[@A](user:1)\ntext\n[@B](user:2)";
    expect(ranges(doc).map((r) => r.label)).toEqual(["@A", "@B"]);
  });

  it("returns nothing when no pattern matches", () => {
    expect(ranges("just plain text")).toEqual([]);
  });
});

describe("findTokenMatches — code is never atomized (a 1.0 correctness rule)", () => {
  it("skips a mention inside inline code", () => {
    expect(ranges("`[@Grace](user:u_003)`")).toEqual([]);
  });

  it("skips a mention inside a fenced code block", () => {
    const doc = "```\n[@Grace](user:u_003)\n```";
    expect(ranges(doc)).toEqual([]);
  });

  it("still matches a real mention on a line outside code", () => {
    const doc = "`code`\n[@Grace](user:u_003)";
    expect(ranges(doc).map((r) => r.label)).toEqual(["@Grace"]);
  });
});

describe("findTokenMatches — overlap resolution (no conflicting replace ranges)", () => {
  it("keeps the earlier-position match and drops one that overlaps it", () => {
    // Two specs both matching the same span — only one range survives, so the decoration set is conflict-free.
    const wide: TokenSpec = {
      pattern: /\[@[^\]]+\]\(user:[^)]+\)/,
      render: () => ({ label: "wide" }),
    };
    const narrow: TokenSpec = { pattern: /@([^\]]+)/, render: () => ({ label: "narrow" }) };
    const result = ranges("[@Grace](user:u_003)", [wide, narrow]);
    expect(result).toHaveLength(1);
  });
});

describe("tokenAtEdge — the Backspace (trailing) / Delete (leading) targets", () => {
  const doc = "x [@Grace Hopper](user:u_003)";
  const range = { from: 2, to: doc.length };

  it("finds the token at its trailing edge (the Backspace target)", () => {
    expect(tokenAtEdge(stateOf(doc), [mention], doc.length, "to")).toEqual(range);
  });

  it("finds the token at its leading edge (the Delete target — where a click lands)", () => {
    expect(tokenAtEdge(stateOf(doc), [mention], 2, "from")).toEqual(range);
  });

  it("returns null when the cursor is at neither edge, or the wrong edge", () => {
    expect(tokenAtEdge(stateOf(doc), [mention], 5, "to")).toBeNull();
    expect(tokenAtEdge(stateOf(doc), [mention], 2, "to")).toBeNull(); // leading edge ≠ trailing target
    expect(tokenAtEdge(stateOf(doc), [mention], doc.length, "from")).toBeNull();
  });
});
