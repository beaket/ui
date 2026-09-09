import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import prompts from "prompts";
import { expect, it, vi } from "vitest";
import { contentHash } from "../utils/config.ts";
import { installDependencies } from "../utils/files.ts";
import { add } from "./add.ts";

vi.mock("../utils/themes.ts", () => ({ THEME_CSS: {} }));
vi.mock("../utils/files.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils/files.ts")>()),
  installDependencies: vi.fn(),
}));

it("records successful and unchanged installs but preserves the baseline of skipped edits", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const firstRef = "a".repeat(40);
  const firstUpstream = "one\ntwo\nthree\n";
  let upstream = firstUpstream;
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
            : url.includes(`/${firstRef}/src/`)
              ? firstUpstream
              : upstream,
        ),
    ),
  );
  const configPath = path.join(directory, "beaket.ui.json");
  const componentPath = path.join(directory, "ui/button.tsx");
  const readConfig = async () => JSON.parse(await readFile(configPath, "utf8"));
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ devDependencies: { typescript: "6.0.3" } }),
    );
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(configPath, JSON.stringify({ components: "ui" }));
    await add(["button"], { registryRef: firstRef });
    const baseline = (await readConfig()).installed.button["components/button.tsx"];
    expect(baseline.ref).toBe(firstRef);
    expect(baseline.hash).toBe(contentHash(upstream));
    expect(baseline.cliVersion).toBeDefined();
    await writeFile(componentPath, upstream.replace("one", "custom branding"));
    upstream = upstream.replace("three", "second release");
    prompts.inject([false]);
    await add(["button"], { registryRef: "b".repeat(40) });
    expect((await readConfig()).installed.button["components/button.tsx"]).toEqual(baseline);
    expect(await readFile(componentPath, "utf8")).toBe("custom branding\ntwo\nthree\n");
    await add(["button"], { registryRef: "b".repeat(40), overwrite: true });
    expect((await readConfig()).installed.button["components/button.tsx"].hash).toBe(
      contentHash(upstream),
    );
    expect(await readFile(componentPath, "utf8")).toBe("custom branding\ntwo\nsecond release\n");
    await add(["button"], { registryRef: "c".repeat(40), overwrite: true });
    expect((await readConfig()).installed.button["components/button.tsx"].ref).toBe("c".repeat(40));
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});

it("adds and records opt-in test files", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-tests-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const ref = "d".repeat(40);
  const nextRef = "e".repeat(40);
  const source = "export const Button = () => null;\n";
  const testFile = 'test("button", () => {});\n// baseline\n// tail\n';
  let latestTest = testFile;
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
                    testFiles: ["components/button.test.tsx"],
                    dependencies: [],
                    registryDependencies: [],
                  },
                ],
              })
            : url.endsWith("button.test.tsx")
              ? url.includes(nextRef)
                ? latestTest
                : testFile
              : source,
        ),
    ),
  );
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ devDependencies: { typescript: "6.0.3" } }),
    );
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(path.join(directory, "beaket.ui.json"), JSON.stringify({ components: "ui" }));
    await add(["button"], { registryRef: ref, withTests: true });
    expect(await readFile(path.join(directory, "ui/button.test.tsx"), "utf8")).toBe(testFile);
    const config = JSON.parse(await readFile(path.join(directory, "beaket.ui.json"), "utf8"));
    expect(config.installed.button["components/button.test.tsx"]).toMatchObject({
      ref,
      hash: contentHash(testFile),
    });
    expect(vi.mocked(installDependencies)).toHaveBeenCalledWith(["tsx", "@types/node"], true);
    const localTest = path.join(directory, "ui/button.test.tsx");
    expect(await readFile(path.join(directory, "beaket.ui.test.json"), "utf8")).toContain(
      '"jsx": "react-jsx"',
    );
    await writeFile(localTest, testFile.replace('"button"', '"custom button"'));
    latestTest = testFile.replace("// tail", "// upstream");
    await add(["button"], { registryRef: nextRef, withTests: true, overwrite: true });
    expect(await readFile(localTest, "utf8")).toContain('"custom button"');
    expect(await readFile(localTest, "utf8")).toContain("// upstream");
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});
