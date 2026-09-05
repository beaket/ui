import { styleText } from "node:util";
import path from "path";
import { getConfig } from "../utils/config.ts";
import {
  collapseContext,
  compareComponent,
  diffLines,
  isComponentInstalled,
  type ComponentComparison,
  type DiffLine,
} from "../utils/diff.ts";
import { fetchRegistry } from "../utils/registry.ts";

function printDiffLine(line: DiffLine): void {
  if (line.type === "add") console.log(styleText("green", `+ ${line.text}`));
  else if (line.type === "remove") console.log(styleText("red", `- ${line.text}`));
  else console.log(styleText("dim", `  ${line.text}`));
}

function printFileDiff(cmp: ComponentComparison): void {
  for (const file of cmp.files) {
    if (file.status === "same") continue;

    console.log();
    if (file.status === "missing") {
      console.log(
        styleText("yellow", `  ${file.path}`),
        styleText("dim", "(new file — not in your project)"),
      );
      continue;
    }

    console.log(styleText("bold", `  ${file.path}`));
    const lines = collapseContext(diffLines(file.local ?? "", file.upstream));
    lines.forEach(printDiffLine);
  }
}

/** How many files in a comparison actually changed (differ or are new). */
function changedCount(cmp: ComponentComparison): number {
  return cmp.files.filter((f) => f.status !== "same").length;
}

export async function diff(componentName: string | undefined) {
  console.log();

  const config = await getConfig();
  if (!config) {
    console.log(styleText("red", "Error:"), "beaket.ui.json not found.");
    console.log("Run", styleText("cyan", "npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  const registry = await fetchRegistry();
  const componentsDir = path.join(process.cwd(), config.components);

  // Single component: show the actual diff and how to update.
  if (componentName) {
    const def = registry.components.find((c) => c.name === componentName);
    if (!def) {
      console.log(styleText("red", "Error:"), `Component not found: ${componentName}`);
      console.log();
      console.log("Available components:");
      registry.components.forEach((c) => console.log(`  - ${c.name}`));
      process.exit(1);
    }

    const cmp = await compareComponent(def, componentsDir);

    if (cmp.status === "not-installed") {
      console.log(styleText("yellow", "ℹ"), `${componentName} is not installed.`);
      console.log("  Add it with", styleText("cyan", `npx @beaket/ui add ${componentName}`));
      console.log();
      return;
    }

    if (cmp.status === "up-to-date") {
      console.log(styleText("green", "✔"), `${componentName} is up to date with the registry.`);
      console.log();
      return;
    }

    console.log(
      styleText("yellow", "⚠"),
      `${componentName} differs from the latest registry version.`,
    );
    printFileDiff(cmp);
    console.log();
    console.log(styleText("dim", "You own this code — review the changes above, then either:"));
    console.log("  •", "hand-merge what you want to keep, or");
    console.log(
      "  •",
      "take the latest with",
      styleText("cyan", `npx @beaket/ui add ${componentName} --overwrite`),
    );
    console.log();
    return;
  }

  // Overview: check every installed component against the registry.
  const installed: typeof registry.components = [];
  for (const def of registry.components) {
    if (await isComponentInstalled(def, componentsDir)) installed.push(def);
  }

  if (installed.length === 0) {
    console.log(styleText("yellow", "ℹ"), `No Beaket UI components found in ${config.components}.`);
    console.log("  Add one with", styleText("cyan", "npx @beaket/ui add button"));
    console.log();
    return;
  }

  console.log(
    styleText("dim", `Checking ${installed.length} installed component(s) against the registry…`),
  );

  const results: ComponentComparison[] = [];
  for (const def of installed) results.push(await compareComponent(def, componentsDir));

  const outdated = results.filter((r) => r.status === "outdated");
  const upToDate = results.filter((r) => r.status === "up-to-date");

  console.log();
  if (upToDate.length > 0) {
    upToDate.forEach((r) =>
      console.log(styleText("green", "✔"), r.name, styleText("dim", "up to date")),
    );
  }
  outdated.forEach((r) => {
    const files = changedCount(r);
    console.log(
      styleText("yellow", "⚠"),
      r.name,
      styleText("dim", `${files} file(s) differ from the registry`),
    );
  });

  console.log();
  if (outdated.length === 0) {
    console.log(styleText("green", "All components match the registry."));
    console.log();
    return;
  }

  console.log(styleText("yellow", `${outdated.length} component(s) differ from the registry.`));
  console.log(
    styleText(
      "dim",
      "  (a difference may be an upstream restyle or your own edits — review before updating)",
    ),
  );
  console.log("  Review one with", styleText("cyan", "npx @beaket/ui diff <component>"));
  console.log(
    "  Update with     ",
    styleText("cyan", `npx @beaket/ui add ${outdated.map((r) => r.name).join(" ")} --overwrite`),
  );
  console.log();
}
