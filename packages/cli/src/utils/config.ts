import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "path";

export interface InstalledFile {
  ref: string;
  hash: string;
  cliVersion: string;
}

export const contentHash = (content: string): string =>
  createHash("sha256").update(content).digest("hex");

/**
 * Read and parse a JSON file, tolerating a BOM — Windows editors write one and
 * `JSON.parse` rejects it. Every JSON read in the CLI goes through this.
 */
export const readJson = async (file: string) =>
  JSON.parse((await readFile(file, "utf-8")).replace(/^\uFEFF/, ""));

export interface BeaketConfig {
  $schema?: string;
  components: string;
  css?: string;
  theme?: string;
  themeHash?: string;
  installed?: Record<string, Record<string, InstalledFile>>;
}

const CONFIG_FILE = "beaket.ui.json";

export async function getConfig(): Promise<BeaketConfig | null> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);

  if (!existsSync(configPath)) {
    return null;
  }

  return (await readJson(configPath)) as BeaketConfig;
}

export async function writeConfig(config: BeaketConfig): Promise<void> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  await writeFile(configPath, JSON.stringify(config, null, 2));
}
