import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { writeConfig, type BeaketConfig } from "../utils/config.ts";
import { installDependencies } from "../utils/files.ts";

export async function init() {
  console.log();
  console.log(pc.bold("Initializing Beaket UI..."));
  console.log();

  const response = await prompts([
    {
      type: "text",
      name: "componentsDir",
      message: "Where would you like to install components?",
      initial: "src/components",
    },
    {
      type: "text",
      name: "utilsDir",
      message: "Where would you like to install utilities (cn, etc.)?",
      initial: "src/lib",
    },
    {
      type: "text",
      name: "tailwindCss",
      message: "Where is your Tailwind CSS file?",
      initial: "src/styles.css",
    },
    {
      type: "text",
      name: "componentsAlias",
      message: "Components import alias",
      initial: "@/components",
    },
    {
      type: "text",
      name: "utilsAlias",
      message: "Utils import alias",
      initial: "@/lib",
    },
  ]);

  if (!response.componentsDir) {
    console.log(pc.red("Cancelled."));
    process.exit(1);
  }

  const config: BeaketConfig = {
    $schema: "https://beaket.dev/schema.json",
    tailwind: {
      css: response.tailwindCss,
    },
    aliases: {
      components: response.componentsAlias,
      utils: response.utilsAlias,
    },
    paths: {
      components: response.componentsDir,
      utils: response.utilsDir,
    },
  };

  // Write beaket.json
  await writeConfig(config);
  console.log(pc.green("✓"), "Created beaket.json");

  // Create utils directory and cn function
  const utilsDir = path.join(process.cwd(), response.utilsDir);
  await fs.ensureDir(utilsDir);

  const cnContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

  await fs.writeFile(path.join(utilsDir, "utils.ts"), cnContent);
  console.log(pc.green("✓"), `Created ${response.utilsDir}/utils.ts`);

  // Install dependencies
  console.log();
  console.log("Installing dependencies...");
  await installDependencies(["clsx", "tailwind-merge"]);
  console.log(pc.green("✓"), "Installed clsx, tailwind-merge");

  console.log();
  console.log(pc.green("Done!"), "Beaket UI is ready.");
  console.log();
  console.log("You can now add components:");
  console.log(pc.cyan("  npx beaket-ui add button"));
  console.log();
}
