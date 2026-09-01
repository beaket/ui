import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { writeConfig, type BeaketConfig } from "../utils/config.ts";
import { replaceThemeInCss } from "../utils/theme.ts";
import { THEME_CSS, VALID_THEMES } from "../utils/themes.ts";

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
  theme?: string;
}

export async function init(options: InitOptions) {
  console.log();
  console.log(pc.bold("Initializing Beaket UI..."));
  console.log();

  // Validate --theme flag early
  if (options.theme && !VALID_THEMES.includes(options.theme)) {
    console.log(
      pc.red("Error:"),
      `Invalid theme "${options.theme}". Choose from: ${VALID_THEMES.join(", ")}`,
    );
    process.exit(1);
  }

  const detectedComponentsPath = await detectAliasPath();
  const detectedCssPath = await detectCssPath();

  let response: { components: string; css: string; theme: string };

  if (options.yes) {
    response = {
      components: detectedComponentsPath,
      css: detectedCssPath,
      theme: options.theme || "solace",
    };
  } else {
    const answers = await prompts([
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
      {
        type: options.theme ? null : "select",
        name: "theme",
        message: "Choose a theme",
        choices: [
          { title: "Solace — warm paper, cool ink, one vivid blue for action", value: "solace" },
          {
            title: "Porcelain — near-white paper, cool graphite ink, balanced",
            value: "porcelain",
          },
          { title: "Tobacco — warm earthen paper, quiet low-chroma signals", value: "tobacco" },
          { title: "Marigold — pure-grey paper, the loudest signals", value: "marigold" },
          { title: "Eucalyptus — cool-blue paper, vivid high-chroma signals", value: "eucalyptus" },
        ],
        initial: 0,
      },
    ]);

    if (!answers.components) {
      console.log(pc.red("Cancelled."));
      process.exit(1);
    }

    response = {
      components: answers.components,
      css: answers.css,
      theme: options.theme || answers.theme || "solace",
    };
  }

  // Write beaket.ui.json
  const config: BeaketConfig = {
    components: response.components,
    css: response.css || undefined,
    theme: response.theme,
  };

  await writeConfig(config);
  console.log(pc.green("✔"), "Created beaket.ui.json");

  // Inject CSS variables into Tailwind CSS file
  const selectedCss = THEME_CSS[response.theme];
  if (!selectedCss) {
    console.log(pc.red("Error:"), `Unknown theme "${response.theme}".`);
    process.exit(1);
  }
  if (response.css) {
    const cssPath = path.join(process.cwd(), response.css);
    if (await fs.pathExists(cssPath)) {
      const cssContent = await fs.readFile(cssPath, "utf-8");
      if (
        !cssContent.includes("Beaket UI Design System") &&
        !cssContent.includes("beaket:theme:start")
      ) {
        const { css } = replaceThemeInCss(cssContent, selectedCss);
        await fs.writeFile(cssPath, css);
        console.log(pc.green("✔"), `Added CSS variables to ${response.css}`);
        console.log(pc.green("✔"), `Using ${response.theme} theme`);
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
