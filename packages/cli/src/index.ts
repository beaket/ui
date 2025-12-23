#!/usr/bin/env node
import { Command } from "commander";
import { add } from "./commands/add.ts";
import { init } from "./commands/init.ts";

const program = new Command();

program
  .name("beaket-ui")
  .description("CLI for adding Beaket UI components to your project")
  .version("0.1.1");

program.command("init").description("Initialize Beaket UI in your project").action(init);

program
  .command("add")
  .description("Add a component to your project")
  .argument("<component>", "Component name to add")
  .action(add);

program.parse();
