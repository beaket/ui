#!/usr/bin/env -S npx tsx
// Test comment for changeset verification
import { Command } from "commander";
import { createRequire } from "module";
import { add } from "./commands/add.ts";
import { init } from "./commands/init.ts";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

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
  .description("Add a component to your project")
  .argument("<component>", "Component name to add")
  .option("-o, --overwrite", "Overwrite existing files")
  .action(add);

program.parse();
