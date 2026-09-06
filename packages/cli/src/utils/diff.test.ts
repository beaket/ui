import { mkdtemp, writeFile } from "node:fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contentHash } from "./config.ts";
import {
  analyzeThreeWay,
  collapseContext,
  compareComponent,
  deriveComponentStatus,
  diffLines,
  isComponentInstalled,
  normalize,
  toLocalRelativePath,
  type FileComparison,
} from "./diff.ts";
import type { ComponentDefinition } from "./registry.ts";

afterEach(() => {
  vi.restoreAllMocks();
  // restoreAllMocks doesn't undo vi.stubGlobal — unstub so the fetch stub from
  // the compareComponent tests doesn't leak into other tests.
  vi.unstubAllGlobals();
});

describe("toLocalRelativePath", () => {
  it("rejects paths that could read or write outside the component directory", () => {
    expect(() => toLocalRelativePath("components/../../secret.tsx")).toThrow("Invalid");
    expect(() => toLocalRelativePath("/tmp/secret.tsx")).toThrow("Invalid");
  });
  it("strips the registry components/ prefix", () => {
    expect(toLocalRelativePath("components/button.tsx")).toBe("button.tsx");
  });

  it("leaves an already-flat path alone", () => {
    expect(toLocalRelativePath("button.tsx")).toBe("button.tsx");
  });
});

describe("normalize", () => {
  it("treats CRLF and LF as equal", () => {
    expect(normalize("a\r\nb")).toBe(normalize("a\nb"));
  });

  it("ignores a trailing final newline", () => {
    expect(normalize("a\nb\n")).toBe(normalize("a\nb"));
  });

  it("preserves per-line trailing whitespace (can be significant in a template literal)", () => {
    expect(normalize("a  \nb")).not.toBe(normalize("a\nb"));
  });

  it("keeps a real content difference", () => {
    expect(normalize("a\nb")).not.toBe(normalize("a\nc"));
  });
});

describe("deriveComponentStatus", () => {
  const file = (status: FileComparison["status"]): FileComparison => ({
    path: "x.tsx",
    status,
    local: "",
    upstream: "",
  });

  it("is not-installed when every file is missing", () => {
    expect(deriveComponentStatus([file("missing"), file("missing")])).toBe("not-installed");
  });

  it("is not-installed for an empty file list", () => {
    expect(deriveComponentStatus([])).toBe("not-installed");
  });

  it("is up-to-date when all present files match", () => {
    expect(deriveComponentStatus([file("same"), file("same")])).toBe("up-to-date");
  });

  it("is outdated when a present file differs", () => {
    expect(deriveComponentStatus([file("same"), file("different")])).toBe("outdated");
  });

  it("is outdated when one file of a multi-file component is new", () => {
    expect(deriveComponentStatus([file("same"), file("missing")])).toBe("outdated");
  });
});

describe("diffLines", () => {
  it("marks a changed line as remove + add and keeps context", () => {
    const result = diffLines("a\nb\nc", "a\nB\nc");
    expect(result).toEqual([
      { type: "context", text: "a" },
      { type: "remove", text: "b" },
      { type: "add", text: "B" },
      { type: "context", text: "c" },
    ]);
  });

  it("reports all-context for identical input", () => {
    expect(diffLines("a\nb", "a\nb").every((l) => l.type === "context")).toBe(true);
  });

  it("handles pure additions", () => {
    const result = diffLines("a", "a\nb");
    expect(result).toEqual([
      { type: "context", text: "a" },
      { type: "add", text: "b" },
    ]);
  });
});

describe("collapseContext", () => {
  it("replaces a long unchanged run with a single marker", () => {
    const lines = [
      ...Array.from({ length: 10 }, (_, i) => ({ type: "context" as const, text: `c${i}` })),
      { type: "add" as const, text: "new" },
    ];
    const collapsed = collapseContext(lines, 2);
    // The far-away context lines collapse to one "…" marker; the 2 nearest remain.
    expect(collapsed.filter((l) => l.text === "…")).toHaveLength(1);
    expect(collapsed.some((l) => l.type === "add" && l.text === "new")).toBe(true);
    expect(collapsed).toContainEqual({ type: "context", text: "c9" });
    expect(collapsed).not.toContainEqual({ type: "context", text: "c0" });
  });

  it("leaves short diffs untouched", () => {
    const lines = [
      { type: "context" as const, text: "a" },
      { type: "remove" as const, text: "b" },
      { type: "add" as const, text: "B" },
    ];
    expect(collapseContext(lines)).toEqual(lines);
  });
});

