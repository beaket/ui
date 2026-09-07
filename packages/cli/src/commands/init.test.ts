import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requireTypeScript } from "../utils/typescript.ts";
import { add } from "./add.ts";
import { detectAliasPath, detectCssPath, init } from "./init.ts";

vi.mock("../utils/themes.ts", () => ({ THEME_CSS: {}, VALID_THEMES: [] }));

const temporaryDirectories: string[] = [];

async function makeProject(files: Record<string, string>): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "beaket-ui-init-"));
  temporaryDirectories.push(directory);
  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const target = path.join(directory, file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content);
    }),
  );
  return directory;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

it("rejects plain-JS init and legacy add without touching files", async () => {
  const pkg = '{"name":"javascript-app"}';
  const project = await makeProject({
    "package.json": pkg,
    "style.css": "body { color: red; }",
    "app.jsx": "export default () => null;",
  });
  vi.spyOn(process, "cwd").mockReturnValue(project);
  vi.spyOn(console, "log").mockImplementation(() => {});
  await expect(init({ yes: true })).rejects.toThrow("requires TypeScript");
  expect(await readdir(project)).toEqual(["app.jsx", "package.json", "style.css"]);
  await writeFile(path.join(project, "beaket.ui.json"), '{"components":"ui"}');
  await expect(add(["button"], {})).rejects.toThrow(
    "plain JavaScript/.jsx output is not supported",
  );
  expect(await readdir(project)).toEqual([
    "app.jsx",
    "beaket.ui.json",
    "package.json",
    "style.css",
  ]);
  expect(await readFile(path.join(project, "package.json"), "utf8")).toBe(pkg);
});

it("requires both TypeScript and a config while accepting referenced-config projects", async () => {
  const project = await makeProject({
    "package.json": '{"devDependencies":{"typescript":"6.0.3"}}',
  });
  await expect(requireTypeScript(project)).rejects.toThrow("tsconfig");
  await writeFile(path.join(project, "tsconfig.app.json"), "{}");
  await expect(requireTypeScript(project)).resolves.toBeUndefined();
  await writeFile(path.join(project, "package.json"), "{}");
  await expect(requireTypeScript(project)).rejects.toThrow("requires TypeScript");
});

describe("init path detection", () => {
  it("finds a non-@ alias from a referenced tsconfig", async () => {
    const project = await makeProject({
      "tsconfig.json": `{
        // React Router's root config delegates compiler options.
        "references": [{ "path": "./tsconfig.cloudflare.json" }],
      }`,
      "tsconfig.cloudflare.json": `{
        "compilerOptions": { "paths": { "~/*": ["./app/*"] } },
      }`,
    });

    await expect(detectAliasPath(project)).resolves.toBe("app/components/ui");
  });

  it("ignores nested aliases when a root alias is also configured", async () => {
    const project = await makeProject({
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          paths: {
            "@/components/*": ["./src/components/*"],
            "@/*": ["./src/*"],
          },
        },
      }),
    });

    await expect(detectAliasPath(project)).resolves.toBe("src/components/ui");
  });

  it("preserves commas and brackets inside a referenced config filename", async () => {
    const project = await makeProject({
      "tsconfig.json": '{ "references": [{ "path": "./tsconfig,}.json" }] }',
      "tsconfig,}.json": '{ "compilerOptions": { "paths": { "~/*": ["./app/*"] } } }',
    });

    await expect(detectAliasPath(project)).resolves.toBe("app/components/ui");
  });

  it("finds the Tailwind entry instead of assuming src/index.css", async () => {
    const project = await makeProject({
      "app/app.css": '@import "tailwindcss";\n',
      "src/index.css": "body { margin: 0; }\n",
    });

    await expect(detectCssPath(project)).resolves.toBe("app/app.css");
  });

  it("finds a single-quoted Tailwind import", async () => {
    const project = await makeProject({
      "app/app.css": "body { margin: 0; }\n",
      "styles/globals.css": "@import 'tailwindcss';\n",
    });

    await expect(detectCssPath(project)).resolves.toBe("styles/globals.css");
  });

  it("finds Next.js CSS under src/app", async () => {
    const project = await makeProject({
      "package.json": JSON.stringify({ dependencies: { next: "latest" } }),
      "src/app/globals.css": '@import "tailwindcss";\n',
    });

    await expect(detectCssPath(project)).resolves.toBe("src/app/globals.css");
  });
});
