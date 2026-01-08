/**
 * Copies CSS variables from src/css-variables.css to CLI package.
 * Run this whenever css-variables.css changes.
 *
 * Usage: pnpm sync-css
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const sourcePath = path.join(rootDir, "src/css-variables.css");
const targetPath = path.join(rootDir, "packages/cli/src/css-variables.css");

fs.copyFileSync(sourcePath, targetPath);

console.log("✔ Copied css-variables.css → packages/cli/src/css-variables.css");
