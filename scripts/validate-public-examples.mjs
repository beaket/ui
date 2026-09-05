#!/usr/bin/env node
import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const examplesDir = resolve(root, "src/examples");
const registry = JSON.parse(readFileSync(resolve(root, "registry/registry.json"), "utf8"));
const interactiveExampleSource = readFileSync(
  resolve(root, "docs/src/components/interactive-example.tsx"),
  "utf8",
);
const interactiveExampleKeys = new Set(
  [...interactiveExampleSource.matchAll(/^\s*"([^"]+)":/gm)].map(([, key]) => key),
);

/** Mirrors `moduleFor` in src/examples/registry.ts. */
const moduleFor = (component, story) =>
  `${component}/${story.replace(/(?!^)(?=[A-Z])/g, "-").toLowerCase()}.tsx`;

const failures = [];
const modules = globSync("*/*.tsx", { cwd: examplesDir }).sort();

for (const module of modules) {
  const source = readFileSync(resolve(examplesDir, module), "utf8");
  if (!/export\s+default\s+(function|\(?)/.test(source))
    failures.push(`${module}: public module must have a default component export`);
  if (/\b(window|document|localStorage|sessionStorage|navigator)\b/.test(source))
    failures.push(`${module}: public source has an unsupported browser-only render path`);
  if (/(@storybook\/|storybook\/test|\bMeta\b|\bStoryObj\b|\bplay\s*:)/.test(source))
    failures.push(`${module}: Storybook-only code leaked into public source`);
}

// Every documented section resolves to a module, and every module is documented.
const referenced = new Set();
for (const component of registry.components) {
  const docs = component.docs;
  if (!docs) continue;
  for (const story of [...(docs.sections ?? []), docs.previewStory].filter(Boolean)) {
    const module = moduleFor(component.name, story);
    referenced.add(module);
    if (!modules.includes(module))
      failures.push(`registry reference has no public example: ${component.name}:${story}`);
  }
}
for (const module of modules) {
  if (!referenced.has(module)) failures.push(`public example nothing documents: ${module}`);
}

for (const key of interactiveExampleKeys) {
  const [component, story] = key.split("/");
  if (!modules.includes(moduleFor(component, story)))
    failures.push(`docs registers an example that does not exist: ${key}`);
}

if (failures.length) {
  console.error(
    "Public example contract failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"),
  );
  process.exit(1);
}
console.log(`Public example contract valid (${modules.length} examples).`);
