import { useState } from "react";
import themeTokensData from "../data/theme-tokens.json";

const allTokens: Record<string, Record<string, string>> = themeTokensData;

/** Metadata that cannot be derived from CSS */
const themeMeta = {
  porcelain: {
    label: "Porcelain",
    subtitle: "Pure white, cold precision, teal accent",
    shadowNote: "1px chrome",
  },
  tobacco: {
    label: "Tobacco",
    subtitle: "Warm pampas cream, terracotta, brown shadows",
    shadowNote: "2px iron",
  },
  marigold: {
    label: "Marigold",
    subtitle: "Pure white, ink-black shadows, loud signals",
    shadowNote: "3px ink",
  },
  eucalyptus: {
    label: "Eucalyptus",
    subtitle: "Titanium blue-gray, navy ink, enterprise",
    shadowNote: "2px chrome",
  },
} as const;

type ThemeKey = keyof typeof themeMeta;

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

/** Pick --color-* and --shadow-* tokens for inline style (skip --astro-code-*) */
function pickStyleTokens(tokens: Record<string, string>): Record<string, string> {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith("--color-") || key.startsWith("--shadow-")) {
      style[key] = value;
    }
  }
  return style;
}

export function ThemeDemo() {
  const [active, setActive] = useState<ThemeKey>("porcelain");
  const meta = themeMeta[active];
  const tokens = allTokens[active];
  const themeStyle = pickStyleTokens(tokens);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(themeMeta) as ThemeKey[]).map((key) => (
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
            {themeMeta[key].label}
          </button>
        ))}
      </div>

      <p className="text-steel mb-1 text-sm font-semibold">{meta.subtitle}</p>
      <p className="text-muted mb-6 text-xs">
        Shadow: {meta.shadowNote} | Paper: {tokens["--color-paper"]}
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
                const hex = tokens[key];
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
                const hex = tokens[key];
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
                          color: isLight ? tokens["--color-ink"] : tokens["--color-paper"],
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
                const hex = tokens[key];
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
