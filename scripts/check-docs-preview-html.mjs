#!/usr/bin/env node
import { globSync, readFileSync } from "node:fs";

const pages = globSync("docs/dist/components/*/index.html");
const failures = [];

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const starts = [...html.matchAll(/<div class="preview-box\b/g)].map((match) => match.index);
  if (!starts.length) {
    failures.push(`${page}: no previews`);
    continue;
  }
  for (const [index, start] of starts.entries()) {
    const end = starts[index + 1] ?? html.length;
    const preview = html.slice(start, end);
    if (!/(data-slot=|<astro-island\b[^>]*\bssr\b)/.test(preview))
      failures.push(`${page}: preview ${index + 1} has no server-rendered markup`);
  }
}

if (failures.length) throw new Error(`Docs preview HTML check failed:\n${failures.join("\n")}`);
console.log(`Meaningful preview HTML verified for ${pages.length} component pages.`);
