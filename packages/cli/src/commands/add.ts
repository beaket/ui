import { styleText } from "node:util";
import path from "path";
import { getConfig } from "../utils/config.ts";
import {
  DependencyInstallError,
  installDependencies,
  writeComponentFiles,
} from "../utils/files.ts";
import { reactFloorWarning, readInstalledReact } from "../utils/react-version.ts";
import { fetchComponent, fetchRegistry } from "../utils/registry.ts";
import { syncTheme } from "../utils/theme.ts";
import { THEME_CSS } from "../utils/themes.ts";

interface AddOptions {
  overwrite?: boolean;
}

export async function add(componentNames: string[], options: AddOptions) {
  console.log();

  // Read config
  const config = await getConfig();
  if (!config) {
    console.log(styleText("red", "Error:"), "beaket.ui.json not found.");
    console.log("Run", styleText("cyan", "npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  // Fetch registry
  const registry = await fetchRegistry();
  console.log(styleText("green", "✔"), "Checking registry.");

  // Validate all components exist
  const notFound: string[] = [];
  const componentDefs = componentNames.map((name) => {
    const def = registry.components.find((c) => c.name === name);
    if (!def) notFound.push(name);
    return def;
  });

  if (notFound.length > 0) {
    console.log(styleText("red", "Error:"), `Component(s) not found: ${notFound.join(", ")}`);
    console.log();
    console.log("Available components:");
    registry.components.forEach((c) => {
      console.log(`  - ${c.name}`);
    });
    process.exit(1);
  }

  // Check the React floor. Deliberately a check and not an install: the files
  // are still written, because the consumer may be about to upgrade React and a
  // copy-paste library has no business changing their React version.
  const installedReact = await readInstalledReact(process.cwd());
  const floorWarning = reactFloorWarning(
    registry.react,
    componentDefs.filter((def) => def !== undefined),
    installedReact,
  );
  if (floorWarning) {
    const { floor, names } = floorWarning;
    console.log();
    console.log(
      styleText("yellow", "!"),
      `${names.join(", ")} need${names.length === 1 ? "s" : ""} React ${floor} — found ${installedReact}.`,
    );
    console.log("  The files are still copied; they may fail at runtime until React is upgraded.");
    console.log();
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
    try {
      console.log("  Installing dependencies…");
      await installDependencies([...allDependencies]);
      console.log(styleText("green", "✔"), "Installed dependencies.");
    } catch (error) {
      if (!(error instanceof DependencyInstallError)) throw error;

      console.log();
      console.log(styleText("red", "!"), "Could not install component dependencies.");
      console.log("  Package manager:", styleText("cyan", error.packageManager));
      console.log("  Command:", styleText("cyan", error.command));
      console.log("  Dependencies:", error.dependencies.join(", "));
      console.log("  Install them manually, then retry this command.");
      console.log(" ", styleText("cyan", error.command));
      if (error.packageManager === "npm") {
        console.log("  If npm reports a peer-dependency conflict, retry with:");
        console.log(" ", styleText("cyan", `${error.command} --legacy-peer-deps`));
      }
      console.log(styleText("yellow", "ℹ"), "Continuing to add component files.");
      process.exitCode = 1;
    }
  }

  // Fetch and write all component files
  const componentsDir = path.join(process.cwd(), config.components);
  const allWritten: string[] = [];
  const allSkipped: string[] = [];
  const allUnchanged: string[] = [];

  for (const def of componentDefs) {
    if (!def) continue;
    const files = await fetchComponent(def);
    const { written, skipped, unchanged } = await writeComponentFiles(
      componentsDir,
      files,
      options.overwrite,
    );
    allWritten.push(...written);
    allSkipped.push(...skipped);
    allUnchanged.push(...unchanged);
  }

  // Files already matching upstream — reassure rather than warn.
  if (allUnchanged.length > 0) {
    console.log(styleText("green", "✔"), `${allUnchanged.length} file(s) already up to date.`);
  }

  // Show skipped files
  if (allSkipped.length > 0) {
    console.log(
      styleText("yellow", "ℹ"),
      `Skipped ${allSkipped.length} file(s): (use --overwrite to take the latest)`,
    );
    allSkipped.forEach((f) => console.log(`  - ${f}`));
    console.log(
      styleText("dim", "  See what changed with"),
      styleText("cyan", "npx @beaket/ui diff <component>"),
    );
  }

  if (allWritten.length === 0) {
    console.log();
    return;
  }

  console.log();
  console.log("Added:");
  allWritten.forEach((f) => console.log(styleText("cyan", `  ${f}`)));

  // Sync theme tokens
  if (config.css) {
    console.log();
    await syncTheme(config, THEME_CSS, { overwrite: options.overwrite });
  }

  console.log();
}
