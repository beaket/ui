import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import prompts from "prompts";
import { expect, it, vi } from "vitest";
import { contentHash } from "../utils/config.ts";
import { add } from "./add.ts";

it("records successful and unchanged installs but preserves the baseline of skipped edits", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  let upstream = "first release";
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          url.endsWith("registry.json")
            ? JSON.stringify({
                components: [
                  {
                    name: "button",
                    files: ["components/button.tsx"],
                    dependencies: [],
                    registryDependencies: [],
                  },
                ],
              })
            : upstream,
        ),
    ),
  );
  const configPath = path.join(directory, "beaket.ui.json");
  const componentPath = path.join(directory, "ui/button.tsx");
  const readConfig = async () => JSON.parse(await readFile(configPath, "utf8"));
  try {
    await writeFile(configPath, JSON.stringify({ components: "ui" }));
    const firstRef = "a".repeat(40);
    await add(["button"], { registryRef: firstRef });
    const baseline = (await readConfig()).installed.button["components/button.tsx"];
    expect(baseline.ref).toBe(firstRef);
    expect(baseline.hash).toBe(contentHash(upstream));
    expect(baseline.cliVersion).toBeDefined();
    await writeFile(componentPath, "custom branding");
    upstream = "second release";
    prompts.inject([false]);
    await add(["button"], { registryRef: "b".repeat(40) });
    expect((await readConfig()).installed.button["components/button.tsx"]).toEqual(baseline);
    expect(await readFile(componentPath, "utf8")).toBe("custom branding");
    await add(["button"], { registryRef: "b".repeat(40), overwrite: true });
    expect((await readConfig()).installed.button["components/button.tsx"].hash).toBe(
      contentHash(upstream),
    );
    await add(["button"], { registryRef: "c".repeat(40) });
    expect((await readConfig()).installed.button["components/button.tsx"].ref).toBe("c".repeat(40));
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});
