import { useState } from "react";
import themeTokensData from "../data/theme-tokens.json";

const allTokens: Record<string, Record<string, string>> = themeTokensData;

/** Metadata that cannot be derived from CSS */
const themeMeta = {
  solace: {
    label: "Solace",
    subtitle: "Warm paper, cool ink — one vivid blue for action",
    shadowNote: "2px cool grey",
  },
  porcelain: {
    label: "Porcelain",
    subtitle: "Near-white paper, cool graphite ink, balanced signals",
    shadowNote: "1px cool grey",
  },
  tobacco: {
    label: "Tobacco",
    subtitle: "Warm earthen paper, quiet low-chroma signals",
    shadowNote: "2px warm brown",
  },
  marigold: {
    label: "Marigold",
    subtitle: "Pure-grey paper, the loudest signals",
    shadowNote: "3px ink",
  },
  eucalyptus: {
    label: "Eucalyptus",
    subtitle: "Cool-blue paper, vivid high-chroma signals",
    shadowNote: "2px blue-grey",
  },
} as const;

type ThemeKey = keyof typeof themeMeta;

const neutralSwatches = [
  { key: "--tone-0", label: "Tone 0", light: true },
  { key: "--tone-1", label: "Tone 1", light: true },
  { key: "--tone-3", label: "Tone 3", light: true },
  { key: "--tone-4", label: "Tone 4", light: false },
  { key: "--tone-7", label: "Tone 7", light: false },
  { key: "--tone-11", label: "Tone 11", light: false },
] as const;

const signalSwatches = [
  { role: "danger", label: "Danger" },
  { role: "warning", label: "Warning" },
  { role: "success", label: "Success" },
  { role: "info", label: "Info" },
  { role: "accent", label: "Accent" },
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
  const [active, setActive] = useState<ThemeKey>("solace");
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
                ? "border-border-strong bg-bg-emphasis text-fg-on-emphasis border-2 px-4 py-2 text-sm font-semibold"
                : "border-border-strong bg-bg text-fg border-2 px-4 py-2 text-sm font-semibold"
            }
            style={{ cursor: "pointer" }}
          >
            {themeMeta[key].label}
          </button>
        ))}
      </div>

      <p className="text-fg-muted mb-1 text-sm font-semibold">{meta.subtitle}</p>
      <p className="text-fg-subtle mb-6 text-xs">
        Shadow: {meta.shadowNote} | Page: {tokens["--color-bg"]}
      </p>

      <div className="border-border bg-bg border-2 p-6" style={themeStyle}>
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="border-border bg-bg shadow-offset border-2 p-5">
            <h3 className="text-fg mb-2 text-base font-bold">Card Title</h3>
            <p className="text-fg-muted mb-4 text-sm">
              Paper, ink, border, and shadow working together.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className="border-border-strong bg-bg-emphasis text-fg-on-emphasis border-2 px-4 py-2 text-sm font-semibold"
                style={{ cursor: "pointer" }}
              >
                Action
              </button>
              <button
                className="border-border-strong bg-bg text-fg border-2 px-4 py-2 text-sm font-semibold"
                style={{ cursor: "pointer" }}
              >
                Outline
              </button>
            </div>
          </div>
          <div>
            <label className="text-fg mb-1.5 block text-sm font-semibold">Text Input</label>
            <input
              type="text"
              placeholder="Placeholder text..."
              className="border-border bg-bg-hover text-fg mb-4 w-full border-2 px-3 py-2 text-sm outline-none"
            />
            <p className="text-fg-subtle mb-2 text-xs font-semibold tracking-wider uppercase">
              Signal Colors
            </p>
            <div className="flex flex-wrap gap-2">
              {signalSwatches.map(({ role, label }) => {
                const hex = tokens[`--color-${role}-solid`];
                const on = tokens[`--color-${role}-fg-on-solid`];
                return (
                  <span
                    key={role}
                    className="border-2 px-2.5 py-1 text-xs font-bold"
                    style={{ backgroundColor: hex, borderColor: hex, color: on }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-fg-subtle mb-2 text-xs font-semibold tracking-wider uppercase">
            Surface Depth
          </p>
          <div className="border-border bg-bg border-2 p-4">
            <code className="text-fg-subtle text-xs">surface-0</code>
            <div className="border-border bg-bg-raised mt-2 border-2 p-3">
              <code className="text-fg-subtle text-xs">surface-1</code>
              <div className="border-border bg-bg-overlay mt-2 border-2 p-3">
                <code className="text-fg-subtle text-xs">surface-2</code>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-fg-subtle mb-2 text-xs font-semibold tracking-wider uppercase">
              Neutrals
            </p>
            <div className="flex gap-1">
              {neutralSwatches.map(({ key, label, light }) => {
                const hex = tokens[key];
                return (
                  <div key={key} className="flex-1 text-center">
                    <div
                      className="border-border flex h-12 items-end justify-center border p-0.5"
                      style={{ backgroundColor: hex }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: light ? tokens["--color-fg"] : tokens["--color-bg"],
                        }}
                      >
                        {hex}
                      </span>
                    </div>
                    <span className="text-fg-muted mt-0.5 block" style={{ fontSize: 10 }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-fg-subtle mb-2 text-xs font-semibold tracking-wider uppercase">
              Signals
            </p>
            <div className="flex gap-1">
              {signalSwatches.map(({ role, label }) => {
                const hex = tokens[`--color-${role}-solid`];
                const on = tokens[`--color-${role}-fg-on-solid`];
                return (
                  <div key={role} className="flex-1 text-center">
                    <div
                      className="flex h-12 items-end justify-center border p-0.5"
                      style={{ backgroundColor: hex, borderColor: hex }}
                    >
                      <span style={{ fontSize: 9, color: on }}>{hex}</span>
                    </div>
                    <span className="text-fg-muted mt-0.5 block" style={{ fontSize: 10 }}>
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
        <p className="text-fg-muted mb-2 text-xs font-semibold tracking-wider uppercase">
          CLI Usage
        </p>
        <pre className="bg-bg-emphasis text-fg-on-emphasis border-border-strong overflow-auto border-2 p-4 text-sm">
          <code>{`npx @beaket/ui init --theme ${active}`}</code>
        </pre>
      </div>
    </div>
  );
}
