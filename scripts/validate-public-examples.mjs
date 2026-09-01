#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "src/examples/manifest.json"), "utf8"));
const registry = JSON.parse(readFileSync(resolve(root, "registry/registry.json"), "utf8"));
const interactiveExampleSource = readFileSync(
  resolve(root, "docs/src/components/interactive-example.tsx"),
  "utf8",
);
const interactiveExampleKeys = new Set(
  [...interactiveExampleSource.matchAll(/^\s*"([^"]+)":/gm)].map(([, key]) => key),
);
const failures = [];
const seenIds = new Set();
const seenReferences = new Set();
const seenModules = new Set();

for (const example of manifest.examples) {
  if (seenIds.has(example.id)) failures.push(`duplicate id: ${example.id}`);
  seenIds.add(example.id);
  if (seenModules.has(example.module)) failures.push(`duplicate module: ${example.module}`);
  seenModules.add(example.module);
  if (!/^[a-z0-9-]+\.[a-z0-9-]+$/.test(example.id))
    failures.push(`invalid stable id: ${example.id}`);
  if (!["static", "interactive"].includes(example.behavior))
    failures.push(`${example.id}: behavior must be static or interactive`);
  if (!["none", "visible"].includes(example.hydration))
    failures.push(`${example.id}: hydration must be none or visible`);
  if (example.behavior === "static" && example.hydration !== "none")
    failures.push(`${example.id}: static examples cannot request hydration`);
  if (example.behavior === "interactive" && example.hydration === "none")
    failures.push(`${example.id}: interactive examples need a hydration boundary`);

  const sourcePath = resolve(root, "src/examples", example.module);
  if (!existsSync(sourcePath)) {
    failures.push(`${example.id}: missing displayable source ${example.module}`);
    continue;
  }
  const source = readFileSync(sourcePath, "utf8");
  if (!/export\s+default\s+(function|\(?)/.test(source))
    failures.push(`${example.id}: public module must have a default component export`);
  if (/\b(window|document|localStorage|sessionStorage|navigator)\b/.test(source))
    failures.push(`${example.id}: public source has an unsupported browser-only render path`);
  if (/(@storybook\/|storybook\/test|\bMeta\b|\bStoryObj\b|\bplay\s*:)/.test(source))
    failures.push(`${example.id}: Storybook-only code leaked into public source`);
  seenReferences.add(`${example.component}:${example.story}`);
}

for (const component of registry.components) {
  const docs = component.docs;
  if (!docs) continue;
  for (const story of [...(docs.sections ?? []), docs.previewStory].filter(Boolean)) {
    if (!seenReferences.has(`${component.name}:${story}`))
      failures.push(`registry reference has no public example: ${component.name}:${story}`);
  }
}

const expectedInteractiveKeys = new Set(
  manifest.examples
    .filter((example) => example.hydration === "visible")
    .map((example) => `${example.component}/${example.story}`),
);

for (const key of expectedInteractiveKeys) {
  if (!interactiveExampleKeys.has(key))
    failures.push(`interactive example is not registered in docs: ${key}`);
}

for (const key of interactiveExampleKeys) {
  if (!expectedInteractiveKeys.has(key))
    failures.push(`docs registers a non-interactive example: ${key}`);
}

if (failures.length) {
  console.error(
    "Public example contract failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"),
  );
  process.exit(1);
}
console.log(`Public example contract valid (${manifest.examples.length} examples).`);
