import fs from "fs-extra";
import path from "path";

export interface BeaketConfig {
  $schema?: string;
  components: string;
  css?: string;
  theme?: string;
}

const CONFIG_FILE = "beaket.ui.json";

export async function getConfig(): Promise<BeaketConfig | null> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const content = await fs.readFile(configPath, "utf-8");
  return JSON.parse(content) as BeaketConfig;
}

export async function writeConfig(config: BeaketConfig): Promise<void> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}
