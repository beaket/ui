import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// Serves the IME e2e fixture (#1176) straight from source, so the suite tests the code on the branch.
export default defineConfig({
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), "fixture"),
  plugins: [react()],
  server: { port: 5179, strictPort: true, host: "127.0.0.1" },
});
