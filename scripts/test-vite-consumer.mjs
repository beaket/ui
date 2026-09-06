import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const registry = JSON.parse(readFileSync(join(root, "registry/registry.json"), "utf8"));
const baseline = JSON.parse(
  readFileSync(join(root, "scripts/consumer-lint-baseline.json"), "utf8"),
);
const [component, template = "react-ts"] = process.argv.slice(2);
assert(
  registry.components.some(({ name }) => name === component),
  "Pass a registry component name",
);
assert.equal(template, "react-ts");
const directory = mkdtempSync(join(tmpdir(), "beaket-vite-consumer-"));
const app = join(directory, "app");

function run(command, args, cwd = app, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  return result.stdout;
}

try {
  run(
    "npm",
    ["create", "vite@9.2.0", "app", "--", "--template", template, "--no-interactive"],
    directory,
  );
  const tsconfig = readFileSync(join(app, "tsconfig.app.json"), "utf8");
  run("npm", ["install"]);
  const cli = [
    "--import",
    join(root, "scripts/consumer-registry-loader.mjs"),
    join(root, "packages/cli/dist/index.js"),
  ];
  run(process.execPath, [...cli, "init", "--yes"]);
  run(process.execPath, [...cli, "add", component]);
  run("npm", ["exec", "--", "tsc", "-b"]);
  assert.equal(
    readFileSync(join(app, "tsconfig.app.json"), "utf8"),
    tsconfig,
    "The template's compiler options must remain unchanged",
  );

  const report = JSON.parse(
    run("npm", ["run", "--silent", "lint", "--", "--format", "json"], app, true),
  );
  const counts = {};
  for (const diagnostic of report.diagnostics) {
    assert.equal(diagnostic.code, "react(only-export-components)", JSON.stringify(diagnostic));
    assert.equal(diagnostic.severity, "warning");
    const file = basename(diagnostic.filename);
    counts[file] = (counts[file] ?? 0) + 1;
  }
  const results = join(root, "test-results");
  mkdirSync(results, { recursive: true });
  writeFileSync(join(results, `consumer-${component}.json`), JSON.stringify(report, null, 2));
  for (const [file, count] of Object.entries(counts)) {
    assert(
      count <= (baseline[file] ?? 0),
      `${file}: ${count} Fast Refresh warnings exceed baseline ${baseline[file] ?? 0}`,
    );
  }
  console.log(
    `${component}: stock Vite typecheck passed; Fast Refresh warning counts ${JSON.stringify(counts)}`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
