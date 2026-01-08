import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { writeConfig, type BeaketConfig } from "../utils/config.ts";

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

const CSS_VARIABLES = `
/* Beaket UI Design System */
@theme {
  --color-inverse: var(--paper);
  --shadow-offset: 2px 2px 0px 0px var(--chrome);
  --shadow-offset-dark: 2px 2px 0px 0px var(--aluminum);
  --shadow-offset-hover: 3px 3px 0px 0px var(--chrome);
  --shadow-offset-active: 1px 1px 0px 0px var(--chrome);
}

:root {
  --graphite: #0d0d0d;
  --ink: #1a1a1a;
  --branch: #1c1f24;
  --iron: #2d2d2d;
  --slate: #404040;
  --zinc: #525252;
  --steel: #595959;
  --aluminum: #9e9e9e;
  --chrome: #d0d0d0;
  --silver: #dedede;
  --platinum: #e8e8e8;
  --frost: #f5f5f5;
  --paper: #fafafa;
  --signal-blue: #00449e;
  --signal-red: #c41e1e;
  --signal-red-hover: #b71c1c;
  --signal-red-active: #9a1919;
  --signal-green: #00794c;
  --signal-green-hover: #0f5f42;
  --signal-green-active: #0a4a32;
  --signal-amber: #b8860b;
  --signal-amber-hover: #9a7209;
  --signal-amber-active: #7a5a07;
  --signal-purple: #6f2da8;
  --signal-cyan: #1a6b7c;
}
`;

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