const buttonDef: ComponentDefinition = {
  name: "button",
  dependencies: [],
  registryDependencies: [],
  files: ["components/button.tsx"],
};

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "beaket-diff-"));
}

describe("isComponentInstalled", () => {
  it("is false when no file exists", async () => {
    const dir = await tempDir();
    expect(await isComponentInstalled(buttonDef, dir)).toBe(false);
  });

  it("is true when the component file exists", async () => {
    const dir = await tempDir();
    await writeFile(path.join(dir, "button.tsx"), "x");
    expect(await isComponentInstalled(buttonDef, dir)).toBe(true);
  });
});

describe("compareComponent", () => {
  function stubFetchContent(content: string) {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(content, { status: 200 }))),
    );
  }

  it("verifies the recorded baseline hash before classifying local edits", async () => {
    const dir = await tempDir();
    await writeFile(path.join(dir, "button.tsx"), "custom");
    stubFetchContent("base");
    const recorded = {
      [buttonDef.files[0]]: {
        ref: "@beaket/ui@3.1.0",
        hash: contentHash("base"),
        cliVersion: "3.1.0",
      },
    };
    const comparison = await compareComponent(buttonDef, dir, "@beaket/ui@3.1.0", recorded);
    expect(comparison.files[0].analysis?.status).toBe("local-only");
    recorded[buttonDef.files[0]].hash = contentHash("wrong");
    await expect(compareComponent(buttonDef, dir, "@beaket/ui@3.1.0", recorded)).rejects.toThrow(
      "Baseline hash mismatch",
    );
  });

  it("reports not-installed when the file is absent locally", async () => {
    const dir = await tempDir();
    stubFetchContent("export const Button = 1;");
    const cmp = await compareComponent(buttonDef, dir);
    expect(cmp.status).toBe("not-installed");
    expect(cmp.files[0].status).toBe("missing");
  });

  it("reports up-to-date when local matches upstream (ignoring line endings)", async () => {
    const dir = await tempDir();
    await writeFile(path.join(dir, "button.tsx"), "line1\r\nline2\n");
    stubFetchContent("line1\nline2");
    const cmp = await compareComponent(buttonDef, dir);
    expect(cmp.status).toBe("up-to-date");
    expect(cmp.files[0].status).toBe("same");
  });

  it("reports outdated when the local copy differs", async () => {
    const dir = await tempDir();
    await writeFile(path.join(dir, "button.tsx"), "old style");
    stubFetchContent("new style");
    const cmp = await compareComponent(buttonDef, dir);
    expect(cmp.status).toBe("outdated");
    expect(cmp.files[0].status).toBe("different");
    expect(cmp.files[0].local).toBe("old style");
    expect(cmp.files[0].upstream).toBe("new style");
  });
});

it("uses three states to distinguish local edits, clean merges and actual conflicts", async () => {
  const base = "one\ntwo\nthree\nfour\nfive\n";
  expect((await analyzeThreeWay(base, base, base)).status).toBe("clean");
  expect((await analyzeThreeWay(base, "custom", base)).status).toBe("local-only");
  expect((await analyzeThreeWay(base, base, "upstream")).status).toBe("mergeable");
  expect((await analyzeThreeWay(base, "same edit", "same edit")).status).toBe("clean");
  expect(
    (await analyzeThreeWay(base, base.replace("one", "local"), base.replace("five", "upstream")))
      .status,
  ).toBe("mergeable");
  const conflict = await analyzeThreeWay(
    base,
    base.replace("one", "local"),
    base.replace("one", "upstream"),
  );
  expect(conflict.status).toBe("conflicting");
  expect(conflict.conflicts).toBe(1);
  expect(conflict.localLines).toBe(2);
  expect(conflict.upstreamLines).toBe(2);
  const separated = "first\n1\n2\n3\n4\n5\n6\n7\n8\nlast\n";
  const twoConflicts = await analyzeThreeWay(
    separated,
    separated.replace("first", "local first").replace("last", "local last"),
    separated.replace("first", "upstream first").replace("last", "upstream last"),
  );
  expect(twoConflicts.status).toBe("conflicting");
  expect(twoConflicts.conflicts).toBe(2);
});
