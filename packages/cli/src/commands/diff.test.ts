import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { contentHash } from "../utils/config.ts";
import { diff } from "./diff.ts";

it("reports machine-readable diff outcomes without changing consumer files", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-diff-command-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const base = "one\ntwo\nthree\nfour\nfive\n";
  const oldRef = "a".repeat(40);
  const ref = "b".repeat(40);
  let upstream = base;
  let removed = false;
  const definition = {
    name: "button",
    files: ["components/button.tsx"],
    dependencies: [],
    registryDependencies: [],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          url.endsWith("registry.json")
            ? JSON.stringify({ components: removed ? [] : [definition] })
            : url.includes(oldRef)
              ? base
              : upstream,
        ),
    ),
  );
  const configPath = path.join(directory, "beaket.ui.json");
  const targetPath = path.join(directory, "button.tsx");
  const config = JSON.stringify({
    components: ".",
    installed: {
      button: {
        "components/button.tsx": { ref: oldRef, hash: contentHash(base), cliVersion: "3.1.0" },
      },
    },
  });
  try {
    await writeFile(configPath, config);
    for (const [local, target, code] of [
      [base, base, 0],
      [base.replace("one", "local"), base, 0],
      [base, base.replace("five", "upstream"), 1],
      [base.replace("one", "local"), base.replace("five", "upstream"), 1],
      [base.replace("one", "local"), base.replace("one", "upstream"), 2],
    ] as const) {
      upstream = target;
      await writeFile(targetPath, local);
      await diff("button", { registryRef: ref });
      expect(process.exitCode).toBe(code);
      expect(await readFile(targetPath, "utf8")).toBe(local);
      expect(await readFile(configPath, "utf8")).toBe(config);
    }
    removed = true;
    await writeFile(targetPath, base);
    await diff(undefined, { registryRef: ref });
    expect(process.exitCode).toBe(1);
    removed = false;
    await writeFile(configPath, JSON.stringify({ components: "." }));
    await diff("button", { registryRef: ref });
    expect(process.exitCode).toBe(3);
  } finally {
    process.exitCode = 0;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});
