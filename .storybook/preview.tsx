import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/styles.css";
import { forceScheme, hasDarkBlock } from "../src/themes/theme-css";

// Every palette as a raw string. `styles.css` already loads solace at :root as a
// baseline; the decorator below injects the *selected* palette on top of it.
import eucalyptus from "../src/themes/eucalyptus.css?inline";
import marigold from "../src/themes/marigold.css?inline";
import porcelain from "../src/themes/porcelain.css?inline";
import solace from "../src/themes/solace.css?inline";
import tobacco from "../src/themes/tobacco.css?inline";

const THEMES = { solace, porcelain, tobacco, marigold, eucalyptus } as const;
type ThemeName = keyof typeof THEMES;
type Scheme = "light" | "dark" | "system";

function applyGlobals(theme: ThemeName, scheme: Scheme) {
  if (typeof document === "undefined") return;
  const raw = THEMES[theme] ?? THEMES.solace;

  let el = document.getElementById("beaket-palette") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "beaket-palette";
    document.head.appendChild(el); // appended last → wins the :root cascade
  }
  el.textContent = scheme === "system" ? raw : (forceScheme(raw, scheme) ?? raw);

  // Hint native chrome (scrollbars, form controls). A light-only palette forced
  // to "dark" stays light, so keep colorScheme light to match.
  const effective = scheme === "dark" && !hasDarkBlock(raw) ? "light" : scheme;
  document.documentElement.style.colorScheme = effective === "system" ? "light dark" : effective;
}

// Apply a default immediately so any surface that renders before the decorator
// runs still resolves a palette.
applyGlobals("solace", "light");

const withTheme: Decorator = (Story, context) => {
  applyGlobals(context.globals.theme as ThemeName, context.globals.scheme as Scheme);
  return <Story />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // Keep the runner and the documented contract on the same WCAG rule set.
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      },
      test: "error",
    },

    options: {
      storySort: {
        method: "alphabetical",
        order: ["Introduction", "Overview", "Token", ["Colors", "Typography"], "UI"],
      },
    },
  },

  globalTypes: {
    theme: {
      description: "Palette",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "solace", title: "Solace" },
          { value: "porcelain", title: "Porcelain" },
          { value: "tobacco", title: "Tobacco" },
          { value: "marigold", title: "Marigold" },
          { value: "eucalyptus", title: "Eucalyptus" },
        ],
      },
    },
    scheme: {
      description: "Color scheme",
      toolbar: {
        title: "Scheme",
        icon: "contrast",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "system", title: "System", icon: "browser" },
        ],
      },
    },
  },

  initialGlobals: { theme: "solace", scheme: "light" },

  decorators: [withTheme],
};

export default preview;
