#!/usr/bin/env node
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const script = join(__dirname, "..", "src", "index.ts");

spawnSync("npx", ["tsx", script, ...process.argv.slice(2)], {
  stdio: "inherit",
});
