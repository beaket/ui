import { useState } from "react";

const themes = {
  porcelain: {
    label: "Porcelain",
    subtitle: "Pure white, cold precision, teal accent",
    tokens: {
      "--color-graphite": "#030509",
      "--color-ink": "#080b12",
      "--color-branch": "#05070d",
      "--color-iron": "#282b30",
      "--color-slate": "#3e4146",
      "--color-zinc": "#53565c",
      "--color-steel": "#686b70",
      "--color-muted": "#7a7d82",
      "--color-aluminum": "#a0a3a8",
      "--color-chrome": "#c0c5cc",
      "--color-silver": "#d5d8dd",
      "--color-platinum": "#e8eaed",
      "--color-frost": "#f3f4f6",
      "--color-paper": "#ffffff",
      "--color-surface-0": "#eff0f2",
      "--color-surface-1": "#f8f8fa",
      "--color-surface-2": "#ffffff",
      "--color-signal-blue": "#1565c0",
      "--color-signal-red": "#d32f2f",
      "--color-signal-green": "#0d7c66",
      "--color-signal-amber": "#c49000",
      "--color-signal-purple": "#6a1b9a",
    },
    shadow: { default: "1px 1px", hover: "2px 2px", active: "0px 0px" },
    shadowColor: "chrome",
  },
  tobacco: {
    label: "Tobacco",
    subtitle: "Warm pampas cream, terracotta, brown shadows",
    tokens: {
      "--color-graphite": "#111110",
      "--color-ink": "#1a1a18",
      "--color-branch": "#222120",
      "--color-iron": "#312f2c",
      "--color-slate": "#46443e",
      "--color-zinc": "#585650",
      "--color-steel": "#5e5d54",
      "--color-muted": "#6b6a60",
      "--color-aluminum": "#9c9a90",
      "--color-chrome": "#d0cec5",
      "--color-silver": "#dddbd3",
      "--color-platinum": "#e8e7e0",
      "--color-frost": "#edece6",
      "--color-paper": "#f4f3ee",
      "--color-surface-0": "#e8e7e0",
      "--color-surface-1": "#f4f3ee",
      "--color-surface-2": "#faf9f5",
      "--color-signal-blue": "#3a5f9e",
      "--color-signal-red": "#c15f3c",
      "--color-signal-green": "#4a8a5e",
      "--color-signal-amber": "#b8860b",
      "--color-signal-purple": "#845aa0",
    },
    shadow: { default: "2px 2px", hover: "3px 3px", active: "1px 1px" },
    shadowColor: "iron",
  },
  marigold: {
    label: "Marigold",
    subtitle: "Pure white, ink-black shadows, loud signals",
    tokens: {
      "--color-graphite": "#0a0a0a",
      "--color-ink": "#121212",
      "--color-branch": "#1a1a1a",
      "--color-iron": "#262626",
      "--color-slate": "#3a3a3a",
      "--color-zinc": "#4e4e4e",
      "--color-steel": "#5a5a5a",
      "--color-muted": "#6e6e6e",
      "--color-aluminum": "#949494",
      "--color-chrome": "#c0c0c0",
      "--color-silver": "#cfcfcf",
      "--color-platinum": "#e0e0e0",
      "--color-frost": "#f0f0f0",
      "--color-paper": "#ffffff",
      "--color-surface-0": "#ebebeb",
      "--color-surface-1": "#f8f8f8",
      "--color-surface-2": "#ffffff",
      "--color-signal-blue": "#0055ff",
      "--color-signal-red": "#f24e1e",
      "--color-signal-green": "#0acf83",
      "--color-signal-amber": "#ff9500",
      "--color-signal-purple": "#a259ff",
    },
    shadow: { default: "3px 3px", hover: "4px 4px", active: "1px 1px" },
    shadowColor: "ink",
  },
  eucalyptus: {
    label: "Eucalyptus",
    subtitle: "Titanium blue-gray, navy ink, enterprise",
    tokens: {
      "--color-graphite": "#0a1025",
      "--color-ink": "#162036",
      "--color-branch": "#1c2a42",
      "--color-iron": "#243250",
      "--color-slate": "#2f3f58",
      "--color-zinc": "#384d68",
      "--color-steel": "#3d5170",
      "--color-muted": "#5a6d88",
      "--color-aluminum": "#8295ae",
      "--color-chrome": "#c0cddb",
      "--color-silver": "#cdd8e4",
      "--color-platinum": "#dce3ed",
      "--color-frost": "#eff2f8",
      "--color-paper": "#f8f9fc",
      "--color-surface-0": "#e6ebf2",
      "--color-surface-1": "#f8f9fc",
      "--color-surface-2": "#ffffff",
      "--color-signal-blue": "#2563eb",
      "--color-signal-red": "#dc2626",
      "--color-signal-green": "#059669",
      "--color-signal-amber": "#d97706",
      "--color-signal-purple": "#7c3aed",
    },
    shadow: { default: "2px 2px", hover: "3px 3px", active: "1px 1px" },
    shadowColor: "chrome",
  },
} as const;

type ThemeKey = keyof typeof themes;

const neutralSwatches = [
  { key: "--color-paper", label: "Paper" },
  { key: "--color-frost", label: "Frost" },
  { key: "--color-chrome", label: "Chrome" },
  { key: "--color-muted", label: "Muted" },
  { key: "--color-ink", label: "Ink" },
  { key: "--color-graphite", label: "Graphite" },
] as const;

