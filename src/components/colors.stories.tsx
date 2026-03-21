import type { Meta, StoryObj } from "@storybook/react-vite";

const colors = {
  brand: [{ name: "Branch", variable: "--color-branch", hex: "#1c1f24", usage: "Brand identity" }],
  surface: [
    { name: "Surface 0", variable: "--color-surface-0", hex: "#eeeeee", usage: "Page background" },
    { name: "Surface 1", variable: "--color-surface-1", hex: "#fafafa", usage: "Cards, panels" },
    { name: "Surface 2", variable: "--color-surface-2", hex: "#ffffff", usage: "Nested/elevated" },
  ],
  neutral: [
    { name: "Graphite", variable: "--color-graphite", hex: "#0d0d0d", usage: "Darkest tone" },
    { name: "Ink", variable: "--color-ink", hex: "#1a1a1a", usage: "Primary text" },
    { name: "Iron", variable: "--color-iron", hex: "#2d2d2d", usage: "Dark accent" },
    { name: "Slate", variable: "--color-slate", hex: "#404040", usage: "Dark secondary" },
    { name: "Zinc", variable: "--color-zinc", hex: "#525252", usage: "Medium dark" },
    { name: "Steel", variable: "--color-steel", hex: "#595959", usage: "Secondary text" },
    { name: "Muted", variable: "--color-muted", hex: "#737373", usage: "Accessible muted text" },
    { name: "Aluminum", variable: "--color-aluminum", hex: "#9e9e9e", usage: "Decorative only" },
    { name: "Chrome", variable: "--color-chrome", hex: "#d4d4d4", usage: "Primary border" },
    { name: "Silver", variable: "--color-silver", hex: "#dedede", usage: "Light border" },
    { name: "Platinum", variable: "--color-platinum", hex: "#ebebeb", usage: "Light accent" },
    { name: "Frost", variable: "--color-frost", hex: "#f5f5f5", usage: "Hover state" },
    { name: "Paper", variable: "--color-paper", hex: "#fafafa", usage: "Primary surface" },
  ],
  signal: [
    { name: "Blue", variable: "--color-signal-blue", hex: "#1a56a0", usage: "Information, links" },
    { name: "Red", variable: "--color-signal-red", hex: "#c41e1e", usage: "Error, destructive" },
    {
      name: "Red (text)",
      variable: "--color-signal-red-text",
      hex: "#b91c1c",
      usage: "Red text (AAA on paper)",
    },
    { name: "Green", variable: "--color-signal-green", hex: "#00794c", usage: "Success, positive" },
    { name: "Amber", variable: "--color-signal-amber", hex: "#b8860b", usage: "Warning, caution" },
    { name: "Purple", variable: "--color-signal-purple", hex: "#6f2da8", usage: "Accent, special" },
    { name: "Cyan", variable: "--color-signal-cyan", hex: "#1a6b7c", usage: "Info alternate" },
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
