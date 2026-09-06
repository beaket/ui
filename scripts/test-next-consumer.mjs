import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const registry = JSON.parse(readFileSync(join(root, "registry/registry.json"), "utf8"));
const fixture = join(root, "scripts/fixtures/next-page.tsx");
const page = readFileSync(fixture, "utf8");
assert(!/^\s*["']use client["'];/m.test(page), "The fixture must remain a server page");
for (const { name } of registry.components) {
  assert(page.includes(`from "@/components/ui/${name}"`), `Render ${name} in the server fixture`);
}
const directory = mkdtempSync(join(tmpdir(), "beaket-next-consumer-"));
const app = join(directory, "app");

function run(command, args, cwd = app) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed`);
}

try {
  run(
    "npx",
    [
      "--yes",
      "create-next-app@16.3.4",
      "app",
      "--ts",
      "--app",
      "--tailwind",
      "--src-dir",
      "--use-npm",
      "--skip-install",
      "--disable-git",
      "--import-alias",
      "@/*",
      "--yes",
    ],
    directory,
  );
  run("npm", ["install"]);
  const cli = [
    "--import",
    join(root, "scripts/consumer-registry-loader.mjs"),
    join(root, "packages/cli/dist/index.js"),
  ];
  run(process.execPath, [...cli, "init", "--yes"]);
  run(process.execPath, [...cli, "add", ...registry.components.map(({ name }) => name)]);
  copyFileSync(fixture, join(app, "src/app/page.tsx"));
  // Avoid next/font's external font download; keep the generated Tailwind/PostCSS setup.
  writeFileSync(
    join(app, "src/app/layout.tsx"),
    `import "./globals.css";\nexport default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }\n`,
  );
  run("npm", ["run", "build"]);
  console.log(`${registry.components.length} components rendered by a Next.js server page`);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
