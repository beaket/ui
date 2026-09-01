#!/usr/bin/env node
import { globSync, readFileSync } from "node:fs";

const pages = globSync("docs/dist/components/*/index.html");
const failures = [];

if (!pages.length) failures.push("no generated component pages found");

function getPreviewMarkup(html, start) {
  const tags = /<\/?div\b[^>]*>/g;
  tags.lastIndex = start;
  let depth = 0;
  let match;

  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, tags.lastIndex);
  }

  return null;
}

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const starts = [...html.matchAll(/<div class="preview-box\b/g)].map((match) => match.index);
  if (!starts.length) {
    failures.push(`${page}: no previews`);
    continue;
  }
  for (const [index, start] of starts.entries()) {
    const preview = getPreviewMarkup(html, start);
    if (!preview || !/(data-slot=|<astro-island\b[^>]*\bssr\b)/.test(preview))
      failures.push(`${page}: preview ${index + 1} has no server-rendered markup`);
  }
}

if (failures.length) throw new Error(`Docs preview HTML check failed:\n${failures.join("\n")}`);
console.log(`Meaningful preview HTML verified for ${pages.length} component pages.`);
