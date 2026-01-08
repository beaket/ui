import path from "path";
import pc from "picocolors";
import { getConfig } from "../utils/config.ts";
import { installDependencies, writeComponentFiles } from "../utils/files.ts";
import { fetchComponent, fetchRegistry } from "../utils/registry.ts";

interface AddOptions {
  overwrite?: boolean;
}

export async function add(componentNames: string[], options: AddOptions) {
  console.log();

  // Read config
  const config = await getConfig();
  if (!config) {
    console.log(pc.red("Error:"), "beaket.ui.json not found.");
    console.log("Run", pc.cyan("npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  // Fetch registry
  const registry = await fetchRegistry();
  console.log(pc.green("✔"), "Checking registry.");

  // Validate all components exist
  const notFound: string[] = [];
  const componentDefs = componentNames.map((name) => {
    const def = registry.components.find((c) => c.name === name);
    if (!def) notFound.push(name);
    return def;
  });

  if (notFound.length > 0) {
    console.log(pc.red("Error:"), `Component(s) not found: ${notFound.join(", ")}`);
    console.log();
    console.log("Available components:");
    registry.components.forEach((c) => {
      console.log(`  - ${c.name}`);
    });
    process.exit(1);
  }

  // Collect all unique dependencies
  const allDependencies = new Set<string>();
  for (const def of componentDefs) {
    if (def) {
      for (const dep of def.dependencies) {
        allDependencies.add(dep);
      }
    }
  }

  // Install dependencies once
  if (allDependencies.size > 0) {
    await installDependencies([...allDependencies]);
    console.log(pc.green("✔"), "Installing dependencies.");
  }

  // Fetch and write all component files
  const componentsDir = path.join(process.cwd(), config.components);
  const allWritten: string[] = [];
  const allSkipped: string[] = [];

  for (const def of componentDefs) {
    if (!def) continue;
    const files = await fetchComponent(def);
    const { written, skipped } = await writeComponentFiles(componentsDir, files, options.overwrite);
    allWritten.push(...written);
    allSkipped.push(...skipped);
  }

  // Show skipped files
  if (allSkipped.length > 0) {
    console.log(
      pc.yellow("ℹ"),
      `Skipped ${allSkipped.length} file(s): (use --overwrite to overwrite)`,
    );
    allSkipped.forEach((f) => console.log(`  - ${f}`));
  }

  if (allWritten.length === 0) {
    console.log();
    return;
  }

  console.log();
  console.log("Added:");
  allWritten.forEach((f) => console.log(pc.cyan(`  ${f}`)));
  console.log();
}
