import type { Meta, StoryObj } from "@storybook/react-vite";

const colors = {
  brand: [{ name: "Branch", variable: "--color-branch", hex: "#05070d", usage: "Brand identity" }],
  surface: [
    { name: "Surface 0", variable: "--color-surface-0", hex: "#eff0f2", usage: "Page background" },
    { name: "Surface 1", variable: "--color-surface-1", hex: "#f8f8fa", usage: "Cards, panels" },
    { name: "Surface 2", variable: "--color-surface-2", hex: "#ffffff", usage: "Nested/elevated" },
  ],
  neutral: [
    { name: "Graphite", variable: "--color-graphite", hex: "#030509", usage: "Darkest tone" },
    { name: "Ink", variable: "--color-ink", hex: "#080b12", usage: "Primary text" },
    { name: "Iron", variable: "--color-iron", hex: "#282b30", usage: "Dark accent" },
    { name: "Slate", variable: "--color-slate", hex: "#3e4146", usage: "Dark secondary" },
    { name: "Zinc", variable: "--color-zinc", hex: "#53565c", usage: "Medium dark" },
    { name: "Steel", variable: "--color-steel", hex: "#686b70", usage: "Secondary text" },
    { name: "Muted", variable: "--color-muted", hex: "#7a7d82", usage: "Accessible muted text" },
    { name: "Aluminum", variable: "--color-aluminum", hex: "#a0a3a8", usage: "Decorative only" },
    { name: "Chrome", variable: "--color-chrome", hex: "#c0c5cc", usage: "Primary border" },
    { name: "Silver", variable: "--color-silver", hex: "#d5d8dd", usage: "Light border" },
    { name: "Platinum", variable: "--color-platinum", hex: "#e8eaed", usage: "Light accent" },
    { name: "Frost", variable: "--color-frost", hex: "#f3f4f6", usage: "Hover state" },
    { name: "Paper", variable: "--color-paper", hex: "#ffffff", usage: "Primary surface" },
  ],
  signal: [
    { name: "Blue", variable: "--color-signal-blue", hex: "#1565c0", usage: "Information, links" },
    { name: "Red", variable: "--color-signal-red", hex: "#d32f2f", usage: "Error, destructive" },
    {
      name: "Red (text)",
      variable: "--color-signal-red-text",
      hex: "#c62828",
      usage: "Red text (AAA on paper)",
    },
    {
      name: "Green",
      variable: "--color-signal-green",
      hex: "#0d7c66",
      usage: "Success, teal accent",
    },
    { name: "Amber", variable: "--color-signal-amber", hex: "#d89018", usage: "Warning, caution" },
    {
      name: "Amber (text)",
      variable: "--color-signal-amber-text",
      hex: "#b07200",
      usage: "Amber text/icon (AA on paper)",
    },
    { name: "Purple", variable: "--color-signal-purple", hex: "#6a1b9a", usage: "Accent, special" },
    { name: "Cyan", variable: "--color-signal-cyan", hex: "#00838f", usage: "Info alternate" },
  ],
};

function ColorSwatch({
  name,
  variable,
  hex,
  usage,
}: {
  name: string;
  variable: string;
  hex: string;
  usage: string;
}) {
  const isLight = [
    "Paper",
    "Frost",
    "Platinum",
    "Silver",
    "Chrome",
    "Surface 0",
    "Surface 1",
    "Surface 2",
  ].includes(name);

  return (
    <div className="border-chrome border">
      <div
        className="border-chrome flex h-16 items-end border-b p-2"
        style={{ backgroundColor: hex }}
      >
        <span className={isLight ? "text-ink" : "text-paper"} style={{ fontSize: 11 }}>
          {hex}
        </span>
      </div>
      <div className="bg-paper p-2">
        <div className="text-ink text-xs font-medium">{name}</div>
        <code className="text-steel block text-xs">{variable}</code>
        <div className="text-muted mt-1 text-xs">{usage}</div>
      </div>
    </div>
  );
}

