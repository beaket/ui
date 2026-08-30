import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Two layers:
 * - A theme authors 30 palette values (surface / tone / signal / knockout / shadow).
 *   Components consume 27; tone 8–10 preserve the 12-step ramp for future roles.
 * - The semantic names below are authored once and shared by every theme —
 *   components only ever use these.
 * Swatches render from the live CSS variables, so this page always shows the
 * active theme.
 */

interface TokenEntry {
  token: string;
  usage: string;
}

const semantic: Record<string, TokenEntry[]> = {
  background: [
    { token: "--color-bg", usage: "Page background" },
    { token: "--color-bg-raised", usage: "Cards, panels" },
    { token: "--color-bg-overlay", usage: "Dialogs, menus, popovers" },
    { token: "--color-bg-input", usage: "Form controls" },
    { token: "--color-bg-hover", usage: "Hover surface" },
    { token: "--color-bg-active", usage: "Active / selected surface" },
    { token: "--color-bg-disabled", usage: "Disabled surface" },
    { token: "--color-bg-emphasis", usage: "Emphasis: primary, checked, tooltips, active nav" },
    { token: "--color-bg-emphasis-hover", usage: "Emphasis surface, hovered (accent-warmed)" },
    { token: "--color-bg-emphasis-active", usage: "Emphasis surface, pressed (accent-warmed)" },
  ],
  foreground: [
    { token: "--color-fg", usage: "Primary text" },
    { token: "--color-fg-muted", usage: "Secondary text, descriptions" },
    { token: "--color-fg-subtle", usage: "Placeholders, decorative text" },
    { token: "--color-fg-disabled", usage: "Disabled text" },
    { token: "--color-fg-on-emphasis", usage: "Text on bg-emphasis" },
    { token: "--color-fg-link", usage: "Links" },
  ],
  border: [
    { token: "--color-border", usage: "Default borders" },
    { token: "--color-border-muted", usage: "Dividers, disabled borders" },
    { token: "--color-border-strong", usage: "Inputs, overlays, emphasis" },
    { token: "--color-border-focus", usage: "Focus outline" },
  ],
};

const roles = ["danger", "success", "warning", "info", "info-alt", "accent"] as const;
const roleSlots = [
  "solid",
  "fg-on-solid",
  "solid-hover",
  "solid-active",
  "fg",
  "bg",
  "border",
] as const;

const paletteTones = Array.from({ length: 12 }, (_, i) => `--tone-${i}`);
const paletteSurfaces = ["--surface-0", "--surface-1", "--surface-2"];
const paletteSignals = [
  "--signal-danger",
  "--signal-warning",
  "--signal-success",
  "--signal-info",
  "--signal-info-alt",
  "--signal-accent",
];

