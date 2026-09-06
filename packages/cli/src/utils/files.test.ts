import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { writeComponentFiles } from "./files.ts";

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
