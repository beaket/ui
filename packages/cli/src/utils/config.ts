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

export interface BeaketConfig {
  $schema?: string;
  components: string;
  css?: string;
  theme?: string;
  installed?: Record<string, Record<string, InstalledFile>>;
}

const CONFIG_FILE = "beaket.ui.json";

export async function getConfig(): Promise<BeaketConfig | null> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);

  if (!existsSync(configPath)) {
    return null;
  }

  const content = await readFile(configPath, "utf-8");
  return JSON.parse(content) as BeaketConfig;
}

export async function writeConfig(config: BeaketConfig): Promise<void> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  await writeFile(configPath, JSON.stringify(config, null, 2));
}
