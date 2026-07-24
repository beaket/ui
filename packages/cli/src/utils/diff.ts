import fs from "fs-extra";
import path from "path";
import { fetchComponent, type ComponentDefinition } from "./registry.ts";

/**
 * A registry file path is repo-relative (`components/button.tsx`); the copy in a
 * consumer's project lives flat under their components dir (`button.tsx`).
 */
export function toLocalRelativePath(registryFilePath: string): string {
  return registryFilePath.replace(/^components\//, "");
}

/**
 * Compare content by meaning, not bytes — but only for differences that are
 * never real content: a CRLF checkout (git autocrlf) or a trailing final
 * newline. Per-line trailing whitespace is left intact: it can be significant
 * inside a template literal, and for an update tool a false "up to date" (a real
 * change hidden) is worse than a false "differs".
 */
export function normalize(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

export type FileStatus = "same" | "different" | "missing";
export type ComponentStatus = "up-to-date" | "outdated" | "not-installed";

export interface FileComparison {
  /** Local relative path, e.g. `button.tsx`. */
  path: string;
  status: FileStatus;
  local: string | null;
  upstream: string;
}

export interface ComponentComparison {
  name: string;
  status: ComponentStatus;
  files: FileComparison[];
}

/**
 * Overall status from the per-file results. A component whose files are all
 * absent isn't installed; any local file differing from (or missing against) an
 * installed component means the copy differs from the current registry. Without
 * installed-version tracking we can't tell an upstream restyle apart from a
 * local customization — both surface as "outdated", so callers must frame it as
 * a difference, not a proven update, and never overwrite blindly.
 */
export function deriveComponentStatus(files: FileComparison[]): ComponentStatus {
  if (files.length === 0 || files.every((f) => f.status === "missing")) {
    return "not-installed";
  }
  if (files.some((f) => f.status === "different" || f.status === "missing")) {
    return "outdated";
  }
  return "up-to-date";
}

/**
 * Cheap presence check (no network): a component counts as installed when at
 * least one of its files exists locally. Used to scope the `diff` overview to
 * what the consumer actually has.
 */
export async function isComponentInstalled(
  def: ComponentDefinition,
  componentsDir: string,
): Promise<boolean> {
  for (const filePath of def.files) {
    const localPath = path.join(componentsDir, toLocalRelativePath(filePath));
    if (await fs.pathExists(localPath)) return true;
  }
  return false;
}

/** Fetch the upstream files for a component and compare them against the local copy. */
export async function compareComponent(
  def: ComponentDefinition,
  componentsDir: string,
): Promise<ComponentComparison> {
  const upstreamFiles = await fetchComponent(def);
  const files: FileComparison[] = [];

  for (const upstream of upstreamFiles) {
    const rel = toLocalRelativePath(upstream.path);
    const localPath = path.join(componentsDir, rel);

    if (!(await fs.pathExists(localPath))) {
      files.push({ path: rel, status: "missing", local: null, upstream: upstream.content });
      continue;
    }

    const local = await fs.readFile(localPath, "utf-8");
    const status: FileStatus =
      normalize(local) === normalize(upstream.content) ? "same" : "different";
    files.push({ path: rel, status, local, upstream: upstream.content });
  }

  return { name: def.name, status: deriveComponentStatus(files), files };
}

export type DiffLineType = "add" | "remove" | "context";

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

/**
 * Line-level diff via longest-common-subsequence. Component files are small
 * (a few hundred lines), so the O(n·m) table is cheap and keeps the CLI free of
 * a diff dependency.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "context", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ type: "remove", text: a[i] });
      i++;
    } else {
      out.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "remove", text: a[i++] });
  while (j < m) out.push({ type: "add", text: b[j++] });
  return out;
}

/**
 * Collapse long runs of unchanged lines to `context` around each change, so a
 * one-line edit doesn't print the whole file. Runs longer than `2·context + 1`
 * become a `…` marker.
 */
export function collapseContext(lines: DiffLine[], context = 3): DiffLine[] {
  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((line, idx) => {
    if (line.type !== "context") {
      for (
        let k = Math.max(0, idx - context);
        k <= Math.min(lines.length - 1, idx + context);
        k++
      ) {
        keep[k] = true;
      }
    }
  });

  const out: DiffLine[] = [];
  let gap = false;
  lines.forEach((line, idx) => {
    if (keep[idx]) {
      out.push(line);
      gap = false;
    } else if (!gap) {
      out.push({ type: "context", text: "…" });
      gap = true;
    }
  });
  return out;
}
