import type { RgbColor } from "./contrast";

export const SIGNAL_ROLES = ["danger", "warning", "success", "info", "info-alt", "accent"] as const;

export const SIGNAL_FORMS = ["solid", "fg", "bg", "border", "solid-hover", "solid-active"] as const;

export const VISION_MODES = ["normal", "protanopia", "deuteranopia", "tritanopia"] as const;

export type SignalRole = (typeof SIGNAL_ROLES)[number];
export type SignalForm = (typeof SIGNAL_FORMS)[number];
export type VisionMode = (typeof VISION_MODES)[number];

export interface SignalDistanceResult {
  first: SignalRole;
  second: SignalRole;
  form: SignalForm;
  vision: VisionMode;
  distance: number;
  minimum: number;
}

interface OklabColor {
  lightness: number;
  a: number;
  b: number;
}

type LinearRgb = [red: number, green: number, blue: number];
type SimulationMatrix = readonly [LinearRgb, LinearRgb, LinearRgb];

/**
 * Minimum Euclidean distance in OKLab after simulation.
 *
 * 0.04 is the floor for undiluted solids. It leaves a multi-JND working margin
 * for small text and 16px icons, where anti-aliasing and surrounding colors
 * reduce effective separation. Derived forms scale that floor by their authored
 * OKLab mix strength: foreground 50%, tint 17%, and border 60% (rounded up).
 * Tints are supporting surfaces and never the sole status cue. These are Beaket
 * design constraints, not WCAG thresholds.
 */
export const SIGNAL_DISTANCE_MINIMUM: Readonly<Record<SignalForm, number>> = {
  solid: 0.04,
  fg: 0.02,
  bg: 0.007,
  border: 0.025,
  "solid-hover": 0.04,
  "solid-active": 0.04,
};

// Machado, Oliveira, and Fernandes (2009), 100% severity matrices. The
// transforms operate on linear-light sRGB before conversion back to OKLab.
const CVD_MATRICES: Readonly<Record<Exclude<VisionMode, "normal">, SimulationMatrix>> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

function linearize(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function toLinearRgb(color: RgbColor): LinearRgb {
  return [linearize(color.red), linearize(color.green), linearize(color.blue)];
}

function simulate(color: LinearRgb, mode: VisionMode): LinearRgb {
  if (mode === "normal") return color;
  const matrix = CVD_MATRICES[mode];
  return matrix.map((row) =>
    clamp(row[0] * color[0] + row[1] * color[1] + row[2] * color[2]),
  ) as LinearRgb;
}

function toOklab([red, green, blue]: LinearRgb): OklabColor {
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  return {
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function signalDistance(first: RgbColor, second: RgbColor, mode: VisionMode): number {
  const a = toOklab(simulate(toLinearRgb(first), mode));
  const b = toOklab(simulate(toLinearRgb(second), mode));
  return Math.hypot(a.lightness - b.lightness, a.a - b.a, a.b - b.b);
}

export function auditSignalDistances(resolve: (token: string) => RgbColor): SignalDistanceResult[] {
  const colors = new Map<string, RgbColor>();
  const color = (role: SignalRole, form: SignalForm) => {
    const token = `--color-${role}-${form}`;
    const cached = colors.get(token);
    if (cached) return cached;
    const resolved = resolve(token);
    colors.set(token, resolved);
    return resolved;
  };

  return SIGNAL_FORMS.flatMap((form) =>
    VISION_MODES.flatMap((vision) =>
      SIGNAL_ROLES.flatMap((first, firstIndex) =>
        SIGNAL_ROLES.slice(firstIndex + 1).map((second) => ({
          first,
          second,
          form,
          vision,
          distance: signalDistance(color(first, form), color(second, form), vision),
          minimum: SIGNAL_DISTANCE_MINIMUM[form],
        })),
      ),
    ),
  );
}

export function formatSignalDistanceFailures(failures: readonly SignalDistanceResult[]): string {
  return failures
    .map(
      ({ first, second, form, vision, distance, minimum }) =>
        `  ${first}/${second} ${form} under ${vision}: ${distance.toFixed(3)} < ${minimum.toFixed(3)}`,
    )
    .join("\n");
}
