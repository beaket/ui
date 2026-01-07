import type { Meta, StoryObj } from "@storybook/react-vite";

const typeScale = [
  { element: "h1", size: "32px", lineHeight: "40px", weight: "700", usage: "Page titles" },
  { element: "h2", size: "24px", lineHeight: "32px", weight: "600", usage: "Section headers" },
  { element: "h3", size: "20px", lineHeight: "28px", weight: "600", usage: "Subsections" },
  { element: "h4", size: "16px", lineHeight: "24px", weight: "600", usage: "Card titles" },
  { element: "h5", size: "14px", lineHeight: "20px", weight: "600", usage: "Small headers" },
  { element: "p", size: "14px", lineHeight: "24px", weight: "400", usage: "Body text" },
  { element: "small", size: "12px", lineHeight: "16px", weight: "400", usage: "Captions, hints" },
  { element: "code", size: "13px", lineHeight: "20px", weight: "400", usage: "Inline code" },
];

function Typography() {
  return (
    <div className="min-h-screen bg-[var(--paper)] p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8 border-b border-[var(--chrome)] pb-4">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Typography</h1>
          <p className="mt-1 text-sm text-[var(--steel)]">
            System fonts. 4px baseline grid. Functional hierarchy.
          </p>
        </div>

        {/* Font Stack */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Font Stack
          </h2>
          <div className="border border-[var(--chrome)] bg-[var(--frost)] p-4">
            <code className="block text-xs text-[var(--ink)]">
              -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
            </code>
            <code className="mt-2 block text-xs text-[var(--ink)]">
              <span className="text-[var(--steel)]">Mono:</span> ui-monospace, SFMono-Regular, "SF
              Mono", Menlo, monospace
            </code>
          </div>
        </section>

        {/* Type Scale */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Type Scale
          </h2>
          <div className="divide-y divide-[var(--chrome)] border border-[var(--chrome)]">
            {typeScale.map((type) => (
              <div key={type.element} className="bg-[var(--paper)] p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <code className="text-xs text-[var(--signal-blue)]">&lt;{type.element}&gt;</code>
                  <span className="text-xs text-[var(--aluminum)]">
                    {type.size} / {type.lineHeight}
                  </span>
                </div>
                <div
                  className="text-[var(--ink)]"
                  style={{
                    fontSize: type.size,
                    lineHeight: type.lineHeight,
                    fontWeight: type.weight,
                    fontFamily:
                      type.element === "code"
                        ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'
                        : "inherit",
                  }}
                >
                  {type.element === "code"
                    ? "const brutalist = true;"
                    : "The quick brown fox jumps over the lazy dog"}
                </div>
                <div className="mt-2 text-xs text-[var(--aluminum)]">{type.usage}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Baseline Grid */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Baseline Grid
          </h2>
          <p className="mb-3 text-xs text-[var(--aluminum)]">
            All spacing uses 4px increments. Line heights align to the grid.
          </p>
          <div
            className="relative border border-[var(--chrome)] p-4"
            style={{
              backgroundImage: "linear-gradient(to bottom, var(--chrome) 1px, transparent 1px)",
              backgroundSize: "100% 4px",
            }}
          >
            <div className="relative bg-[var(--paper)]">
              <h3
                className="text-[var(--ink)]"
                style={{
                  fontSize: "20px",
                  lineHeight: "28px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Heading aligns to grid
              </h3>
              <p
                className="text-[var(--ink)]"
                style={{ fontSize: "14px", lineHeight: "24px", marginBottom: "16px" }}
              >
                Body text with 24px line-height. Each line sits on the 4px baseline grid. Margins
                are multiples of 4px to maintain vertical rhythm throughout the interface.
              </p>
              <p className="text-[var(--steel)]" style={{ fontSize: "12px", lineHeight: "16px" }}>
                Small text caption at 12px/16px
              </p>
            </div>
          </div>
        </section>

        {/* Spacing Reference */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Spacing Scale
          </h2>
          <div className="divide-y divide-[var(--chrome)] border border-[var(--chrome)]">
            {[4, 8, 12, 16, 20, 24, 32, 40, 48].map((px) => (
              <div key={px} className="flex items-center bg-[var(--paper)] p-3">
                <code className="w-16 text-xs text-[var(--ink)]">{px}px</code>
                <div className="h-3 bg-[var(--signal-blue)]" style={{ width: px * 2 }} />
                <span className="ml-3 text-xs text-[var(--aluminum)]">{px / 4} baseline units</span>
              </div>
            ))}
          </div>
        </section>

        {/* Design Rules */}
        <section>
          <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
            Typography Rules
          </h2>
          <div className="border border-[var(--chrome)] bg-[var(--frost)] p-4">
            <ul className="space-y-2 text-xs text-[var(--ink)]">
              <li>
                <strong>System fonts only</strong> — No custom web fonts
              </li>
              <li>
                <strong>4px baseline grid</strong> — All line-heights and margins align
              </li>
              <li>
                <strong>Limited weights</strong> — 400 (regular), 600 (semibold), 700 (bold)
              </li>
              <li>
                <strong>Ink for text</strong> — Primary text uses{" "}
                <code className="text-[var(--signal-blue)]">var(--ink)</code>
              </li>
              <li>
                <strong>Steel for secondary</strong> — Muted text uses{" "}
                <code className="text-[var(--signal-blue)]">var(--steel)</code>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

const meta: Meta<typeof Typography> = {
  title: "Token/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Typography system based on 4px baseline grid. System fonts for performance. Functional hierarchy.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {};

export const TypeScale = () => (
  <div className="bg-[var(--paper)] p-6">
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
      Type Scale
    </h2>
    <div className="max-w-xl divide-y divide-[var(--chrome)] border border-[var(--chrome)]">
      {typeScale.map((type) => (
        <div key={type.element} className="bg-[var(--paper)] p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <code className="text-xs text-[var(--signal-blue)]">&lt;{type.element}&gt;</code>
            <span className="text-xs text-[var(--aluminum)]">
              {type.size} / {type.lineHeight}
            </span>
          </div>
          <div
            className="text-[var(--ink)]"
            style={{
              fontSize: type.size,
              lineHeight: type.lineHeight,
              fontWeight: type.weight,
              fontFamily:
                type.element === "code"
                  ? 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'
                  : "inherit",
            }}
          >
            {type.element === "code"
              ? "const brutalist = true;"
              : "The quick brown fox jumps over the lazy dog"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const BaselineGrid = () => (
  <div className="bg-[var(--paper)] p-6">
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
      Baseline Grid (4px)
    </h2>
    <div
      className="max-w-xl border border-[var(--chrome)] p-4"
      style={{
        backgroundImage: "linear-gradient(to bottom, var(--chrome) 1px, transparent 1px)",
        backgroundSize: "100% 4px",
      }}
    >
      <h3
        className="bg-[var(--paper)] text-[var(--ink)]"
        style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, marginBottom: "8px" }}
      >
        Heading text
      </h3>
      <p
        className="bg-[var(--paper)] text-[var(--ink)]"
        style={{ fontSize: "14px", lineHeight: "24px", marginBottom: "16px" }}
      >
        Body text aligns to the 4px grid. Line heights and margins are always multiples of 4.
      </p>
      <p
        className="bg-[var(--paper)] text-[var(--steel)]"
        style={{ fontSize: "12px", lineHeight: "16px" }}
      >
        Caption text at 12px/16px
      </p>
    </div>
  </div>
);

export const SpacingScale = () => (
  <div className="bg-[var(--paper)] p-6">
    <h2 className="mb-3 text-xs font-bold tracking-wider text-[var(--steel)] uppercase">
      Spacing Scale
    </h2>
    <div className="max-w-md divide-y divide-[var(--chrome)] border border-[var(--chrome)]">
      {[4, 8, 12, 16, 24, 32, 48].map((px) => (
        <div key={px} className="flex items-center bg-[var(--paper)] p-3">
          <code className="w-12 text-xs text-[var(--ink)]">{px}px</code>
          <div className="h-3 bg-[var(--signal-blue)]" style={{ width: px * 2 }} />
        </div>
      ))}
    </div>
  </div>
);
