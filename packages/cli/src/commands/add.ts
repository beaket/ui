import { styleText } from "node:util";
import path from "path";
import { contentHash, getConfig, writeConfig } from "../utils/config.ts";
import {
  DependencyInstallError,
  installDependencies,
  writeComponentFiles,
} from "../utils/files.ts";
import { reactFloorWarning, readInstalledReact } from "../utils/react-version.ts";
import {
  CLI_VERSION,
  fetchComponent,
  fetchRegistry,
  printCatalog,
  resolveComponents,
  resolveRegistryRef,
  type RegistryOptions,
} from "../utils/registry.ts";
import { syncTheme } from "../utils/theme.ts";
import { THEME_CSS } from "../utils/themes.ts";
import { requireTypeScript } from "../utils/typescript.ts";

interface AddOptions extends RegistryOptions {
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

  await requireTypeScript();

  // Fetch registry
  const ref = await resolveRegistryRef(options);
  const registry = await fetchRegistry(ref);
  console.log(styleText("green", "✔"), "Checking registry.");

  // Validate all components exist
  const notFound: string[] = [];
  componentNames.forEach((name) => {
    const def = registry.components.find((c) => c.name === name);
    if (!def) notFound.push(name);
  });

  if (notFound.length > 0) {
    console.log(styleText("red", "Error:"), `Component(s) not found: ${notFound.join(", ")}`);
    console.log();
    printCatalog(registry);
    process.exit(1);
  }
  const componentDefs = resolveComponents(registry, componentNames);

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
  const allOverwritten: string[] = [];
  const allBackups: string[] = [];
  const allSkipped: string[] = [];
  const allPreserved: string[] = [];
  const allConflicts: Array<{ path: string; hunk: string }> = [];
  const allUnchanged: string[] = [];

  for (const def of componentDefs) {
    if (!def) continue;
    const files = await fetchComponent(def, ref);
    const baselines: Record<string, string> = {};
    if (options.overwrite) {
      for (const file of files) {
        const recorded = config.installed?.[def.name]?.[file.path];
        if (!recorded) continue;
        const [baseline] = await fetchComponent({ ...def, files: [file.path] }, recorded.ref);
        if (contentHash(baseline.content) !== recorded.hash)
          throw new Error(
            `Baseline hash mismatch for ${file.path} at ${recorded.ref}; refusing to merge.`,
          );
        baselines[file.path] = baseline.content;
      }
    }
    const { written, overwritten, backups, skipped, preserved, conflicts, unchanged } =
      await writeComponentFiles(componentsDir, files, options.overwrite, baselines);
    allWritten.push(...written);
    allOverwritten.push(...overwritten);
    allBackups.push(...backups);
    allSkipped.push(...skipped);
    allPreserved.push(...preserved);
    allConflicts.push(...conflicts);
    allUnchanged.push(...unchanged);
    for (const file of files) {
      const target = path.join(componentsDir, file.path.replace(/^components\//, ""));
      if (!written.includes(target) && !unchanged.includes(target) && !preserved.includes(target))
        continue;
      config.installed ??= {};
      config.installed[def.name] ??= {};
      config.installed[def.name][file.path] = {
        ref,
        hash: contentHash(file.content),
        cliVersion: CLI_VERSION,
      };
    }
    // Persist each successful component, including no-op installs; never relabel skipped edits.
    await writeConfig(config);
  }

  // Files already matching upstream — reassure rather than warn.
  if (allUnchanged.length > 0) {
    console.log(styleText("green", "✔"), `${allUnchanged.length} file(s) already up to date.`);
  }

  // Show skipped files
  if (allSkipped.length > 0) {
    console.log(
      styleText("yellow", "ℹ"),
      `Skipped ${allSkipped.length} file(s): review local edits before replacing them.`,
    );
    allSkipped.forEach((f) => console.log(`  - ${f}`));
    console.log(
      styleText("dim", "  See what changed with"),
      styleText("cyan", "npx @beaket/ui diff <component>"),
    );
  }

  if (allPreserved.length > 0) {
    console.log(
      styleText("green", "✔"),
      `Kept ${allPreserved.length} local file(s); upstream is unchanged.`,
    );
  }

  if (allConflicts.length > 0) {
    process.exitCode = Math.max(Number(process.exitCode ?? 0), 2);
    console.log(
      styleText("red", "!"),
      `Could not merge ${allConflicts.length} file(s); nothing was overwritten.`,
    );
    for (const conflict of allConflicts) {
      console.log(styleText("cyan", `  ${conflict.path}`));
      console.log(conflict.hunk);
    }
  }

  if (allWritten.length === 0) {
    console.log();
    return;
  }

  console.log();
  const added = allWritten.filter((file) => !allOverwritten.includes(file));
  for (const [label, files] of [
    ["Added:", added],
    ["Overwrote:", allOverwritten],
    ["Backups:", allBackups],
  ] as const) {
    if (!files.length) continue;
    console.log(label);
    files.forEach((file) => console.log(styleText("cyan", `  ${file}`)));
  }

  // Sync theme tokens
  if (config.css) {
    console.log();
    await syncTheme(config, THEME_CSS, { overwrite: options.overwrite });
  }

  console.log();
}
