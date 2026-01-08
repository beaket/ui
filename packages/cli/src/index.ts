import { Command } from "commander";
import { add } from "./commands/add.ts";
import { init } from "./commands/init.ts";

declare const __VERSION__: string;
const version = __VERSION__;

const program = new Command();

program
  .name("@beaket/ui")
  .description("CLI for adding Beaket UI components to your project")
  .version(version);

program
  .command("init")
  .description("Initialize Beaket UI in your project")
  .option("-y, --yes", "Use defaults without prompting")
  .action(init);

program
  .command("add")
  .description("Add components to your project")
  .argument("<components...>", "Component names to add")
  .option("-o, --overwrite", "Overwrite existing files")
  .action(add);

program.parse();
