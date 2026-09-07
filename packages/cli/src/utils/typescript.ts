import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

export async function requireTypeScript(cwd = process.cwd()): Promise<void> {
  const files = await readdir(cwd, { withFileTypes: true });
  const hasConfig = files.some(
    (file) => file.isFile() && /^tsconfig(?:\..+)?\.json$/.test(file.name),
  );
  let pkg;
  try {
    pkg = JSON.parse(
      (await readFile(path.join(cwd, "package.json"), "utf8")).replace(/^\uFEFF/, ""),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  let hasTypeScript = Boolean(
    pkg?.dependencies?.typescript ||
    pkg?.devDependencies?.typescript ||
    pkg?.peerDependencies?.typescript,
  );
  if (!hasTypeScript) {
    try {
      createRequire(path.join(cwd, "package.json")).resolve("typescript/package.json");
      hasTypeScript = true; // Workspace/hoisted toolchains are supported too.
    } catch {}
  }
  if (!hasConfig || !hasTypeScript) {
    throw new Error(
      "Beaket UI requires TypeScript and a tsconfig*.json file; plain JavaScript/.jsx output is not supported. Add TypeScript to your project and create a tsconfig before running init or add. No files were changed.",
    );
  }
}
