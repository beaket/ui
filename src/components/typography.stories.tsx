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
    <div className="bg-bg min-h-screen p-6">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="border-border mb-8 border-b pb-4">
          <h1 className="text-fg text-2xl font-bold">Typography</h1>
          <p className="text-fg-muted mt-1 text-sm">
            System fonts. 4px baseline grid. Functional hierarchy.
          </p>
        </div>

        {/* Font Stack */}
        <section className="mb-8">
          <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">
            Font Stack
          </h2>
          <div className="border-border bg-bg-hover border p-4">
            <code className="text-fg block text-xs">
              -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
            </code>
            <code className="text-fg mt-2 block text-xs">
              <span className="text-fg-muted">Mono:</span> ui-monospace, SFMono-Regular, "SF Mono",
              Menlo, monospace
            </code>
          </div>
        </section>

        {/* Type Scale */}
        <section className="mb-8">
          <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">
            Type Scale
          </h2>
          <div className="divide-border-muted border-border divide-y border">
            {typeScale.map((type) => (
              <div key={type.element} className="bg-bg p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <code className="text-fg-link text-xs">&lt;{type.element}&gt;</code>
                  <span className="text-fg-subtle text-xs">
                    {type.size} / {type.lineHeight}
                  </span>
                </div>
                <div
                  className="text-fg"
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
                    ? "const ink = tone(11);"
                    : "The quick brown fox jumps over the lazy dog"}
                </div>
                <div className="text-fg-subtle mt-2 text-xs">{type.usage}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Baseline Grid */}
        <section className="mb-8">
          <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">
            Baseline Grid
          </h2>
          <p className="text-fg-subtle mb-3 text-xs">
            All spacing uses 4px increments. Line heights align to the grid.
          </p>
          <div
            className="border-border relative border p-4"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, var(--color-border-muted) 1px, transparent 1px)",
              backgroundSize: "100% 4px",
            }}
          >
            <div className="bg-bg relative">
              <h3
                className="text-fg"
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
                className="text-fg"
                style={{ fontSize: "14px", lineHeight: "24px", marginBottom: "16px" }}
              >
                Body text with 24px line-height. Each line sits on the 4px baseline grid. Margins
                are multiples of 4px to maintain vertical rhythm throughout the interface.
              </p>
              <p className="text-fg-muted" style={{ fontSize: "12px", lineHeight: "16px" }}>
                Small text caption at 12px/16px
              </p>
            </div>
          </div>
        </section>

        {/* Spacing Reference */}
        <section className="mb-8">
          <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">
            Spacing Scale
          </h2>
          <div className="divide-border-muted border-border divide-y border">
            {[4, 8, 12, 16, 20, 24, 32, 40, 48].map((px) => (
              <div key={px} className="bg-bg flex items-center p-3">
                <code className="text-fg w-16 text-xs">{px}px</code>
                <div className="bg-info-solid h-3" style={{ width: px * 2 }} />
                <span className="text-fg-subtle ml-3 text-xs">{px / 4} baseline units</span>
              </div>
            ))}
          </div>
        </section>

        {/* Design Rules */}
        <section>
          <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">
            Typography Rules
          </h2>
          <div className="border-border bg-bg-hover border p-4">
            <ul className="text-fg space-y-2 text-xs">
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
                <code className="text-fg-link">text-fg</code>
              </li>
              <li>
                <strong>Steel for secondary</strong> — Muted text uses{" "}
                <code className="text-fg-link">text-fg-muted</code>
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
  <div className="bg-bg p-6">
    <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">Type Scale</h2>
    <div className="divide-border-muted border-border max-w-xl divide-y border">
      {typeScale.map((type) => (
        <div key={type.element} className="bg-bg p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <code className="text-fg-link text-xs">&lt;{type.element}&gt;</code>
            <span className="text-fg-subtle text-xs">
              {type.size} / {type.lineHeight}
            </span>
          </div>
          <div
            className="text-fg"
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
              ? "const ink = tone(11);"
              : "The quick brown fox jumps over the lazy dog"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const BaselineGrid = () => (
  <div className="bg-bg p-6">
    <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">
      Baseline Grid (4px)
    </h2>
    <div
      className="border-border max-w-xl border p-4"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, var(--color-border-muted) 1px, transparent 1px)",
        backgroundSize: "100% 4px",
      }}
    >
      <h3
        className="bg-bg text-fg"
        style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, marginBottom: "8px" }}
      >
        Heading text
      </h3>
      <p
        className="bg-bg text-fg"
        style={{ fontSize: "14px", lineHeight: "24px", marginBottom: "16px" }}
      >
        Body text aligns to the 4px grid. Line heights and margins are always multiples of 4.
      </p>
      <p className="bg-bg text-fg-muted" style={{ fontSize: "12px", lineHeight: "16px" }}>
        Caption text at 12px/16px
      </p>
    </div>
  </div>
);

export const SpacingScale = () => (
  <div className="bg-bg p-6">
    <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">Spacing Scale</h2>
    <div className="divide-border-muted border-border max-w-md divide-y border">
      {[4, 8, 12, 16, 24, 32, 48].map((px) => (
        <div key={px} className="bg-bg flex items-center p-3">
          <code className="text-fg w-12 text-xs">{px}px</code>
          <div className="bg-info-solid h-3" style={{ width: px * 2 }} />
        </div>
      ))}
    </div>
  </div>
);
