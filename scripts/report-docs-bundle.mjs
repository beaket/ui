import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const outputDirectory = path.resolve("docs/dist");
const maxPublicJavaScriptBytes = 400_000;
const forbiddenPatterns = [
  { label: "storybook/test", pattern: /storybook\/test/ },
  { label: "Storybook runtime", pattern: /@storybook\// },
  { label: "Storybook story module", pattern: /\.stories(?:\.|-)/ },
];

async function filesRecursively(directory) {
  const entries = await readdir(directory);
  const files = await Promise.all(
    entries.map(async (entry) => {
      const file = path.join(directory, entry);
      return (await stat(file)).isDirectory() ? filesRecursively(file) : [file];
    }),
  );
  return files.flat();
}

const files = (await filesRecursively(outputDirectory))
  .filter((file) => file.endsWith(".js") || file.endsWith(".mjs"))
  .sort();

const chunks = await Promise.all(
  files.map(async (file) => {
    const contents = await readFile(file);
    return {
      file: path.relative(outputDirectory, file),
      rawBytes: contents.byteLength,
      gzipBytes: gzipSync(contents).byteLength,
      contents: contents.toString("utf8"),
    };
  }),
);

const rawBytes = chunks.reduce((total, chunk) => total + chunk.rawBytes, 0);
const gzipBytes = chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0);
const failures = chunks.flatMap((chunk) =>
  forbiddenPatterns
    .filter(({ pattern }) => pattern.test(chunk.contents))
    .map(({ label }) => `${chunk.file}: contains ${label}`),
);

if (rawBytes > maxPublicJavaScriptBytes) {
  failures.push(
    `public JavaScript is ${rawBytes} bytes; limit is ${maxPublicJavaScriptBytes} bytes`,
  );
}

console.log("Docs public JavaScript bundle report");
console.table(chunks.map(({ file, rawBytes: raw, gzipBytes: gzip }) => ({ file, raw, gzip })));
console.log(`Total: ${rawBytes} raw bytes, ${gzipBytes} gzip bytes`);

if (failures.length > 0) {
  console.error("\nDocs bundle boundary check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
