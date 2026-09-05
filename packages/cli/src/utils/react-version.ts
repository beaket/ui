import { readFile } from "node:fs/promises";
import path from "path";

// A consumer's package.json may carry a BOM (Windows editors write one, and
// `JSON.parse` rejects it). fs-extra's `readJson` stripped it; this keeps that.
const readJson = async (file: string) =>
  JSON.parse((await readFile(file, "utf-8")).replace(/^\uFEFF/, ""));

/**
 * A React floor is a **check, not an install**. `registry.json`'s `dependencies`
 * are bare names handed straight to `npm install`, so a `"react"` entry there
 * would pull React to latest in the consumer's project as a side effect of
 * `add button` — the opposite of declaring a minimum. So the floor lives in its
 * own field and is verified against what the consumer already has.
 *
 * Accepted spellings: `">=19.2"`, `">= 19.2.0"`, `"19"`. Anything else is
 * ignored rather than guessed at — a floor we cannot parse must not produce a
 * warning we cannot justify.
 */
const VERSION_RE = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/;

export type Version = [number, number, number];

export function parseVersion(value: string | undefined | null): Version | null {
  if (!value) return null;
  const match = VERSION_RE.exec(value);
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

export function compareVersions(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/** The highest of the given floors, or null when none parse. */
export function highestFloor(floors: (string | undefined)[]): string | null {
  let best: { raw: string; version: Version } | null = null;
  for (const raw of floors) {
    if (!raw) continue;
    const version = parseVersion(raw);
    if (!version) continue;
    if (!best || compareVersions(version, best.version) > 0) best = { raw, version };
  }
  return best?.raw ?? null;
}

/**
 * What React the consumer actually has. `node_modules/react/package.json` is the
 * truth; the declared range in `package.json` is the fallback, read as its
 * minimum (`^19.1.0` → 19.1.0) because that is the worst case the floor has to
 * clear. Returns null when neither is readable — we do not warn about a version
 * we could not determine.
 */
export async function readInstalledReact(cwd: string): Promise<string | null> {
  try {
    const installed = await readJson(path.join(cwd, "node_modules", "react", "package.json"));
    if (typeof installed?.version === "string") return installed.version;
  } catch {
    // fall through to the declared range
  }

  try {
    const pkg = await readJson(path.join(cwd, "package.json"));
    for (const field of ["dependencies", "devDependencies", "peerDependencies"] as const) {
      const declared = pkg?.[field]?.react;
      if (typeof declared === "string") return declared;
    }
  } catch {
    // no package.json we can read
  }

  return null;
}

export function satisfiesFloor(installed: string | null, floor: string): boolean | null {
  const have = parseVersion(installed);
  const need = parseVersion(floor);
  if (!have || !need) return null;
  return compareVersions(have, need) >= 0;
}

/**
 * The whole warning decision in one place, so it can be tested without a
 * network fetch or a temp project: which components are below the floor, and
 * which floor to name. Returns null when there is nothing to say — including
 * when the installed version could not be determined.
 */
export function reactFloorWarning(
  registryFloor: string | undefined,
  components: { name: string; react?: string }[],
  installed: string | null,
): { floor: string; names: string[] } | null {
  const names: string[] = [];
  const unmet: string[] = [];

  for (const component of components) {
    const floor = component.react ?? registryFloor;
    if (!floor) continue;
    if (satisfiesFloor(installed, floor) === false) {
      names.push(component.name);
      unmet.push(floor);
    }
  }

  const floor = highestFloor(unmet);
  return floor && names.length > 0 ? { floor, names } : null;
}
