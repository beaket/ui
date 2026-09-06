import { styleText } from "node:util";
import { getConfig, writeConfig } from "../utils/config.ts";
import { syncTheme } from "../utils/theme.ts";
import { THEME_CSS, VALID_THEMES } from "../utils/themes.ts";

interface ThemeOptions {
  theme?: string;
  overwrite?: boolean;
}

export async function theme(options: ThemeOptions) {
  console.log();

  const config = await getConfig();
  if (!config) {
    console.log(styleText("red", "Error:"), "beaket.ui.json not found.");
    console.log("Run", styleText("cyan", "npx @beaket/ui init"), "first.");
    process.exit(1);
  }

  // Switch theme if --theme flag provided
  if (options.theme) {
    if (!VALID_THEMES.includes(options.theme)) {
      console.log(
        styleText("red", "Error:"),
        `Invalid theme "${options.theme}". Choose from: ${VALID_THEMES.join(", ")}`,
      );
      process.exit(1);
    }
    config.theme = options.theme;
  }

  const synced = await syncTheme(config, THEME_CSS, { overwrite: options.overwrite });

  // Persist theme change to config only after successful sync
  if (options.theme && synced) {
    await writeConfig(config);
    console.log(styleText("green", "✔"), `Switched to ${options.theme} theme.`);
  }

  console.log();
}
