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
  references?: Array<{ path?: string } | string>;
}

function componentPathFromAlias(paths?: Record<string, string[]>): string | undefined {
  if (!paths) return undefined;

  let componentAliasPath: string | undefined;
  for (const [alias, targets] of Object.entries(paths)) {
    // A single wildcard alias maps an import root to a source directory, e.g.
    // "@/*" -> "./src/*" or "~/*" -> "./app/*".
    const aliasRoot = alias.slice(0, -2);
    if (!alias.endsWith("/*") || aliasRoot.includes("/")) continue;

    const target = targets[0];
    if (!target?.endsWith("/*")) continue;

    const prefix = target.replace(/^\.\//, "").replace(/\/?\*$/, "");
    if (prefix.endsWith("/components") || prefix === "components") {
      componentAliasPath = prefix ? `${prefix}/ui` : "ui";
      continue;
    }

    return prefix ? `${prefix}/components/ui` : "components/ui";
  }

  return componentAliasPath;
}

function removeTrailingCommas(content: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (inString) {
      result += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      result += character;
    } else if (character === ",") {
      let nextIndex = index + 1;
      while (/\s/.test(content[nextIndex] ?? "")) nextIndex += 1;
      if (content[nextIndex] !== "}" && content[nextIndex] !== "]") result += character;
    } else {
      result += character;
    }
  }

  return result;
}

function parseTsConfig(content: string): TsConfig {
  let withoutComments = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (inString) {
      withoutComments += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      withoutComments += character;
    } else if (character === "/" && nextCharacter === "/") {
      while (index < content.length && content[index] !== "\n") index += 1;
      withoutComments += "\n";
    } else if (character === "/" && nextCharacter === "*") {
      index += 2;
      while (index < content.length && !(content[index] === "*" && content[index + 1] === "/")) {
        index += 1;
      }
      index += 1;
    } else {
      withoutComments += character;
    }
  }

  return JSON.parse(removeTrailingCommas(withoutComments)) as TsConfig;
}

async function readTsConfig(configPath: string, visited: Set<string>): Promise<string | undefined> {
  const resolvedPath = path.resolve(configPath);
  if (visited.has(resolvedPath) || !(await fs.pathExists(resolvedPath))) return undefined;
  visited.add(resolvedPath);

  try {
    const tsconfig = parseTsConfig(await fs.readFile(resolvedPath, "utf-8"));
    const componentPath = componentPathFromAlias(tsconfig.compilerOptions?.paths);
    if (componentPath) return componentPath;

    for (const reference of tsconfig.references ?? []) {
      const referencePath = typeof reference === "string" ? reference : reference.path;
      if (!referencePath) continue;

      const referencedConfig = path.resolve(path.dirname(resolvedPath), referencePath);
      const configFile = referencedConfig.endsWith(".json")
        ? referencedConfig
        : path.join(referencedConfig, "tsconfig.json");
      const referencedComponentPath = await readTsConfig(configFile, visited);
      if (referencedComponentPath) return referencedComponentPath;
    }
  } catch {
    // Ignore parse errors and continue with other configs.
  }
}

export async function detectAliasPath(cwd = process.cwd()): Promise<string> {
  // Check the root configs, then follow project references (used by React Router).
  for (const configFile of ["tsconfig.json", "tsconfig.app.json"]) {
    const componentPath = await readTsConfig(path.join(cwd, configFile), new Set());
    if (componentPath) return componentPath;
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

async function containsTailwindImport(filePath: string): Promise<boolean> {
  try {
    return /@import\s+["']tailwindcss["']/.test(await fs.readFile(filePath, "utf-8"));
  } catch {
    return false;
  }
}

async function findTailwindCssFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const ignoredDirectories = new Set([".git", "build", "dist", "node_modules"]);

  async function visit(currentDirectory: string) {
    const entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
        await visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".css")) {
        files.push(entryPath);
      }
    }
  }

  try {
    await visit(directory);
  } catch {
    // A missing or unreadable directory simply has no CSS candidates.
  }
  return files;
}

export async function detectCssPath(cwd = process.cwd()): Promise<string> {
  const pkgPath = path.join(cwd, "package.json");
  let nextProject = false;

  if (await fs.pathExists(pkgPath)) {
    try {
      const content = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      nextProject = Boolean(deps.next);
    } catch {
      // Ignore parse errors
    }
  }

  const candidates = [
    "app/app.css",
    "src/app/globals.css",
    "app/globals.css",
    "src/index.css",
    "src/app.css",
    "src/styles.css",
    "styles/globals.css",
  ];
  const existingCandidates = [] as string[];
  for (const candidate of candidates) {
    const candidatePath = path.join(cwd, candidate);
    if (await fs.pathExists(candidatePath)) existingCandidates.push(candidate);
  }

  for (const candidate of existingCandidates) {
    if (await containsTailwindImport(path.join(cwd, candidate))) return candidate;
  }

  const cssFiles = await findTailwindCssFiles(cwd);
  for (const cssFile of cssFiles) {
    if (await containsTailwindImport(cssFile)) return path.relative(cwd, cssFile);
  }

  return existingCandidates[0] ?? (nextProject ? "app/globals.css" : "src/index.css");
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
