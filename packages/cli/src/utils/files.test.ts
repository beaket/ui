import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import prompts from "prompts";
import { expect, it, vi } from "vitest";
import { writeComponentFiles } from "./files.ts";

vi.mock("prompts", () => ({ default: vi.fn() }));

it("preserves every overwritten revision without replacing earlier backups", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-backup-"));
  const target = path.join(directory, "button.tsx");
  try {
    await writeFile(target, "custom branding");
    const files = [{ path: "components/button.tsx", content: "upstream" }];
    const first = await writeComponentFiles(directory, files, true);
    expect(first.overwritten).toEqual([target]);
    expect(await readFile(`${target}.bak`, "utf8")).toBe("custom branding");
    await writeComponentFiles(directory, [{ ...files[0], content: "new upstream" }], true);
    expect(await readFile(`${target}.bak`, "utf8")).toBe("custom branding");
    expect(await readFile(`${target}.bak.1`, "utf8")).toBe("upstream");
    const unchanged = await writeComponentFiles(
      directory,
      [{ ...files[0], content: "new upstream" }],
      true,
    );
    expect(unchanged.unchanged).toEqual([target]);
    expect(unchanged.backups).toEqual([]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it("merges independent upstream and local edits from a recorded base", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-merge-"));
  const target = path.join(directory, "button.tsx");
  const base = "first\nsecond\nthird\n";
  try {
    await writeFile(target, base.replace("first", "local"));
    const result = await writeComponentFiles(
      directory,
      [{ path: "components/button.tsx", content: base.replace("third", "upstream") }],
      true,
      { "components/button.tsx": base },
    );
    expect(await readFile(target, "utf8")).toBe("local\nsecond\nupstream\n");
    expect(await readFile(`${target}.bak`, "utf8")).toBe("local\nsecond\nthird\n");
    expect(result.conflicts).toEqual([]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it("keeps local edits without a write when upstream matches the recorded base", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-merge-"));
  const target = path.join(directory, "button.tsx");
  const base = "upstream\n";
  try {
    await writeFile(target, "local\n");
    const result = await writeComponentFiles(
      directory,
      [{ path: "components/button.tsx", content: base }],
      true,
      { "components/button.tsx": base },
    );
    expect(await readFile(target, "utf8")).toBe("local\n");
    expect(result.preserved).toEqual([target]);
    expect(result.backups).toEqual([]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it("refuses conflicting edits without creating a backup", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-merge-"));
  const target = path.join(directory, "button.tsx");
  const base = "value\n";
  try {
    await writeFile(target, "local\n");
    const result = await writeComponentFiles(
      directory,
      [{ path: "components/button.tsx", content: "upstream\n" }],
      true,
      { "components/button.tsx": base },
    );
    expect(await readFile(target, "utf8")).toBe("local\n");
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]?.hunk).toContain("<<<<<<<");
    expect(result.backups).toEqual([]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it("stops at a cancelled confirm and reports what it already wrote", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-cancel-"));
  const component = path.join(directory, "button.tsx");
  const test = path.join(directory, "button.test.tsx");
  try {
    await writeFile(component, "local component");
    await writeFile(test, "local test");
    // First prompt answered yes; Ctrl+C at the second (prompts@2 calls onCancel, then resolves).
    vi.mocked(prompts)
      .mockResolvedValueOnce({ confirm: true })
      .mockImplementationOnce((async (_q: unknown, options?: { onCancel?: () => void }) => {
        options?.onCancel?.();
        return {};
      }) as never);
    const result = await writeComponentFiles(directory, [
      { path: "components/button.tsx", content: "upstream component" },
      { path: "components/button.test.tsx", content: "upstream test" },
    ]);
    expect(result.cancelled).toBe(true);
    expect(result.written).toEqual([component]);
    expect(result.backups).toEqual([`${component}.bak`]);
    expect(result.skipped).toEqual([]);
    expect(await readFile(test, "utf8")).toBe("local test");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
