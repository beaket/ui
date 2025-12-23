import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import { getConfig } from "../utils/config.ts";
import { writeComponentFiles } from "../utils/files.ts";
import { fetchComponent, fetchRegistry } from "../utils/registry.ts";

export async function add(componentName: string) {
  console.log();

  // Read config
  const config = await getConfig();
  if (!config) {
    console.log(pc.red("Error:"), "beaket.json not found.");
    console.log("Run", pc.cyan("npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  // Fetch registry
  console.log(`Adding ${pc.cyan(componentName)}...`);

  const registry = await fetchRegistry();
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

  // Fetch component files
  const files = await fetchComponent(componentDef);

  // Write files
  const componentsDir = path.join(process.cwd(), config.paths.components);
  await writeComponentFiles(componentsDir, componentName, files, config);

  console.log(pc.green("✓"), `Added ${componentName}`);
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
