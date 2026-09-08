import { Command, Option } from "commander";
import { add } from "./commands/add.ts";
import { diff } from "./commands/diff.ts";
import { init } from "./commands/init.ts";
import { list } from "./commands/list.ts";
import { theme } from "./commands/theme.ts";

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
  .option("--theme <preset>", "Theme: solace, porcelain, tobacco, marigold, or eucalyptus")
  .action(init);

program
  .command("add")
  .description("Add components to your project")
  .argument("<components...>", "Component names to add")
  .option("-o, --overwrite", "Overwrite existing files")
  .option("--with-tests", "Add opt-in component tests and the tsx test runner")
  .addOption(new Option("--registry-ref <ref>", "Registry tag or commit").conflicts("latest"))
  .addOption(new Option("--latest", "Use the current main registry").conflicts("registryRef"))
  .action(add);

program
  .command("diff")
  .description("Check installed components for upstream style updates")
  .argument("[component]", "Component to diff against the registry (omit to check all)")
  .addOption(new Option("--registry-ref <ref>", "Registry tag or commit").conflicts("latest"))
  .addOption(new Option("--latest", "Use the current main registry").conflicts("registryRef"))
  .action(diff);

program
  .command("theme")
  .description("Sync theme CSS tokens to your project")
  .option("--diff", "Preview token changes without writing files")
  .option("--dry-run", "Preview the theme operation without writing files")
  .option("-o, --overwrite", "Replace theme tokens without prompting (saves a backup)")
  .option("--theme <preset>", "Switch theme: solace, porcelain, tobacco, marigold, or eucalyptus")
  .action(theme);

program
  .command("list")
  .description("List registry components and descriptions")
  .argument("[query]", "Filter names and descriptions by substring")
  .addOption(new Option("--registry-ref <ref>", "Registry tag or commit").conflicts("latest"))
  .addOption(new Option("--latest", "Use the current main registry").conflicts("registryRef"))
  .action(list);

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 3;
});
