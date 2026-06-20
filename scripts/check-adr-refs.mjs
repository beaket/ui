#!/usr/bin/env node
// Fails if any `ADR-NNNN` cited in packages/paper/src/** lacks a matching
// packages/paper/docs/adr/NNNN-*.md file. Keeps ADR citations from dangling
// (the broken state this log started in). See packages/paper/docs/adr/README.md.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC_DIR = join(ROOT, "packages/paper/src");
const ADR_DIR = join(ROOT, "packages/paper/docs/adr");

const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const ADR_REF = /ADR-(\d{1,4})/g;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (CODE_EXT.test(name)) out.push(full);
  }
  return out;
}

// Set of ADR numbers that have a file, e.g. "0004" from 0004-*.md
const known = new Set(
  readdirSync(ADR_DIR)
    .map((f) => f.match(/^(\d{4})-.*\.md$/)?.[1])
    .filter(Boolean),
);

const missing = [];
for (const file of walk(SRC_DIR)) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(ADR_REF)) {
      const num = m[1].padStart(4, "0");
      if (!known.has(num)) {
        missing.push(
          `${relative(ROOT, file)}:${i + 1}  ->  ADR-${num} (no packages/paper/docs/adr/${num}-*.md)`,
        );
      }
    }
  });
}

if (missing.length) {
  console.error(
    "✗ Dangling ADR references — every ADR-NNNN must resolve to a file in packages/paper/docs/adr/:\n",
  );
  for (const line of missing) console.error("  " + line);
  console.error(
    `\n${missing.length} dangling reference(s). Add the ADR or fix the citation. See packages/paper/docs/adr/README.md.`,
  );
  process.exit(1);
}

console.log(`✓ All ADR references resolve (${known.size} ADRs known).`);
