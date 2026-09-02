import { mkdir, readFile, writeFile } from "node:fs/promises";

const resultsDir = "test-results";
const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function readJson(name) {
  try {
    return JSON.parse(await readFile(`${resultsDir}/${name}`, "utf8"));
  } catch {
    return null;
  }
}

const [component, docs] = await Promise.all([
  readJson("components-a11y.json"),
  readJson("docs-a11y.json"),
]);
const scans = docs?.results ?? [];
const violations = scans.flatMap((scan) => scan.violations ?? []);
const incomplete = scans.flatMap((scan) => scan.incomplete ?? []);
const engine = scans[0]?.testEngine?.version ?? "not recorded";
const componentStatus = component ? (component.success ? "passed" : "failed") : "not produced";

const summary = `# Automated accessibility evidence

- Revision: \`${process.env.GITHUB_SHA ?? "local"}\`
- Browser: Chromium (Playwright)
- axe-core: ${engine}
- Tags: ${tags.map((tag) => `\`${tag}\``).join(", ")}

| Scan | Command | Result | Violations | Incomplete |
| --- | --- | --- | ---: | ---: |
| Component stories | \`pnpm test:a11y:components\` | ${componentStatus} | reported by Storybook test failure | not exposed by the Storybook Vitest reporter |
| Documentation flows (${scans.length}) | \`pnpm test:a11y:docs\` | ${docs ? "recorded" : "not produced"} | ${violations.length} | ${incomplete.length} |

Raw results: \`components-a11y.json\` and \`docs-a11y.json\`. See [the automated accessibility contract](../docs/a11y-automated-check-contract.md) for the coverage matrix, exceptions, and manual-only limits. These checks do not establish WCAG certification or complete conformance.
`;

await mkdir(resultsDir, { recursive: true });
await writeFile(`${resultsDir}/a11y-summary.md`, summary);