function Swatch({ token, usage }: TokenEntry) {
  return (
    <div className="border-border border">
      <div
        className="border-border h-12 border-b"
        style={{ backgroundColor: `var(${token})` }}
        data-testid={token}
      />
      <div className="bg-bg-raised p-2">
        <code className="text-fg block text-xs">{token}</code>
        {usage && <div className="text-fg-subtle mt-1 text-xs">{usage}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-fg-muted mb-3 text-xs font-bold tracking-wider uppercase">{children}</h2>
  );
}

function Colors() {
  return (
    <div className="bg-bg min-h-screen p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="border-border mb-8 border-b pb-4">
          <h1 className="text-fg text-2xl font-bold">Color Tokens</h1>
          <p className="text-fg-muted mt-1 text-sm">
            Two layers. A theme authors 30 palette values and nothing else; 27 feed the semantic
            names components actually use. Tone 8–10 are reserved for ramp compatibility.
          </p>
        </div>

        {/* Semantic — Background / Foreground / Border */}
        <section className="mb-8">
          <SectionTitle>Semantic — Background</SectionTitle>
          <div className="grid grid-cols-4 gap-3">
            {semantic.background.map((entry) => (
              <Swatch key={entry.token} {...entry} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle>Semantic — Foreground</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            {semantic.foreground.map((entry) => (
              <Swatch key={entry.token} {...entry} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle>Semantic — Border</SectionTitle>
          <div className="grid grid-cols-4 gap-3">
            {semantic.border.map((entry) => (
              <Swatch key={entry.token} {...entry} />
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="mb-8">
          <SectionTitle>Roles</SectionTitle>
          <p className="text-fg-subtle mb-3 text-xs">
            Six roles, seven slots each. <code>solid</code> carries type in <code>fg-on-solid</code>{" "}
            — the knockout is chosen per theme.
          </p>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role}>
                <div className="text-fg mb-1 text-xs font-semibold">{role}</div>
                <div className="flex gap-1">
                  {roleSlots.map((slot) => (
                    <div key={slot} className="flex-1 text-center">
                      <div
                        className="border-border h-10 border"
                        style={{ backgroundColor: `var(--color-${role}-${slot})` }}
                      />
                      <div className="text-fg-subtle mt-0.5" style={{ fontSize: 10 }}>
                        {slot}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Palette (theme-authored) */}
        <section className="mb-8">
          <SectionTitle>Palette — authored by the theme</SectionTitle>
          <p className="text-fg-subtle mb-3 text-xs">
            The 30 values a theme supplies. Components never use these directly; tone 8–10 are
            reserved for 12-step ramp compatibility and future deep-ink roles.
          </p>
          <div className="text-fg mb-1 text-xs font-semibold">Tone ramp</div>
          <div className="mb-3 flex gap-1">
            {paletteTones.map((token) => (
              <div key={token} className="flex-1 text-center">
                <div
                  className="border-border h-10 border"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <div className="text-fg-subtle mt-0.5" style={{ fontSize: 10 }}>
                  {token.replace("--tone-", "")}
                </div>
              </div>
            ))}
          </div>
          <div className="text-fg mb-1 text-xs font-semibold">Surfaces</div>
          <div className="mb-3 flex max-w-md gap-1">
            {paletteSurfaces.map((token) => (
              <div key={token} className="flex-1 text-center">
                <div
                  className="border-border h-10 border"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <div className="text-fg-subtle mt-0.5" style={{ fontSize: 10 }}>
                  {token.replace("--surface-", "")}
                </div>
              </div>
            ))}
          </div>
          <div className="text-fg mb-1 text-xs font-semibold">
            Signals — only the accent is vivid
          </div>
          <div className="flex max-w-md gap-1">
            {paletteSignals.map((token) => (
              <div key={token} className="flex-1 text-center">
                <div
                  className="border-border h-10 border"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <div className="text-fg-subtle mt-0.5" style={{ fontSize: 10 }}>
                  {token.replace("--signal-", "")}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Design Rules */}
        <section className="mb-8">
          <SectionTitle>Design Rules</SectionTitle>
          <div className="border-border bg-bg-hover border p-4">
            <ul className="text-fg space-y-2 text-xs">
              <li>
                <strong>Semantic names only</strong> — Always{" "}
                <code className="text-fg-link">bg-bg</code>,{" "}
                <code className="text-fg-link">text-fg</code> — never raw hex, never a palette value
              </li>
            </ul>
          </div>
        </section>

        {/* Surface Depth Demo */}
        <section className="mb-8">
          <SectionTitle>Surface Depth Demo</SectionTitle>
          <p className="text-fg-subtle mb-3 text-xs">
            Nested surfaces create visual hierarchy without decoration.
          </p>
          <div className="bg-bg border-border border p-6">
            <code className="text-fg-subtle text-xs">bg-bg — page</code>
            <div className="border-border bg-bg-raised mt-2 border p-4">
              <code className="text-fg-subtle text-xs">bg-bg-raised — card</code>
              <div className="border-border bg-bg-overlay mt-2 border p-3">
                <code className="text-fg-subtle text-xs">bg-bg-overlay — dropdown / dialog</code>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <SectionTitle>Usage Examples</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border bg-bg border p-4">
              <div className="text-fg text-sm">Primary text on the page</div>
              <code className="text-fg-subtle text-xs">text-fg bg-bg</code>
            </div>
            <div className="border-border-strong bg-bg-emphasis border p-4">
              <div className="text-fg-on-emphasis text-sm">Emphasis surface</div>
              <code className="text-fg-on-emphasis text-xs">
                text-fg-on-emphasis bg-bg-emphasis
              </code>
            </div>
            <div className="border-border bg-bg border p-4">
              <div className="text-fg-link text-sm">Link color</div>
              <code className="text-fg-subtle text-xs">text-fg-link</code>
            </div>
            <div className="border-danger-border bg-danger-bg border p-4">
              <div className="text-danger-fg text-sm">Danger tint</div>
              <code className="text-danger-fg text-xs">text-danger-fg bg-danger-bg</code>
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
          "Two-layer color system: a theme authors 30 palette values; 27 feed the shared semantic names, while tone 8–10 are reserved. Components only use the semantic layer.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Colors>;

export const Default: Story = {};

export const SemanticBackgrounds = () => (
  <div className="bg-bg p-6">
    <SectionTitle>Semantic — Background</SectionTitle>
    <div className="grid max-w-2xl grid-cols-4 gap-3">
      {semantic.background.map((entry) => (
        <Swatch key={entry.token} {...entry} />
      ))}
    </div>
  </div>
);

export const SemanticForegrounds = () => (
  <div className="bg-bg p-6">
    <SectionTitle>Semantic — Foreground</SectionTitle>
    <div className="grid max-w-2xl grid-cols-3 gap-3">
      {semantic.foreground.map((entry) => (
        <Swatch key={entry.token} {...entry} />
      ))}
    </div>
  </div>
);

export const RoleTokens = () => (
  <div className="bg-bg p-6">
    <SectionTitle>Roles</SectionTitle>
    <div className="max-w-2xl space-y-3">
      {roles.map((role) => (
        <div key={role}>
          <div className="text-fg mb-1 text-xs font-semibold">{role}</div>
          <div className="flex gap-1">
            {roleSlots.map((slot) => (
              <div key={slot} className="flex-1 text-center">
                <div
                  className="border-border h-10 border"
                  style={{ backgroundColor: `var(--color-${role}-${slot})` }}
                />
                <div className="text-fg-subtle mt-0.5" style={{ fontSize: 10 }}>
                  {slot}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
