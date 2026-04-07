import pc from "picocolors";
import { getConfig, writeConfig } from "../utils/config.ts";
import { syncTheme } from "../utils/theme.ts";
import { THEME_CSS, VALID_THEMES } from "../utils/themes.ts";

interface ThemeOptions {
  theme?: string;
}

export async function theme(options: ThemeOptions) {
  console.log();

  const config = await getConfig();
  if (!config) {
    console.log(pc.red("Error:"), "beaket.ui.json not found.");
    console.log("Run", pc.cyan("npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  // Switch theme if --theme flag provided
  if (options.theme) {
    if (!VALID_THEMES.includes(options.theme)) {
      console.log(
        pc.red("Error:"),
        `Invalid theme "${options.theme}". Choose from: ${VALID_THEMES.join(", ")}`,
      );
      process.exit(1);
    }
    config.theme = options.theme;
  }

  await syncTheme(config, THEME_CSS, { overwrite: true });

  // Persist theme change to config only after successful sync
  if (options.theme) {
    await writeConfig(config);
    console.log(pc.green("✔"), `Switched to ${options.theme} theme.`);
  }

  console.log();
}
