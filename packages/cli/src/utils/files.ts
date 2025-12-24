import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import type { BeaketConfig } from "./config.ts";
import type { ComponentFile } from "./registry.ts";

export async function writeComponentFiles(
  baseDir: string,
  componentName: string,
  files: ComponentFile[],
  config: BeaketConfig,
): Promise<void> {
  for (const file of files) {
    // Transform file path: components/button/button.tsx -> button/button.tsx
    const relativePath = file.path.replace(/^components\//, "");
    const targetPath = path.join(baseDir, relativePath);

    // Transform imports in content
    let content = file.content;

    // Replace @/lib/utils with user's utils alias
    content = content.replace(/@\/lib\/utils/g, `${config.aliases.utils}/utils`);

    // Replace @/components with user's components alias
    content = content.replace(/@\/components/g, config.aliases.components);

    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, content);
  }
}

export async function installDependencies(deps: string[]): Promise<void> {
  const packageManager = await detectPackageManager();
  const installCmd = packageManager === "npm" ? "install" : "add";

  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, [installCmd, ...deps], {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to install dependencies (code ${code})`));
      }
    });
  });
}

async function detectPackageManager(): Promise<"npm" | "pnpm" | "yarn" | "bun"> {
  const cwd = process.cwd();

  if (await fs.pathExists(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await fs.pathExists(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  if (await fs.pathExists(path.join(cwd, "bun.lockb"))) {
    return "bun";
  }

  return "npm";
}
