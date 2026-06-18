import { defineConfig } from "tsup";

export default defineConfig({
  // Two entry points → two published subpaths: `.` (core, zero React) and `./react`.
  entry: ["src/index.ts", "src/react/index.ts"],
  format: ["esm"],
  target: "es2022",
  outDir: "dist",
  dts: true,
  clean: true,
  // CodeMirror/Lezer are runtime deps and React is an optional peer — keep them external.
  external: ["react", "react-dom"],
});
