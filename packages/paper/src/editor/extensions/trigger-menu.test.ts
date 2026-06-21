import { describe, expect, it } from "vitest";
import { isResponseCurrent, matchTrigger, type TriggerSpec } from "./trigger-menu";

// Declarative trigger API contract (ADR-0016). matchTrigger and isResponseCurrent are pure and
// coordinate-independent, so they are deterministic jsdom contract-test targets (ADR-0005). The menu
// DOM/position (coordsAtPos returns zero in jsdom, invariant #4) is verified in the browser.

const onQuery = () => [];
const at = (spec: Partial<TriggerSpec>): TriggerSpec => ({ trigger: "@", onQuery, ...spec });

describe("matchTrigger — single-char trigger", () => {
  it("opens at the start of a line (^ boundary), query empty", () => {
    const m = matchTrigger("@", 1, [at({})]);
    expect(m).toEqual({ spec: expect.any(Object), query: "", triggerPos: 0 });
  });

  it("opens after whitespace, capturing the query and the trigger position", () => {
    // "hi @jo" — cursor at end (head 6), trigger '@' at index 3, query "jo"
    const m = matchTrigger("hi @jo", 6, [at({})]);
    expect(m?.query).toBe("jo");
    expect(m?.triggerPos).toBe(3);
  });

  it("does NOT open mid-word — no whitespace/start boundary before the trigger (emails are safe)", () => {
    expect(matchTrigger("foo@bar", 7, [at({})])).toBeNull();
  });

  it("does not match when the trigger is absent", () => {
    expect(matchTrigger("just text", 9, [at({})])).toBeNull();
  });

  it("a query may not contain a space (the \\S* boundary closes the menu) — documented deferral", () => {
    expect(matchTrigger("@john doe", 9, [at({})])).toBeNull();
  });
});

describe("matchTrigger — multi-char trigger (regex-special chars escaped)", () => {
  it("opens on a literal `[[` (the brackets are escaped, not treated as a char class)", () => {
    // "see [[No" — '[[' at index 4, query "No", head 8
    const m = matchTrigger("see [[No", 8, [at({ trigger: "[[" })]);
    expect(m?.query).toBe("No");
    expect(m?.triggerPos).toBe(4);
  });

  it("triggerPos accounts for the full trigger length", () => {
    const m = matchTrigger("[[x", 3, [at({ trigger: "[[" })]);
    expect(m?.triggerPos).toBe(0);
    expect(m?.query).toBe("x");
  });
});

describe("matchTrigger — minQueryLength gating", () => {
  it("defaults to 0 → opens as soon as the bare trigger is typed", () => {
    expect(matchTrigger("@", 1, [at({})])).not.toBeNull();
  });

  it("withholds until the query reaches minQueryLength", () => {
    const spec = at({ minQueryLength: 2 });
    expect(matchTrigger("@a", 2, [spec])).toBeNull();
    expect(matchTrigger("@ab", 3, [spec])).not.toBeNull();
  });
});

describe("matchTrigger — multiple specs (first registered wins)", () => {
  it("returns the first spec whose trigger matches at the cursor", () => {
    const mention = at({ trigger: "@" });
    const wiki = at({ trigger: "[[" });
    expect(matchTrigger("[[x", 3, [mention, wiki])?.spec).toBe(wiki);
    expect(matchTrigger("@x", 2, [mention, wiki])?.spec).toBe(mention);
  });

  it("returns null when no registered trigger is active", () => {
    expect(matchTrigger("#x", 2, [at({ trigger: "@" }), at({ trigger: "[[" })])).toBeNull();
  });
});

describe("isResponseCurrent — stale async response discarding", () => {
  it("accepts a response issued at the latest generation", () => {
    expect(isResponseCurrent(5, 5)).toBe(true);
  });

  it("discards a response superseded by a newer query (a slow earlier query loses)", () => {
    expect(isResponseCurrent(4, 5)).toBe(false);
  });

  it("discards a response that resolves after the menu closed (close bumps the generation)", () => {
    expect(isResponseCurrent(5, 6)).toBe(false);
  });
});
