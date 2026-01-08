/**
 * Syncs CSS variables from src/css-variables.css to CLI's generated file.
 * Run this whenever css-variables.css changes.
 *
 * Usage: npx tsx scripts/sync-css-variables.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const sourcePath = path.join(rootDir, "src/css-variables.css");
const targetPath = path.join(rootDir, "packages/cli/src/generated/css-variables.ts");

const cssContent = fs.readFileSync(sourcePath, "utf-8");

// Remove the comment header (first 5 lines) for cleaner output
const lines = cssContent.split("\n");
const cleanedContent = lines.slice(5).join("\n").trim();

const tsContent = `// Auto-generated from src/css-variables.css
// Do not edit manually. Run: pnpm sync:css

export const CSS_VARIABLES = \`
/* Beaket UI Design System */
${cleanedContent}
\`;
`;

fs.writeFileSync(targetPath, tsContent);

console.log("✔ Synced css-variables.css → packages/cli/src/generated/css-variables.ts");