const signalSwatches = [
  { key: "--color-signal-blue", label: "Blue" },
  { key: "--color-signal-red", label: "Red" },
  { key: "--color-signal-green", label: "Green" },
  { key: "--color-signal-amber", label: "Amber" },
  { key: "--color-signal-purple", label: "Purple" },
] as const;

function buildThemeStyle(theme: (typeof themes)[ThemeKey]) {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.tokens)) {
    style[key] = value;
  }
  const sc =
    theme.tokens[`--color-${theme.shadowColor}` as keyof typeof theme.tokens] ||
    theme.tokens["--color-chrome"];
  style["--shadow-offset"] = `${theme.shadow.default} 0px 0px ${sc}`;
  style["--shadow-offset-dark"] =
    `${theme.shadow.default} 0px 0px ${theme.tokens["--color-aluminum"]}`;
  style["--shadow-offset-hover"] = `${theme.shadow.hover} 0px 0px ${sc}`;
  style["--shadow-offset-active"] = `${theme.shadow.active} 0px 0px ${sc}`;
  return style;
}

export function ThemeDemo() {
  const [active, setActive] = useState<ThemeKey>("porcelain");
  const theme = themes[active];
  const themeStyle = buildThemeStyle(theme);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(themes) as ThemeKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={
              active === key
                ? "border-ink bg-ink text-paper border-2 px-4 py-2 text-sm font-semibold"
                : "border-ink bg-paper text-ink border-2 px-4 py-2 text-sm font-semibold"
            }
            style={{ cursor: "pointer" }}
          >
            {themes[key].label}
          </button>
        ))}
      </div>

      <p className="text-steel mb-1 text-sm font-semibold">{theme.subtitle}</p>
      <p className="text-muted mb-6 text-xs">
        Shadow: {theme.shadow.default} {theme.shadowColor} | Paper: {theme.tokens["--color-paper"]}
      </p>

      <div className="border-chrome bg-surface-0 border-2 p-6" style={themeStyle}>
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border-chrome bg-paper shadow-offset border-2 p-5">
            <h3 className="text-ink mb-2 text-base font-bold">Card Title</h3>
            <p className="text-steel mb-4 text-sm">
              Paper, ink, border, and shadow working together.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className="border-ink bg-ink text-paper border-2 px-4 py-2 text-sm font-semibold"
                style={{ cursor: "pointer" }}
              >
                Action
              </button>
              <button
                className="border-ink bg-paper text-ink border-2 px-4 py-2 text-sm font-semibold"
                style={{ cursor: "pointer" }}
              >
                Outline
              </button>
            </div>
          </div>
          <div>
            <label className="text-ink mb-1.5 block text-sm font-semibold">Text Input</label>
            <input
              type="text"
              placeholder="Placeholder text..."
              className="border-chrome bg-frost text-ink mb-4 w-full border-2 px-3 py-2 text-sm outline-none"
            />
            <p className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
              Signal Colors
            </p>
            <div className="flex flex-wrap gap-2">
              {signalSwatches.map(({ key, label }) => {
                const hex = theme.tokens[key as keyof typeof theme.tokens];
                return (
                  <span
                    key={key}
                    className="border-2 px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: hex, borderColor: hex, color: "#ffffff" }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
            Surface Depth
          </p>
          <div className="border-chrome bg-surface-0 border-2 p-4">
            <code className="text-muted text-xs">surface-0</code>
            <div className="border-chrome bg-surface-1 mt-2 border-2 p-3">
              <code className="text-muted text-xs">surface-1</code>
              <div className="border-chrome bg-surface-2 mt-2 border-2 p-3">
                <code className="text-muted text-xs">surface-2</code>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
              Neutrals
            </p>
            <div className="flex gap-1">
              {neutralSwatches.map(({ key, label }) => {
                const hex = theme.tokens[key as keyof typeof theme.tokens];
                const isLight = ["Paper", "Frost", "Chrome"].includes(label);
                return (
                  <div key={key} className="flex-1 text-center">
                    <div
                      className="border-chrome flex h-12 items-end justify-center border p-0.5"
                      style={{ backgroundColor: hex }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: isLight
                            ? theme.tokens["--color-ink"]
                            : theme.tokens["--color-paper"],
                        }}
                      >
                        {hex}
                      </span>
                    </div>
                    <span className="text-steel mt-0.5 block" style={{ fontSize: 10 }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
              Signals
            </p>
            <div className="flex gap-1">
              {signalSwatches.map(({ key, label }) => {
                const hex = theme.tokens[key as keyof typeof theme.tokens];
                return (
                  <div key={key} className="flex-1 text-center">
                    <div
                      className="flex h-12 items-end justify-center border p-0.5"
                      style={{ backgroundColor: hex, borderColor: hex }}
                    >
                      <span style={{ fontSize: 9, color: "#ffffff" }}>{hex}</span>
                    </div>
                    <span className="text-steel mt-0.5 block" style={{ fontSize: 10 }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-steel mb-2 text-xs font-semibold tracking-wider uppercase">CLI Usage</p>
        <pre className="bg-ink text-paper border-ink overflow-auto border-2 p-4 text-sm">
          <code>{`npx @beaket/ui init --theme ${active}`}</code>
        </pre>
      </div>
    </div>
  );
}
