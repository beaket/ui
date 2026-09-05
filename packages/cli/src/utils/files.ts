import { spawn } from "child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "path";
import prompts from "prompts";
import { normalize } from "./diff.ts";
import type { ComponentFile } from "./registry.ts";

export interface WriteResult {
  written: string[];
  skipped: string[];
  /** Files already identical to upstream — left untouched, no prompt. */
  unchanged: string[];
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export class DependencyInstallError extends Error {
  constructor(
    readonly packageManager: PackageManager,
    readonly command: string,
    readonly dependencies: string[],
    readonly code: number | null,
    cause?: Error,
  ) {
    super(
      cause
        ? `Could not start ${packageManager}: ${cause.message}`
        : `Dependency install exited with code ${code}`,
      { cause },
    );
    this.name = "DependencyInstallError";
  }
}

export async function writeComponentFiles(
  baseDir: string,
  files: ComponentFile[],
  overwrite: boolean = false,
): Promise<WriteResult> {
  const written: string[] = [];
  const skipped: string[] = [];
  const unchanged: string[] = [];

  for (const file of files) {
    // Transform file path: components/button.tsx -> button.tsx
    const relativePath = file.path.replace(/^components\//, "");
    const targetPath = path.join(baseDir, relativePath);

    // Check if file exists
    if (existsSync(targetPath)) {
      const local = await readFile(targetPath, "utf-8");
      const differs = normalize(local) !== normalize(file.content);

      // Already the latest — nothing to do, and no reason to nag the user.
      if (!differs) {
        unchanged.push(targetPath);
        continue;
      }

      if (!overwrite) {
        // Distinguish a real content difference from a bare name clash, so the
        // user knows their copy is out of sync — not just that a file is there.
        const { confirm } = await prompts({
          type: "confirm",
          name: "confirm",
          message: `${path.basename(targetPath)} differs from the registry version. Overwrite?`,
          initial: false,
        });
        if (!confirm) {
          skipped.push(targetPath);
          continue;
        }
      }
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.content);
    written.push(targetPath);
  }

  return { written, skipped, unchanged };
}

export async function installDependencies(deps: string[]): Promise<void> {
  const packageManager = await detectPackageManager();
  const installCmd = packageManager === "npm" ? "install" : "add";
  const args = [installCmd, ...deps];
  const command = [packageManager, ...args].join(" ");

  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, args, {
      stdio: "inherit",
    });

    child.once("error", (error) => {
      reject(new DependencyInstallError(packageManager, command, deps, null, error));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new DependencyInstallError(packageManager, command, deps, code));
      }
    });
  });
}

async function detectPackageManager(): Promise<PackageManager> {
  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  if (existsSync(path.join(cwd, "bun.lock"))) {
    return "bun";
  }

  return "npm";
}