function Colors() {
  return (
    <div className="bg-paper min-h-screen p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="border-chrome mb-8 border-b pb-4">
          <h1 className="text-ink text-2xl font-bold">Color System</h1>
          <p className="text-steel mt-1 text-sm">
            Brutalist palette. Colors serve function, not decoration.
          </p>
        </div>

        {/* Brand */}
        <section className="mb-8">
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">Brand</h2>
          <div className="grid grid-cols-4 gap-3">
            {colors.brand.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Surface Layers */}
        <section className="mb-8">
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">
            Surface Layers
          </h2>
          <p className="text-muted mb-3 text-xs">
            Visual depth: page &rarr; cards &rarr; elevated elements.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {colors.surface.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Neutral Palette */}
        <section className="mb-8">
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">
            Neutral Palette
          </h2>
          <p className="text-muted mb-3 text-xs">Dark to light. Ordered by luminance.</p>
          <div className="grid grid-cols-4 gap-3">
            {colors.neutral.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Signal Colors */}
        <section className="mb-8">
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">
            Signal Colors
          </h2>
          <p className="text-muted mb-3 text-xs">Semantic colors for states and feedback.</p>
          <div className="grid grid-cols-3 gap-3">
            {colors.signal.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Design Rules */}
        <section className="mb-8">
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">
            Design Rules
          </h2>
          <div className="border-chrome bg-frost border p-4">
            <ul className="text-ink space-y-2 text-xs">
              <li>
                <strong>No gradients</strong> — Flat colors only
              </li>
              <li>
                <strong>No blur shadows</strong> — Offset shadows only for interactive elements
              </li>
              <li>
                <strong>No opacity for styling</strong> — Use explicit color tokens
              </li>
              <li>
                <strong>Use Tailwind utilities</strong> — Always{" "}
                <code className="text-signal-blue">bg-paper</code>, never raw hex
              </li>
            </ul>
          </div>
        </section>

        {/* Surface Depth Demo */}
        <section className="mb-8">
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">
            Surface Depth Demo
          </h2>
          <p className="text-muted mb-3 text-xs">
            Nested surfaces create visual hierarchy without decoration.
          </p>
          <div className="bg-surface-0 border-chrome border p-6">
            <code className="text-muted text-xs">bg-surface-0 — page</code>
            <div className="border-chrome bg-surface-1 mt-2 border p-4">
              <code className="text-muted text-xs">bg-surface-1 — card</code>
              <div className="border-chrome bg-surface-2 mt-2 border p-3">
                <code className="text-muted text-xs">bg-surface-2 — dropdown / nested</code>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">
            Usage Examples
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-chrome bg-paper border p-4">
              <div className="text-ink text-sm">Primary text on paper</div>
              <code className="text-muted text-xs">text-ink bg-paper</code>
            </div>
            <div className="border-chrome bg-branch border p-4">
              <div className="text-paper text-sm">Inverted: paper on branch</div>
              <code className="text-muted text-xs">text-paper bg-branch</code>
            </div>
            <div className="border-chrome bg-paper border p-4">
              <div className="text-signal-blue text-sm">Link color</div>
              <code className="text-muted text-xs">text-signal-blue</code>
            </div>
            <div className="border-chrome bg-frost border p-4">
              <div className="text-ink text-sm">Hover state surface</div>
              <code className="text-muted text-xs">bg-frost</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const meta: Meta<typeof Colors> = {
  title: "Token/Colors",
  component: Colors,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Brutalist color system. Colors serve function, not decoration. No gradients, no blur shadows, no opacity effects.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Colors>;

export const Default: Story = {};

export const BrandColor = () => (
  <div className="bg-paper p-6">
    <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">Brand</h2>
    <div className="w-48">
      <ColorSwatch {...colors.brand[0]} />
    </div>
  </div>
);

export const NeutralPalette = () => (
  <div className="bg-paper p-6">
    <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">Neutral Palette</h2>
    <div className="grid max-w-2xl grid-cols-4 gap-3">
      {colors.neutral.map((color) => (
        <ColorSwatch key={color.variable} {...color} />
      ))}
    </div>
  </div>
);

export const SignalColors = () => (
  <div className="bg-paper p-6">
    <h2 className="text-steel mb-3 text-xs font-bold tracking-wider uppercase">Signal Colors</h2>
    <div className="grid max-w-xl grid-cols-3 gap-3">
      {colors.signal.map((color) => (
        <ColorSwatch key={color.variable} {...color} />
      ))}
    </div>
  </div>
);

const themePresets = {
  porcelain: {
    paper: "#ffffff",
    frost: "#f3f4f6",
    chrome: "#c0c5cc",
    muted: "#7a7d82",
    ink: "#080b12",
    graphite: "#030509",
    blue: "#1565c0",
    red: "#d32f2f",
    green: "#0d7c66",
    amber: "#d89018",
    purple: "#6a1b9a",
    cyan: "#00838f",
    shadowLabel: "1px chrome (ghostly)",
  },
  tobacco: {
    paper: "#f4f3ee",
    frost: "#edece6",
    chrome: "#d0cec5",
    muted: "#6b6a60",
    ink: "#1a1a18",
    graphite: "#111110",
    blue: "#3a5f9e",
    red: "#c15f3c",
    green: "#4a8a5e",
    amber: "#b8860b",
    purple: "#845aa0",
    cyan: "#2a7e82",
    shadowLabel: "2px iron (brown)",
  },
  marigold: {
    paper: "#ffffff",
    frost: "#f0f0f0",
    chrome: "#c0c0c0",
    muted: "#6e6e6e",
    ink: "#121212",
    graphite: "#0a0a0a",
    blue: "#0055ff",
    red: "#f24e1e",
    green: "#0acf83",
    amber: "#ff9500",
    purple: "#a259ff",
    cyan: "#00bcd4",
    shadowLabel: "3px ink (black)",
  },
  eucalyptus: {
    paper: "#f8f9fc",
    frost: "#eff2f8",
    chrome: "#c0cddb",
    muted: "#5a6d88",
    ink: "#162036",
    graphite: "#0a1025",
    blue: "#2563eb",
    red: "#dc2626",
    green: "#059669",
    amber: "#d97706",
    purple: "#7c3aed",
    cyan: "#0891b2",
    shadowLabel: "2px chrome (blue-gray)",
  },
};

const presetTokens = ["paper", "frost", "chrome", "muted", "ink", "graphite"] as const;
const presetSignals = ["blue", "red", "green", "amber", "purple", "cyan"] as const;

export const ThemePresets = () => (
  <div className="bg-paper p-6">
    <h2 className="text-steel mb-4 text-xs font-bold tracking-wider uppercase">Themes</h2>
    <p className="text-muted mb-4 text-xs">
      Four themes — neutrals, signals, and shadow geometry all change.
    </p>
    <div className="max-w-4xl space-y-5">
      {(Object.entries(themePresets) as [string, Record<string, string>][]).map(
        ([name, tokens]) => (
          <div key={name}>
            <div className="text-ink mb-1 text-xs font-semibold capitalize">
              {name} <span className="text-muted font-normal">— shadow: {tokens.shadowLabel}</span>
            </div>
            <div className="flex gap-1">
              {presetTokens.map((token) => {
                const hex = tokens[token];
                const isLight = ["paper", "frost", "chrome"].includes(token);
                return (
                  <div key={token} className="flex-1 text-center">
                    <div
                      className="border-chrome flex h-12 items-end justify-center border p-0.5"
                      style={{ backgroundColor: hex }}
                    >
                      <span style={{ fontSize: 9, color: isLight ? "#1a1a1a" : "#fafafa" }}>
                        {hex}
                      </span>
                    </div>
                    <div className="text-steel mt-0.5" style={{ fontSize: 10 }}>
                      {token}
                    </div>
                  </div>
                );
              })}
              <div style={{ width: 4 }} />
              {presetSignals.map((signal) => {
                const hex = tokens[signal];
                return (
                  <div key={signal} className="text-center" style={{ width: 48 }}>
                    <div
                      className="flex h-12 items-end justify-center border p-0.5"
                      style={{ backgroundColor: hex, borderColor: hex }}
                    >
                      <span style={{ fontSize: 9, color: "#ffffff" }}>{hex}</span>
                    </div>
                    <div className="text-steel mt-0.5" style={{ fontSize: 10 }}>
                      {signal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      )}
    </div>
  </div>
);
