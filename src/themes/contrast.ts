export type ContrastKind = "text" | "boundary" | "disabled";

export interface ContrastPolicyEntry {
  id: string;
  foreground: string;
  background: string;
  minimum: number;
  kind: ContrastKind;
  usage: string;
  enforcement?: "required" | "report";
}

export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

export interface ContrastResult extends ContrastPolicyEntry {
  ratio: number;
}

const supportedSurfaces = [
  ["page", "--color-bg"],
  ["raised", "--color-bg-raised"],
  ["overlay", "--color-bg-overlay"],
  ["input", "--color-bg-input"],
] as const;

const textRoles = [
  ["primary", "--color-fg"],
  ["muted", "--color-fg-muted"],
  ["subtle", "--color-fg-subtle"],
] as const;

const roles = ["danger", "success", "warning", "info", "info-alt", "accent"] as const;

const textPolicy: ContrastPolicyEntry[] = textRoles.flatMap(([label, foreground]) =>
  supportedSurfaces.map(([surface, background]) => ({
    id: `${label}-text-on-${surface}`,
    foreground,
    background,
    minimum: 4.5,
    kind: "text" as const,
    usage: `${label} text on the ${surface} surface`,
  })),
);

const rolePolicy: ContrastPolicyEntry[] = roles.flatMap((role) => [
  {
    id: `${role}-text-on-solid`,
    foreground: `--color-${role}-fg-on-solid`,
    background: `--color-${role}-solid`,
    minimum: 4.5,
    kind: "text",
    usage: `${role} text on its solid fill`,
  },
  {
    id: `${role}-text-on-solid-hover`,
    foreground: `--color-${role}-fg-on-solid`,
    background: `--color-${role}-solid-hover`,
    minimum: 4.5,
    kind: "text",
    usage: `${role} text on its hovered solid fill`,
  },
  {
    id: `${role}-text-on-solid-active`,
    foreground: `--color-${role}-fg-on-solid`,
    background: `--color-${role}-solid-active`,
    minimum: 4.5,
    kind: "text",
    usage: `${role} text on its active solid fill`,
  },
  {
    id: `${role}-text-on-tint`,
    foreground: `--color-${role}-fg`,
    background: `--color-${role}-bg`,
    minimum: 4.5,
    kind: "text",
    usage: `${role} foreground on its tinted background`,
  },
]);

const boundaryPolicy: ContrastPolicyEntry[] = supportedSurfaces.flatMap(([surface, background]) => [
  {
    id: `default-boundary-on-${surface}`,
    foreground: "--color-border",
    background,
    minimum: 3,
    kind: "boundary",
    usage: `default interactive boundary on the ${surface} surface`,
  },
  {
    id: `strong-boundary-on-${surface}`,
    foreground: "--color-border-strong",
    background,
    minimum: 3,
    kind: "boundary",
    usage: `strong interactive boundary on the ${surface} surface`,
  },
  {
    id: `focus-boundary-on-${surface}`,
    foreground: "--color-border-focus",
    background,
    minimum: 3,
    kind: "boundary",
    usage: `keyboard focus indicator on the ${surface} surface`,
  },
  {
    id: `invalid-boundary-on-${surface}`,
    foreground: "--color-danger-solid",
    background,
    minimum: 3,
    kind: "boundary",
    usage: `invalid interactive boundary on the ${surface} surface`,
  },
]);

/**
 * Supported semantic color combinations.
 *
 * WCAG 2.x requires 4.5:1 for normal text and 3:1 for meaningful non-text
 * indicators. Disabled-only combinations are measured at the same reference
 * floors for theme-author feedback, but they are reports rather than failures
 * because inactive controls are exempt from those WCAG requirements.
 */
export const CONTRAST_POLICY: readonly ContrastPolicyEntry[] = [
  ...textPolicy,
  {
    id: "primary-text-on-hover",
    foreground: "--color-fg",
    background: "--color-bg-hover",
    minimum: 4.5,
    kind: "text",
    usage: "normal text retained on a hovered neutral control",
  },
  {
    id: "primary-text-on-active",
    foreground: "--color-fg",
    background: "--color-bg-active",
    minimum: 4.5,
    kind: "text",
    usage: "normal text retained on an active neutral control",
  },
  {
    id: "link-on-page",
    foreground: "--color-fg-link",
    background: "--color-bg",
    minimum: 4.5,
    kind: "text",
    usage: "link text on the page background",
  },
  {
    id: "text-on-emphasis",
    foreground: "--color-fg-on-emphasis",
    background: "--color-bg-emphasis",
    minimum: 4.5,
    kind: "text",
    usage: "normal text on the emphasis background",
  },
  {
    id: "text-on-emphasis-hover",
    foreground: "--color-fg-on-emphasis",
    background: "--color-bg-emphasis-hover",
    minimum: 4.5,
    kind: "text",
    usage: "normal text on the hovered emphasis background",
  },
  {
    id: "text-on-emphasis-active",
    foreground: "--color-fg-on-emphasis",
    background: "--color-bg-emphasis-active",
    minimum: 4.5,
    kind: "text",
    usage: "normal text on the active emphasis background",
  },
  ...rolePolicy,
  ...boundaryPolicy,
  {
    id: "disabled-text-on-disabled-surface",
    foreground: "--color-fg-disabled",
    background: "--color-bg-disabled",
    minimum: 4.5,
    kind: "disabled",
    usage: "disabled text on a disabled control",
    enforcement: "report",
  },
  {
    id: "disabled-boundary-on-input",
    foreground: "--color-border-muted",
    background: "--color-bg-input",
    minimum: 3,
    kind: "disabled",
    usage: "disabled control boundary on an input surface",
    enforcement: "report",
  },
];

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: RgbColor): number {
  return (
    0.2126 * linearize(color.red) + 0.7152 * linearize(color.green) + 0.0722 * linearize(color.blue)
  );
}

export function contrastRatio(first: RgbColor, second: RgbColor): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

export function resolveTokenColor(token: string): RgbColor {
  const rootValue = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (!rootValue) throw new Error(`Semantic token ${token} did not resolve in the browser`);

  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D context is unavailable");
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = computed;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  if (alpha !== 255) throw new Error(`Semantic token ${token} resolved to a translucent color`);
  return { red, green, blue };
}

export function auditContrast(
  policy: readonly ContrastPolicyEntry[] = CONTRAST_POLICY,
): ContrastResult[] {
  const colors = new Map<string, RgbColor>();
  const color = (token: string) => {
    const cached = colors.get(token);
    if (cached) return cached;
    const resolved = resolveTokenColor(token);
    colors.set(token, resolved);
    return resolved;
  };

  return policy.map((entry) => ({
    ...entry,
    ratio: contrastRatio(color(entry.foreground), color(entry.background)),
  }));
}

export function formatContrastFailures(theme: string, failures: readonly ContrastResult[]): string {
  const lines = failures.map(
    ({ id, foreground, background, minimum, ratio, usage }) =>
      `  ${id}: ${ratio.toFixed(2)}:1 < ${minimum}:1 (${foreground} / ${background}; ${usage})`,
  );
  return `${theme} violates the semantic contrast policy:\n${lines.join("\n")}`;
}
