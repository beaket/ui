import path from "path";
import pc from "picocolors";
import { getConfig } from "../utils/config.ts";
import { installDependencies, writeComponentFiles } from "../utils/files.ts";
import { fetchComponent, fetchRegistry } from "../utils/registry.ts";

interface AddOptions {
  overwrite?: boolean;
}

export async function add(componentName: string, options: AddOptions) {
  console.log();

  // Read config
  const config = await getConfig();
  if (!config) {
    console.log(pc.red("Error:"), "beaket.json not found.");
    console.log("Run", pc.cyan("npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  // Fetch registry
  const registry = await fetchRegistry();
  console.log(pc.green("✔"), "Checking registry.");

  const componentDef = registry.components.find((c) => c.name === componentName);

  if (!componentDef) {
    console.log(pc.red("Error:"), `Component "${componentName}" not found.`);
    console.log();
    console.log("Available components:");
    registry.components.forEach((c) => {
      console.log(`  - ${c.name}`);
    });
    process.exit(1);
  }

  // Install dependencies
  if (componentDef.dependencies.length > 0) {
    await installDependencies(componentDef.dependencies);
    console.log(pc.green("✔"), "Installing dependencies.");
  }

  // Fetch component files
  const files = await fetchComponent(componentDef);

  // Write files
  const componentsDir = path.join(process.cwd(), config.paths.components);
  const { written, skipped } = await writeComponentFiles(
    componentsDir,
    componentName,
    files,
    config,
    options.overwrite,
  );

  // Show skipped files
  if (skipped.length > 0) {
    console.log(
      pc.yellow("ℹ"),
      `Skipped ${skipped.length} file(s): (use --overwrite to overwrite)`,
    );
    skipped.forEach((f) => console.log(`  - ${f}`));
  }

  if (written.length === 0) {
    console.log();
    return;
  }

  console.log();
  console.log("Import it in your code:");
  console.log(
    pc.cyan(
      `  import { ${pascalCase(componentName)} } from "${config.aliases.components}/${componentName}";`,
    ),
  );
  console.log();
}

function pascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
