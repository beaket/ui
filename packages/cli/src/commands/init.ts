import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { fileURLToPath } from "url";
import { writeConfig, type BeaketConfig } from "../utils/config.ts";

const cliRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const repoRoot = path.join(cliRoot, "..", "..");

function loadCssVariables(): string {
  // npm package: copied file exists
  const copiedPath = path.join(cliRoot, "src", "css-variables.css");
  if (fs.existsSync(copiedPath)) return fs.readFileSync(copiedPath, "utf-8");

  // Development: read from repo source
  return fs.readFileSync(path.join(repoRoot, "src", "css-variables.css"), "utf-8");
}

interface TsConfig {
  compilerOptions?: {
    paths?: Record<string, string[]>;
  };
}

async function detectAliasPath(): Promise<string> {
  const cwd = process.cwd();

  // Try to read tsconfig.json or tsconfig.app.json
  for (const configFile of ["tsconfig.json", "tsconfig.app.json"]) {
    const configPath = path.join(cwd, configFile);
    if (await fs.pathExists(configPath)) {
      try {
        const content = await fs.readFile(configPath, "utf-8");
        const tsconfig: TsConfig = JSON.parse(content);
        const paths = tsconfig.compilerOptions?.paths;
        if (paths?.["@/*"]) {
          const aliasPath = paths["@/*"][0];
          // "./src/*" -> "src", "./*" -> ""
          const prefix = aliasPath.replace(/^\.\/|\/?\*$/g, "");
          return prefix ? `${prefix}/components/ui` : "components/ui";
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Fallback: detect from package.json
  const pkgPath = path.join(cwd, "package.json");
  if (await fs.pathExists(pkgPath)) {
    try {
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      // Next.js uses root alias by default
      if (deps.next) {
        return "components/ui";
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Default to src/components/ui (Vite style)
  return "src/components/ui";
}

async function detectCssPath(): Promise<string> {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, "package.json");

  if (await fs.pathExists(pkgPath)) {
    try {
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) {
        return "app/globals.css";
      }
    } catch {
      // Ignore parse errors
    }
  }

  return "src/index.css";
}

interface InitOptions {
  yes?: boolean;
}

export async function init(options: InitOptions) {
  console.log();
  console.log(pc.bold("Initializing Beaket UI..."));
  console.log();

  const detectedComponentsPath = await detectAliasPath();
  const detectedCssPath = await detectCssPath();

  let response: { components: string; css: string };

  if (options.yes) {
    response = { components: detectedComponentsPath, css: detectedCssPath };
  } else {
    response = await prompts([
      {
        type: "text",
        name: "components",
        message: "Where should components be installed?",
        initial: detectedComponentsPath,
      },
      {
        type: "text",
        name: "css",
        message: "Where is your Tailwind CSS file?",
        initial: detectedCssPath,
      },
    ]);

    if (!response.components) {
      console.log(pc.red("Cancelled."));
      process.exit(1);
    }
  }

  // Write beaket.ui.json (only components path)
  const config: BeaketConfig = {
    $schema: "https://beaket.dev/schema.json",
    components: response.components,
  };

  await writeConfig(config);
  console.log(pc.green("✔"), "Created beaket.ui.json");

  // Inject CSS variables into Tailwind CSS file
  if (response.css) {
    const cssPath = path.join(process.cwd(), response.css);
    if (await fs.pathExists(cssPath)) {
      const cssContent = await fs.readFile(cssPath, "utf-8");
      if (!cssContent.includes("Beaket UI Design System")) {
        await fs.writeFile(cssPath, cssContent + loadCssVariables());
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
