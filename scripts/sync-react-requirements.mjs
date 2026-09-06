import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const registry = JSON.parse(readFileSync(resolve(root, "registry/registry.json"), "utf8"));
const exceptions = registry.components
  .filter((component) => component.react && component.react !== registry.react)
  .map((component) => `\`${component.name}\` requires React ${component.react}`);
const requirement = `- React ${registry.react}${exceptions.length ? ` (${exceptions.join("; ")})` : ""}`;

for (const file of ["docs/src/pages/installation.md", "packages/cli/README.md"]) {
  const target = resolve(root, file);
  const source = readFileSync(target, "utf8");
  if (!/^- React .+$/m.test(source)) throw new Error(`Missing React requirement in ${file}`);
  const updated = source.replace(/^- React .+$/m, requirement);
  if (source === updated) continue;
  if (process.argv.includes("--check")) {
    throw new Error(`${file}: run node scripts/sync-react-requirements.mjs`);
  }
  writeFileSync(target, updated);
}
