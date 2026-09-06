import { styleText } from "node:util";
import path from "path";
import { getConfig } from "../utils/config.ts";
import {
  collapseContext,
  compareComponent,
  diffLines,
  isComponentInstalled,
  type DiffLine,
} from "../utils/diff.ts";
import { fetchRegistry, resolveRegistryRef, type RegistryOptions } from "../utils/registry.ts";

function printDiffLine(line: DiffLine): void {
  if (line.type === "add") console.log(styleText("green", `+ ${line.text}`));
  else if (line.type === "remove") console.log(styleText("red", `- ${line.text}`));
  else console.log(styleText("dim", `  ${line.text}`));
}

export async function diff(componentName: string | undefined, options: RegistryOptions = {}) {
  const config = await getConfig();
  if (!config) throw new Error("beaket.ui.json not found. Run npx @beaket/ui init first.");
  const ref = await resolveRegistryRef(options);
  const registry = await fetchRegistry(ref);
  if (componentName && !registry.components.some(({ name }) => name === componentName))
    throw new Error(`Component not found: ${componentName}`);
  const componentsDir = path.join(process.cwd(), config.components);
  let exitCode = 0;
  let checked = 0;
  console.log(`\nRegistry: ${ref}`);
  for (const definition of registry.components) {
    if (componentName && componentName !== definition.name) continue;
    if (
      !config.installed?.[definition.name] &&
      !(await isComponentInstalled(definition, componentsDir))
    )
      continue;
    checked += 1;
    const comparison = await compareComponent(
      definition,
      componentsDir,
      ref,
      config.installed?.[definition.name],
    );
    for (const file of comparison.files) {
      const analysis = file.analysis;
      const status = analysis?.status ?? (file.status === "same" ? "clean" : "unknown baseline");
      console.log(`  ${definition.name}/${file.path}: ${status}`);
      if (analysis)
        console.log(
          `    upstream: ${analysis.upstreamLines} added/removed lines; local: ${analysis.localLines} added/removed lines; conflicting regions: ${analysis.conflicts}`,
        );
      exitCode = Math.max(
        exitCode,
        status === "unknown baseline"
          ? 3
          : status === "conflicting"
            ? 2
            : status === "mergeable"
              ? 1
              : 0,
      );
      if (!componentName || status === "clean") continue;
      if (file.baseline !== undefined) {
        console.log("    Upstream changes since installation:");
        collapseContext(diffLines(file.baseline, file.upstream)).forEach(printDiffLine);
        console.log("    Your changes since installation:");
        collapseContext(diffLines(file.baseline, file.local ?? "")).forEach(printDiffLine);
      } else {
        console.log("    No recorded baseline; local versus target only:");
        collapseContext(diffLines(file.local ?? "", file.upstream)).forEach(printDiffLine);
      }
    }
  }
  if (!checked) console.log("No installed components found.");
  console.log(
    "Review or hand-merge changes. --overwrite discards local edits and saves a backup.\n",
  );
  process.exitCode = exitCode;
}
