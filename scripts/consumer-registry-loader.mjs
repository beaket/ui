import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Test the checkout through the real CLI, without waiting for it to be released.
const root = resolve(import.meta.dirname, "..");
const fetchRemote = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = new URL(String(input));
  const file = url.pathname.match(
    /^\/beaket\/ui\/.+\/(registry\/registry\.json|src\/components\/[\w-]+\.tsx)$/,
  )?.[1];
  if (url.hostname === "raw.githubusercontent.com" && file) {
    return new Response(await readFile(resolve(root, file), "utf8"));
  }
  return fetchRemote(input, options);
};
