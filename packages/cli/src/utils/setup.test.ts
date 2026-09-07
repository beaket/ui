import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import prompts from "prompts";
import ts from "typescript";
import { afterEach, expect, it, vi } from "vitest";
import { detectAlias } from "../commands/init.ts";
import * as files from "./files.ts";
import { aliasMatches, checkSetup, enableViteTsconfigPaths, hasPostcssPlugin } from "./setup.ts";

vi.mock("prompts", () => ({ default: vi.fn() }));
vi.mock("./themes.ts", () => ({ THEME_CSS: {}, VALID_THEMES: [] }));
const directories: string[] = [];
const config = "// Keep this comment.\nexport default { plugins: [], server: { port: 4312 } };\n";

async function project() {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "beaket-setup-"));
  directories.push(cwd);
  await symlink(path.resolve("node_modules"), path.join(cwd, "node_modules"), "dir");
  await writeFile(path.join(cwd, "package.json"), '{"type":"module"}');
  await writeFile(
    path.join(cwd, "tsconfig.json"),
    '{"compilerOptions":{"paths":{"@/*":["./src/*"]}}}',
  );
  await writeFile(path.join(cwd, "style.css"), '@import "tailwindcss";');
  await writeFile(path.join(cwd, "vite.config.ts"), config);
  vi.spyOn(console, "log").mockImplementation(() => {});
  return { cwd, alias: (await detectAlias(cwd))! };
}

afterEach(async () => {
  vi.restoreAllMocks();
  vi.mocked(prompts).mockReset();
  await Promise.all(directories.splice(0).map((cwd) => rm(cwd, { recursive: true, force: true })));
});

it("checks first-match string/regex aliases without accepting wrong directories", () => {
  const alias = { name: "@", directory: "/app/src", components: "/app/src/components/ui" };
  expect(aliasMatches([{ find: "@", replacement: "/app/src" }], alias)).toBe(true);
  expect(aliasMatches([{ find: /^@\/(.*)$/, replacement: "/app/src/$1" }], alias)).toBe(true);
  expect(aliasMatches([{ find: "@", replacement: "./src" }], alias)).toBe(false);
  expect(
    aliasMatches(
      [
        { find: "@", replacement: "/wrong" },
        { find: "@", replacement: "/app/src" },
      ],
      alias,
    ),
  ).toBe(false);
  expect(aliasMatches([{ find: "@other", replacement: "/app/src" }], alias)).toBeUndefined();
});

it("edits only literal Vite configs and preserves unrelated source", () => {
  expect(enableViteTsconfigPaths(ts, config)).toContain("// Keep this comment.");
  expect(enableViteTsconfigPaths(ts, config)).toContain("server: { port: 4312 }");
  expect(
    enableViteTsconfigPaths(ts, "export default defineConfig({ resolve: { alias: {} } })"),
  ).toBe("export default defineConfig({ resolve: { tsconfigPaths: true, alias: {} } })");
  expect(
    enableViteTsconfigPaths(ts, "export default { resolve: { tsconfigPaths: false /* keep */ } }"),
  ).toContain("tsconfigPaths: true /* keep */");
  for (const source of [
    "export default () => ({})",
    "export default { ...shared }",
    "export default { resolve: shared }",
    "export default { resolve: { ...shared } }",
  ]) {
    expect(enableViteTsconfigPaths(ts, source)).toBeUndefined();
  }
});

it("keeps --yes and declined setup checks read-only", async () => {
  const { cwd, alias } = await project();
  expect(await checkSetup(alias, true, "style.css", cwd)).toBe(true);
  expect(prompts).not.toHaveBeenCalled();
  vi.mocked(prompts).mockResolvedValue({ confirm: false });
  await checkSetup(alias, false, "style.css", cwd);
  expect(await readFile(path.join(cwd, "vite.config.ts"), "utf8")).toBe(config);
  expect((await readdir(cwd)).some((file) => file.endsWith(".bak"))).toBe(false);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Vite does not resolve"));
});

it("backs up an approved config edit and rejects failed backups or concurrent changes", async () => {
  const { cwd, alias } = await project();
  vi.mocked(prompts).mockResolvedValue({ confirm: true });
  await checkSetup(alias, false, "style.css", cwd);
  expect(await readFile(path.join(cwd, "vite.config.ts.bak"), "utf8")).toBe(config);
  expect(await readFile(path.join(cwd, "vite.config.ts"), "utf8")).toContain("tsconfigPaths: true");
  await writeFile(path.join(cwd, "vite.config.ts"), config);
  vi.spyOn(files, "backupFile").mockRejectedValue(new Error("backup denied"));
  await checkSetup(alias, false, "style.css", cwd);
  expect(await readFile(path.join(cwd, "vite.config.ts"), "utf8")).toBe(config);
  vi.mocked(prompts).mockImplementation(async () => {
    await writeFile(path.join(cwd, "vite.config.ts"), config + "// user edit\n");
    return { confirm: true };
  });
  await checkSetup(alias, false, "style.css", cwd);
  expect(await readFile(path.join(cwd, "vite.config.ts"), "utf8")).toBe(config + "// user edit\n");
});

it("verifies installed Tailwind/Vite plugins but warns about a conflicting alias even with native paths", async () => {
  const { cwd, alias } = await project();
  const valid =
    'import tailwind from "@tailwindcss/vite"; export default { plugins: [tailwind()], resolve: { tsconfigPaths: true } };';
  await writeFile(path.join(cwd, "vite.config.ts"), valid);
  expect(await checkSetup(alias, true, "style.css", cwd)).toBe(false);
  await writeFile(
    path.join(cwd, "vite.config.ts"),
    valid.replace("tsconfigPaths: true", 'tsconfigPaths: true, alias: { "@": "/wrong" }'),
  );
  expect(await checkSetup(alias, false, "style.css", cwd)).toBe(true);
  expect(prompts).not.toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining("Correct the existing resolve.alias"),
  );
  await writeFile(path.join(cwd, "style.css"), '/* @import "tailwindcss"; */');
  expect(await checkSetup(undefined, true, "style.css", cwd)).toBe(true);
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining("does not import tailwindcss"));
});

it("resolves referenced paths relative to their owning config", async () => {
  const { cwd } = await project();
  await mkdir(path.join(cwd, "app"));
  await writeFile(path.join(cwd, "tsconfig.json"), '{"references":[{"path":"./app"}]}');
  await writeFile(
    path.join(cwd, "app/tsconfig.json"),
    '{"compilerOptions":{"paths":{"~/*":["./src/*"]}}}',
  );
  expect((await detectAlias(cwd))?.directory).toBe(path.join(cwd, "app/src"));
  await writeFile(
    path.join(cwd, "app/tsconfig.json"),
    '{"compilerOptions":{"baseUrl":"../","paths":{"~/*":["./src/*"]}}}',
  );
  expect((await detectAlias(cwd))?.directory).toBe(path.join(cwd, "src"));
});

it("recognizes common PostCSS configs without treating disabled or dynamic plugins as verified", () => {
  const object = '{ plugins: { "@tailwindcss/postcss": {} } }';
  for (const content of [
    `export default ${object}`,
    `const config = ${object}; export default config;`,
    `module.exports = ${object}`,
  ])
    expect(hasPostcssPlugin(ts, content)).toBe(true);
  for (const content of [
    'export default { plugins: { "@tailwindcss/postcss": false } }',
    'export default { plugins: { "@tailwindcss/postcss": dynamic } }',
    `export default { ...${object}, ...overrides }`,
  ])
    expect(hasPostcssPlugin(ts, content)).toBe(false);
});
