import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import registry from "../registry/registry.json" with { type: "json" };

const components = new Set(registry.components.map(({ name }) => name));
const pages = new Map([
  ["docs/src/pages/index.astro", "/ui/"],
  ["docs/src/pages/installation.md", "/ui/installation"],
  ["docs/src/pages/cli.md", "/ui/cli"],
  ["docs/src/pages/design-rules.astro", "/ui/design-rules"],
  ["docs/src/pages/tokens.astro", "/ui/tokens"],
  ["docs/src/pages/themes.astro", "/ui/themes"],
  ["docs/src/pages/changelog.astro", "/ui/changelog"],
]);

export function selectVisualTests(files) {
  const selectedComponents = new Set();
  const selectedDocs = new Set();

  for (const file of files) {
    const component = file
      .match(/^src\/(?:components\/([a-z0-9-]+)(?:\.stories)?\.tsx|examples\/([a-z0-9-]+)\/)/)
      ?.slice(1)
      .find(Boolean);
    if (component) {
      if (!components.has(component)) return { mode: "full" };
      selectedComponents.add(component);
      selectedDocs.add(`/ui/components/${component}`);
      continue;
    }

    if (pages.has(file)) {
      selectedDocs.add(pages.get(file));
      continue;
    }

    if (
      file === "src/styles.css" ||
      file.startsWith("src/themes/") ||
      file.startsWith(".storybook/") ||
      file.startsWith("docs/src/layouts/") ||
      file.startsWith("docs/src/styles/") ||
      file.startsWith("docs/src/components/") ||
      file.startsWith("registry/") ||
      file.startsWith("tests/") ||
      file === "playwright.visual.config.ts" ||
      file === ".github/workflows/visual-regression.yml" ||
      file === ".github/workflows/update-visual-baselines.yml" ||
      file === "package.json" ||
      file === "pnpm-lock.yaml" ||
      file.endsWith("/package.json") ||
      file.endsWith("/pnpm-lock.yaml") ||
      file === "scripts/select-visual-tests.mjs"
    ) {
      return { mode: "full" };
    }

    // Known non-visual files may skip; every other path is conservatively global.
    if (
      !file.startsWith(".changeset/") &&
      file !== "README.md" &&
      !/^docs\/[^/]+\.md$/.test(file)
    ) {
      return { mode: "full" };
    }
  }

  if (!selectedComponents.size && !selectedDocs.size) return { mode: "skip" };
  return {
    mode: "selected",
    components: [...selectedComponents].sort(),
    docs: [...selectedDocs].sort(),
  };
}

if (process.argv[2] === "--test") {
  assert.deepEqual(selectVisualTests(["src/components/button.tsx"]), {
    mode: "selected",
    components: ["button"],
    docs: ["/ui/components/button"],
  });
  assert.deepEqual(selectVisualTests(["docs/src/pages/themes.astro"]), {
    mode: "selected",
    components: [],
    docs: ["/ui/themes"],
  });
  assert.deepEqual(selectVisualTests(["src/themes/dark.css"]), { mode: "full" });
  assert.deepEqual(selectVisualTests(["README.md"]), { mode: "skip" });
  assert.deepEqual(selectVisualTests(["docs/a11y-automated-check-contract.md"]), { mode: "skip" });
  assert.deepEqual(selectVisualTests(["src/components/button.stories.tsx"]), {
    mode: "selected",
    components: ["button"],
    docs: ["/ui/components/button"],
  });
  assert.deepEqual(selectVisualTests(["docs/src/pages/cli.md"]), {
    mode: "selected",
    components: [],
    docs: ["/ui/cli"],
  });
} else {
  const [base, head] = process.argv.slice(2);
  if (!base || !head) throw new Error("Usage: select-visual-tests.mjs <base-sha> <head-sha>");
  const files = execFileSync("git", ["diff", "--name-only", base, head], { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  const selection = selectVisualTests(files);
  console.log(`mode=${selection.mode}`);
  console.log(`components=${selection.components?.join(",") ?? ""}`);
  console.log(`docs=${selection.docs?.join(",") ?? ""}`);
}
