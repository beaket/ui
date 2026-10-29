import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Plugin, defineConfig } from "vite";

// Counts every guardedDecorations compute call (#482) by rewriting composing-guard.ts as the fixture
// serves it, so the shipped module carries no test hook. The wrapper records whether the view was
// composing, which is what invariant #1 forbids. If the helper's shape changes and the anchor is
// gone, the server fails loudly instead of the counter silently reading zero.
function countDecorationComputes(): Plugin {
  const anchor = /(export function guardedDecorations\([\s\S]*?\): Extension \{\n)/;
  return {
    name: "paper-count-decoration-computes",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("/extensions/composing-guard.ts")) return;
      if (!anchor.test(code)) {
        throw new Error(
          "composing-guard.ts: guardedDecorations anchor not found; update e2e/vite.config.ts",
        );
      }
      return code.replace(
        anchor,
        `$1  const __compute = compute;
  compute = (view) => {
    const counter = (globalThis as { __paper?: { computes?: { total: number; composing: number } } })
      .__paper?.computes;
    if (counter) {
      counter.total++;
      if (view.composing) counter.composing++;
    }
    return __compute(view);
  };
`,
      );
    },
  };
}

// Serves the IME e2e fixture (#1176) straight from source, so the suite tests the code on the branch.
export default defineConfig({
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), "fixture"),
  plugins: [countDecorationComputes(), react()],
  server: { port: 5179, strictPort: true, host: "127.0.0.1" },
});
