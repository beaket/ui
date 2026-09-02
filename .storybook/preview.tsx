import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/styles.css";

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

// Whitespace-tolerant so it survives CSS minification in `storybook build`
// (`prefers-color-scheme:dark` with the space collapsed still matches).
const DARK_BLOCK = /@media[^{]*prefers-color-scheme[^{]*dark[^{]*\{/i;
const HAS_DARK = /@media[^{]*prefers-color-scheme[^{]*dark/i;

/**
 * Return a theme's palette CSS, forcing a color scheme when asked.
 *
 * Themes wrap their dark ramp in `@media (prefers-color-scheme: dark) { :root {…} }`:
 * - "system" — leave as authored, follows the OS.
 * - "light"  — drop the dark block so the OS can't flip it.
 * - "dark"   — unwrap the dark block so its `:root` wins unconditionally.
 *
 * Any parse surprise falls back to the raw CSS (i.e. system behaviour), so the
 * toolbar can never leave the page with an undefined palette.
 */
function paletteFor(raw: string, scheme: Scheme): string {
  if (scheme === "system") return raw;
  const m = raw.match(DARK_BLOCK);
  if (!m || m.index === undefined) return raw; // palette without a dark twin

  const at = m.index;
  const open = at + m[0].length - 1; // index of the block-opening `{`
  let depth = 0;
  let close = -1;
  for (let i = open; i < raw.length; i++) {
    if (raw[i] === "{") depth++;
    else if (raw[i] === "}") {
      depth--;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1) return raw;

  const withoutDark = raw.slice(0, at) + raw.slice(close + 1);
  if (scheme === "light") return withoutDark;
  return withoutDark + "\n" + raw.slice(open + 1, close); // the inner `:root {…}`
}

function applyGlobals(theme: ThemeName, scheme: Scheme) {
  if (typeof document === "undefined") return;
  const raw = THEMES[theme] ?? THEMES.solace;

  let el = document.getElementById("beaket-palette") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "beaket-palette";
    document.head.appendChild(el); // appended last → wins the :root cascade
  }
  el.textContent = paletteFor(raw, scheme);

  // Hint native chrome (scrollbars, form controls). A light-only palette forced
  // to "dark" stays light, so keep colorScheme light to match.
  const effective = scheme === "dark" && !HAS_DARK.test(raw) ? "light" : scheme;
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
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
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
