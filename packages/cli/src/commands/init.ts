import pc from "picocolors";
import prompts from "prompts";
import { writeConfig, type BeaketConfig } from "../utils/config.ts";

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
  ]);

  if (!response.components) {
    console.log(pc.red("Cancelled."));
    process.exit(1);
  }

  const config: BeaketConfig = {
    $schema: "https://beaket.dev/schema.json",
    components: response.components,
  };

  await writeConfig(config);
  console.log(pc.green("✔"), "Created beaket.json");

  console.log();
  console.log(pc.green("Done!"), "Beaket UI is ready.");
  console.log();
  console.log("Add CSS variables to your Tailwind CSS:");
  console.log(pc.cyan("  https://beaket.github.io/ui/installation"));
  console.log();
  console.log("Then add components:");
  console.log(pc.cyan("  npx @beaket/ui add button"));
  console.log();
}
