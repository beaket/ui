import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectAliasPath, detectCssPath } from "./init.ts";

const temporaryDirectories: string[] = [];

async function makeProject(files: Record<string, string>): Promise<string> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "beaket-ui-init-"));
  temporaryDirectories.push(directory);
  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const target = path.join(directory, file);
      await fs.outputFile(target, content);
    }),
  );
  return directory;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.remove(directory)));
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
