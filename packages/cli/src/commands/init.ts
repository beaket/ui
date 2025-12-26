import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { writeConfig, type BeaketConfig } from "../utils/config.ts";

const CSS_VARIABLES = `
/* Beaket UI Design System */
:root {
  --branch: #1C1F24;
  --ink: #0D0D0D;
  --paper: #F8F8F8;
  --steel: #6B6B6B;
  --chrome: #C8C8C8;
  --graphite: #1A1A1A;
  --iron: #2D2D2D;
  --slate: #404040;
  --zinc: #525252;
  --aluminum: #9E9E9E;
  --silver: #DEDEDE;
  --platinum: #F0F0F0;
  --frost: #F5F5F5;
  --signal-blue: #2B6CB0;
  --signal-red: #D32F2F;
  --signal-green: #137752;
  --signal-amber: #A86800;
  --signal-purple: #6F2DA8;
  --signal-cyan: #1A6B7C;
}
`;

export async function init() {
  console.log();
  console.log(pc.bold("Initializing Beaket UI..."));
  console.log();

  const response = await prompts([
    {
      type: "text",
      name: "components",
      message: "Where should components be installed?",
      initial: "src/components/ui",
    },
    {
      type: "text",
      name: "css",
      message: "Where is your Tailwind CSS file?",
      initial: "src/index.css",
    },
  ]);

  if (!response.components) {
    console.log(pc.red("Cancelled."));
    process.exit(1);
  }

  // Write beaket.json (only components path)
  const config: BeaketConfig = {
    $schema: "https://beaket.dev/schema.json",
    components: response.components,
  };

  await writeConfig(config);
  console.log(pc.green("✔"), "Created beaket.json");

  // Inject CSS variables into Tailwind CSS file
  if (response.css) {
    const cssPath = path.join(process.cwd(), response.css);
    if (await fs.pathExists(cssPath)) {
      const cssContent = await fs.readFile(cssPath, "utf-8");
      if (!cssContent.includes("Beaket UI Design System")) {
        await fs.writeFile(cssPath, cssContent + CSS_VARIABLES);
        console.log(pc.green("✔"), `Added CSS variables to ${response.css}`);
      } else {
        console.log(pc.yellow("ℹ"), "CSS variables already exist");
      }
    } else {
      console.log(pc.yellow("!"), `CSS file not found: ${response.css}`);
      console.log("  Add CSS variables manually:");
      console.log(pc.cyan("  https://beaket.github.io/ui/installation"));
    }
  }

  console.log();
  console.log(pc.green("Done!"), "Beaket UI is ready.");
  console.log();
  console.log("Add components:");
  console.log(pc.cyan("  npx @beaket/ui add button"));
  console.log();
}
