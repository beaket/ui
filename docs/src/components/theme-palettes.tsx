import themeTokensData from "../data/theme-tokens.json";

const themeTokens: Record<string, Record<string, string>> = themeTokensData;

const THEMES: { name: string; label: string; note: string }[] = [
  {
    name: "solace",
    label: "Solace",
    note: "Warm paper, cool ink. The default: equal-weight signals under one vivid blue.",
  },
  {
    name: "porcelain",
    label: "Porcelain",
    note: "Near-white paper and cool graphite, with the deepest accent in the set.",
  },
  {
    name: "tobacco",
    label: "Tobacco",
    note: "Warm earthen paper and quiet low-chroma signals. Its sheets step lighter than the page.",
  },
  {
    name: "marigold",
    label: "Marigold",
    note: "Pure-grey paper and ink carrying deliberately loud signals.",
  },
  {
    name: "eucalyptus",
    label: "Eucalyptus",
    note: "Cool-blue paper and blue-black ink, vivid throughout. Its sheets also step lighter.",
  },
];

/** The roles a consumer actually sees when they pick a theme. */
const ROLES: { token: string; label: string }[] = [
  { token: "--color-bg", label: "Page" },
  { token: "--color-bg-raised", label: "Raised" },
  { token: "--color-bg-overlay", label: "Overlay" },
  { token: "--color-fg", label: "Ink" },
  { token: "--color-border", label: "Rule" },
  { token: "--color-accent-solid", label: "Accent" },
  { token: "--color-danger-solid", label: "Danger" },
  { token: "--color-success-solid", label: "Success" },
  { token: "--color-warning-solid", label: "Warning" },
  { token: "--color-info-solid", label: "Info" },
];

function Strip({ theme, scheme }: { theme: string; scheme: "light" | "dark" }) {
  const key = scheme === "dark" ? `${theme}-dark` : theme;
  const palette = themeTokens[key];
  if (!palette) return null;

  return (
    // Each palette sits on its own page colour: a dark twin judged against a
    // light docs page is not the world the theme actually ships.
    <div
      className="palette-strip"
      style={{
        backgroundColor: palette["--color-bg"],
        color: palette["--color-fg"],
        ["--strip-muted" as string]: palette["--color-fg-muted"],
      }}
    >
      <span className="palette-scheme">{scheme === "dark" ? "Dark" : "Light"}</span>
      <div className="palette-chips">
        {ROLES.map(({ token, label }) => (
          <div className="chip" key={token}>
            <span
              className="chip-swatch"
              style={{
                backgroundColor: palette[token],
                borderColor: palette["--color-border-muted"],
              }}
            />
            <span className="chip-label">{label}</span>
            <span className="chip-value">{palette[token]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Every shipped palette, light and dark, side by side. This page exists to
 * choose between themes, so it has to show more than one — and show colour as
 * colour rather than describing it in adjectives.
 */
export function ThemePalettes() {
  return (
    <>
      {THEMES.map((theme) => (
        <section className="palette" key={theme.name}>
          <div className="palette-head">
            <h3 id={theme.name}>{theme.label}</h3>
            <span className="install-line">
              <code>
                <span className="prompt">$&nbsp;</span>
                <span className="install-text">{`npx @beaket/ui init --theme ${theme.name}`}</span>
              </code>
              <button
                className="install-copy"
                aria-label={`Copy install command for ${theme.label}`}
              >
                Copy
              </button>
            </span>
          </div>
          <p className="palette-note">{theme.note}</p>
          <Strip theme={theme.name} scheme="light" />
          <Strip theme={theme.name} scheme="dark" />
        </section>
      ))}
    </>
  );
}
