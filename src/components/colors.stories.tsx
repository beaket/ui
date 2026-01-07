import type { Meta, StoryObj } from "@storybook/react-vite";

const colors = {
  brand: [{ name: "Branch", variable: "--branch", hex: "#1c1f24", usage: "Brand identity" }],
  neutral: [
    { name: "Graphite", variable: "--graphite", hex: "#0d0d0d", usage: "Darkest tone" },
    { name: "Ink", variable: "--ink", hex: "#1a1a1a", usage: "Primary text" },
    { name: "Iron", variable: "--iron", hex: "#2d2d2d", usage: "Dark accent" },
    { name: "Slate", variable: "--slate", hex: "#404040", usage: "Dark secondary" },
    { name: "Zinc", variable: "--zinc", hex: "#525252", usage: "Medium dark" },
    { name: "Steel", variable: "--steel", hex: "#595959", usage: "Secondary text" },
    { name: "Aluminum", variable: "--aluminum", hex: "#9e9e9e", usage: "Tertiary text" },
    { name: "Silver", variable: "--silver", hex: "#dedede", usage: "Light border" },
    { name: "Chrome", variable: "--chrome", hex: "#e0e0e0", usage: "Primary border" },
    { name: "Platinum", variable: "--platinum", hex: "#f0f0f0", usage: "Light accent" },
    { name: "Frost", variable: "--frost", hex: "#f5f5f5", usage: "Hover state" },
    { name: "Paper", variable: "--paper", hex: "#f8f8f8", usage: "Primary surface" },
  ],
  signal: [
    { name: "Blue", variable: "--signal-blue", hex: "#2b6cb0", usage: "Information, links" },
    { name: "Red", variable: "--signal-red", hex: "#d32f2f", usage: "Error, destructive" },
    { name: "Green", variable: "--signal-green", hex: "#137752", usage: "Success, positive" },
    { name: "Amber", variable: "--signal-amber", hex: "#a86800", usage: "Warning, caution" },
    { name: "Purple", variable: "--signal-purple", hex: "#6f2da8", usage: "Accent, special" },
    { name: "Cyan", variable: "--signal-cyan", hex: "#1a6b7c", usage: "Info alternate" },
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
  const isLight = ["Paper", "Frost", "Platinum", "Silver", "Chrome"].includes(name);

  return (
    <div className="border border-[var(--chrome)]">
      <div
        className="flex h-16 items-end border-b border-[var(--chrome)] p-2"
        style={{ backgroundColor: hex }}
      >
        <span
          className={isLight ? "text-[var(--ink)]" : "text-[var(--paper)]"}
          style={{ fontSize: 11 }}
        >
          {hex}
        </span>
      </div>
      <div className="bg-[var(--paper)] p-2">
        <div className="text-xs font-medium text-[var(--ink)]">{name}</div>
        <code className="block text-xs text-[var(--steel)]">{variable}</code>
        <div className="mt-1 text-xs text-[var(--aluminum)]">{usage}</div>
      </div>
    </div>
  );
}

function Colors() {
  return (
    <div className="min-h-screen bg-[var(--paper)] p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8 border-b border-[var(--chrome)] pb-4">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Color System</h1>
          <p className="mt-1 text-sm text-[var(--steel)]">
            Brutalist palette. Colors serve function, not decoration.
          </p>
        </div>

        {/* Brand */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Brand
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {colors.brand.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Neutral Palette */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Neutral Palette
          </h2>
          <p className="mb-3 text-xs text-[var(--aluminum)]">
            Dark to light. Ordered by luminance.
          </p>
          <div className="grid grid-cols-4 gap-3">
            {colors.neutral.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Signal Colors */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Signal Colors
          </h2>
          <p className="mb-3 text-xs text-[var(--aluminum)]">
            Semantic colors for states and feedback.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {colors.signal.map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Design Rules */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Design Rules
          </h2>
          <div className="border border-[var(--chrome)] bg-[var(--frost)] p-4">
            <ul className="space-y-2 text-xs text-[var(--ink)]">
              <li>
                <strong>No gradients</strong> — Flat colors only
              </li>
              <li>
                <strong>No shadows</strong> — No box-shadow, drop-shadow
              </li>
              <li>
                <strong>No opacity for styling</strong> — Use explicit color tokens
              </li>
              <li>
                <strong>Use variables</strong> — Always{" "}
                <code className="text-[var(--signal-blue)]">var(--token)</code>, never raw hex
              </li>
            </ul>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Usage Examples
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-[var(--chrome)] bg-[var(--paper)] p-4">
              <div className="text-sm text-[var(--ink)]">Primary text on paper</div>
              <code className="text-xs text-[var(--aluminum)]">
                text-[var(--ink)] bg-[var(--paper)]
              </code>
            </div>
            <div className="border border-[var(--chrome)] bg-[var(--branch)] p-4">
              <div className="text-sm text-[var(--paper)]">Inverted: paper on branch</div>
              <code className="text-xs text-[var(--aluminum)]">
                text-[var(--paper)] bg-[var(--branch)]
              </code>
            </div>
            <div className="border border-[var(--chrome)] bg-[var(--paper)] p-4">
              <div className="text-sm text-[var(--signal-blue)]">Link color</div>
              <code className="text-xs text-[var(--aluminum)]">text-[var(--signal-blue)]</code>
            </div>
            <div className="border border-[var(--chrome)] bg-[var(--frost)] p-4">
              <div className="text-sm text-[var(--ink)]">Hover state surface</div>
              <code className="text-xs text-[var(--aluminum)]">bg-[var(--frost)]</code>
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
          "Brutalist color system. Colors serve function, not decoration. No gradients, no shadows, no opacity effects.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Colors>;

export const Default: Story = {};

export const BrandColor = () => (
  <div className="bg-[var(--paper)] p-6">
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">Brand</h2>
    <div className="w-48">
      <ColorSwatch {...colors.brand[0]} />
    </div>
  </div>
);

export const NeutralPalette = () => (
  <div className="bg-[var(--paper)] p-6">
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
      Neutral Palette
    </h2>
    <div className="grid max-w-2xl grid-cols-4 gap-3">
      {colors.neutral.map((color) => (
        <ColorSwatch key={color.variable} {...color} />
      ))}
    </div>
  </div>
);

export const SignalColors = () => (
  <div className="bg-[var(--paper)] p-6">
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
      Signal Colors
    </h2>
    <div className="grid max-w-xl grid-cols-3 gap-3">
      {colors.signal.map((color) => (
        <ColorSwatch key={color.variable} {...color} />
      ))}
    </div>
  </div>
);
