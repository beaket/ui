import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

it("merges a tracked file's local edit when the overwrite prompt is answered yes", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-prompt-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const firstRef = "a".repeat(40);
  const nextRef = "b".repeat(40);
  const firstUpstream = "one\ntwo\nthree\n";
  const nextUpstream = "one\ntwo\nsecond release\n";
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
              : nextUpstream,
        ),
    ),
  );
  const componentPath = path.join(directory, "ui/button.tsx");
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ devDependencies: { typescript: "6.0.3" } }),
    );
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(path.join(directory, "beaket.ui.json"), JSON.stringify({ components: "ui" }));
    await add(["button"], { registryRef: firstRef });
    await writeFile(componentPath, "custom branding\ntwo\nthree\n");
    prompts.inject([true]);
    await add(["button"], { registryRef: nextRef });
    expect(await readFile(componentPath, "utf8")).toBe("custom branding\ntwo\nsecond release\n");
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});

it("leaves a conflicting tracked file alone when the overwrite prompt is answered yes", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-prompt-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  const firstRef = "a".repeat(40);
  const nextRef = "b".repeat(40);
  const firstUpstream = "one\ntwo\nthree\n";
  const nextUpstream = "one\ntwo\nsecond release\n";
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
              : nextUpstream,
        ),
    ),
  );
  const componentPath = path.join(directory, "ui/button.tsx");
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ devDependencies: { typescript: "6.0.3" } }),
    );
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(path.join(directory, "beaket.ui.json"), JSON.stringify({ components: "ui" }));
    await add(["button"], { registryRef: firstRef });
    await writeFile(componentPath, "one\ntwo\nlocal three\n");
    prompts.inject([true]);
    await add(["button"], { registryRef: nextRef });
    expect(await readFile(componentPath, "utf8")).toBe("one\ntwo\nlocal three\n");
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

it("does not reinstall dependencies the project already declares", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-deps-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.mocked(installDependencies).mockClear();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          url.endsWith("registry.json")
            ? JSON.stringify({
                components: [
                  {
                    name: "alert",
                    files: ["components/alert.tsx"],
                    dependencies: ["clsx", "tailwind-merge", "lucide-react"],
                    registryDependencies: [],
                  },
                ],
              })
            : "export const Alert = () => null;\n",
        ),
    ),
  );
  const writePackage = (pkg: object) =>
    writeFile(path.join(directory, "package.json"), JSON.stringify(pkg));
  try {
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(path.join(directory, "beaket.ui.json"), JSON.stringify({ components: "ui" }));
    await writePackage({
      dependencies: { clsx: "2.0.0" },
      devDependencies: { typescript: "6.0.3", "tailwind-merge": "3.0.0" },
    });
    await add(["alert"], { registryRef: "f".repeat(40) });
    expect(vi.mocked(installDependencies)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(installDependencies)).toHaveBeenCalledWith(["lucide-react"]);

    vi.mocked(installDependencies).mockClear();
    await writePackage({
      dependencies: { clsx: "2.0.0", "lucide-react": "1.0.0" },
      peerDependencies: { "tailwind-merge": "3.0.0" },
      devDependencies: { typescript: "6.0.3" },
    });
    await add(["alert"], { registryRef: "f".repeat(40), overwrite: true });
    expect(vi.mocked(installDependencies)).not.toHaveBeenCalled();
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});

it("fetches every component file before installing dependencies", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-order-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.mocked(installDependencies).mockClear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.endsWith("registry.json")
        ? new Response(
            JSON.stringify({
              components: [
                {
                  name: "alert",
                  files: ["components/alert.tsx"],
                  dependencies: ["lucide-react"],
                  registryDependencies: [],
                },
              ],
            }),
          )
        : new Response("not found", { status: 404 }),
    ),
  );
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ devDependencies: { typescript: "6.0.3" } }),
    );
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(path.join(directory, "beaket.ui.json"), JSON.stringify({ components: "ui" }));
    await expect(add(["alert"], { registryRef: "f".repeat(40) })).rejects.toThrow(
      /Failed to fetch components\/alert\.tsx/,
    );
    expect(vi.mocked(installDependencies)).not.toHaveBeenCalled();
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});

it("records written files and keeps the backup list when Ctrl+C stops a two-file install", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-install-cancel-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const exit = vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("exit");
  }) as never);
  const ref = "f".repeat(40);
  const source = "export const Button = () => null;\n";
  const testFile = 'test("button", () => {});\n';
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
              ? testFile
              : source,
        ),
    ),
  );
  const previousExitCode = process.exitCode;
  try {
    await writeFile(
      path.join(directory, "package.json"),
      JSON.stringify({ devDependencies: { typescript: "6.0.3" } }),
    );
    await writeFile(path.join(directory, "tsconfig.json"), "{}");
    await writeFile(path.join(directory, "beaket.ui.json"), JSON.stringify({ components: "ui" }));
    await mkdir(path.join(directory, "ui"));
    await writeFile(path.join(directory, "ui/button.tsx"), "local component\n");
    await writeFile(path.join(directory, "ui/button.test.tsx"), "local test\n");
    // Yes for button.tsx, then Ctrl+C (an injected Error aborts the prompt) at button.test.tsx.
    prompts.inject([true, new Error("cancel")]);
    await add(["button"], { registryRef: ref, withTests: true });

    expect(exit).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(await readFile(path.join(directory, "ui/button.tsx"), "utf8")).toBe(source);
    expect(await readFile(path.join(directory, "ui/button.tsx.bak"), "utf8")).toBe(
      "local component\n",
    );
    expect(await readFile(path.join(directory, "ui/button.test.tsx"), "utf8")).toBe("local test\n");
    const config = JSON.parse(await readFile(path.join(directory, "beaket.ui.json"), "utf8"));
    expect(config.installed.button["components/button.tsx"]).toMatchObject({
      ref,
      hash: contentHash(source),
    });
    expect(config.installed.button["components/button.test.tsx"]).toBeUndefined();
    const output = log.mock.calls.flat().join("\n");
    expect(output).toContain("Backups:");
    expect(output).toContain("button.tsx.bak");
  } finally {
    process.exitCode = previousExitCode;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await rm(directory, { recursive: true, force: true });
  }
});
