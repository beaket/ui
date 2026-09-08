import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import prompts from "prompts";
import type ts from "typescript";
import type { DetectedAlias } from "../commands/init.ts";
import { backupFile } from "./files.ts";

type TypeScript = typeof ts;

export function aliasMatches(
  aliases: Array<{ find: string | RegExp; replacement: string }>,
  alias: DetectedAlias,
): boolean | undefined {
  const probe = `${alias.name}/__beaket_alias_probe__`;
  for (const entry of aliases) {
    const matches =
      typeof entry.find === "string"
        ? probe === entry.find || probe.startsWith(`${entry.find}/`)
        : new RegExp(entry.find.source, entry.find.flags).test(probe);
    if (matches)
      return (
        path.normalize(probe.replace(entry.find, entry.replacement)) ===
        path.join(alias.directory, "__beaket_alias_probe__")
      );
  }
  return undefined;
}

function exportedObject(compiler: TypeScript, source: ts.SourceFile) {
  const statement = source.statements.find(compiler.isExportAssignment);
  if (!statement) return;
  let expression = statement.expression;
  if (
    compiler.isCallExpression(expression) &&
    expression.expression.getText(source) === "defineConfig"
  ) {
    expression = expression.arguments[0]!;
  }
  return expression && compiler.isObjectLiteralExpression(expression) ? expression : undefined;
}

function postcssObject(compiler: TypeScript, source: ts.SourceFile) {
  const direct = exportedObject(compiler, source);
  if (direct) return direct;
  const exported = source.statements.find(compiler.isExportAssignment)?.expression;
  for (const statement of source.statements) {
    if (exported && compiler.isIdentifier(exported) && compiler.isVariableStatement(statement)) {
      const declaration = statement.declarationList.declarations.find(
        (item) => item.name.getText(source) === exported.text,
      );
      if (declaration?.initializer && compiler.isObjectLiteralExpression(declaration.initializer))
        return declaration.initializer;
    }
    if (
      compiler.isExpressionStatement(statement) &&
      compiler.isBinaryExpression(statement.expression)
    ) {
      const { left, right, operatorToken } = statement.expression;
      if (
        left.getText(source) === "module.exports" &&
        operatorToken.kind === compiler.SyntaxKind.EqualsToken &&
        compiler.isObjectLiteralExpression(right)
      )
        return right;
    }
  }
}

export function hasPostcssPlugin(compiler: TypeScript, content: string): boolean {
  const source = compiler.createSourceFile(
    "postcss.config.ts",
    content,
    compiler.ScriptTarget.Latest,
    true,
  );
  // ponytail: inspect common static PostCSS shapes; dynamic plugin setup needs a manual build check.
  const root = postcssObject(compiler, source);
  if (!root || root.properties.some(compiler.isSpreadAssignment)) return false;
  const plugins = root.properties.find(
    (property) => property.name?.getText(source).replaceAll(/["']/g, "") === "plugins",
  );
  return Boolean(
    plugins &&
    compiler.isPropertyAssignment(plugins) &&
    compiler.isObjectLiteralExpression(plugins.initializer) &&
    !plugins.initializer.properties.some(compiler.isSpreadAssignment) &&
    plugins.initializer.properties.some(
      (property) =>
        compiler.isPropertyAssignment(property) &&
        property.name.getText(source).replaceAll(/["']/g, "") === "@tailwindcss/postcss" &&
        compiler.isObjectLiteralExpression(property.initializer),
    ),
  );
}

/** Preserve comments and unrelated options; refuse shapes we cannot edit safely. */
export function enableViteTsconfigPaths(compiler: TypeScript, content: string): string | undefined {
  const source = compiler.createSourceFile(
    "vite.config.ts",
    content,
    compiler.ScriptTarget.Latest,
    true,
  );
  const root = exportedObject(compiler, source);
  if (!root || root.properties.some(compiler.isSpreadAssignment)) return;
  const resolve = root.properties.find(
    (property) => property.name?.getText(source).replaceAll(/["']/g, "") === "resolve",
  );
  if (!resolve) {
    return (
      content.slice(0, root.properties.pos) +
      "\n  resolve: { tsconfigPaths: true }," +
      content.slice(root.properties.pos)
    );
  }
  if (
    !compiler.isPropertyAssignment(resolve) ||
    !compiler.isObjectLiteralExpression(resolve.initializer)
  )
    return;
  const object = resolve.initializer;
  if (object.properties.some(compiler.isSpreadAssignment)) return;
  const existing = object.properties.find(
    (property) => property.name?.getText(source).replaceAll(/["']/g, "") === "tsconfigPaths",
  );
  if (existing) {
    if (!compiler.isPropertyAssignment(existing)) return;
    return (
      content.slice(0, existing.initializer.getStart(source)) +
      "true" +
      content.slice(existing.initializer.end)
    );
  }
  return (
    content.slice(0, object.properties.pos) +
    " tsconfigPaths: true," +
    content.slice(object.properties.pos)
  );
}

export async function checkSetup(
  alias: DetectedAlias | undefined,
  yes: boolean,
  css: string,
  cwd = process.cwd(),
): Promise<boolean> {
  const require = createRequire(path.join(cwd, "package.json"));
  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(message);
  const version = (name: string): string | undefined => {
    try {
      return require(`${name}/package.json`).version;
    } catch {
      return undefined;
    }
  };
  if (!version("tailwindcss")?.startsWith("4."))
    warn(
      "Tailwind CSS v4 is not installed. Install tailwindcss and either @tailwindcss/vite or @tailwindcss/postcss.",
    );
  if (
    !css ||
    !existsSync(path.resolve(cwd, css)) ||
    !/@import\s+["']tailwindcss["']/.test(
      (await readFile(path.resolve(cwd, css), "utf8")).replace(/\/\*[\s\S]*?\*\//g, ""),
    )
  ) {
    warn(
      'The selected CSS file does not import tailwindcss. Add @import "tailwindcss" and import that CSS in your app entry.',
    );
  }
  if (!alias)
    warn(
      "No source alias was detected in tsconfig.json or its references. Configure matching TypeScript and bundler aliases before copying @/ examples; relative component imports still work.",
    );

  let vite: Awaited<ReturnType<typeof import("vite").resolveConfig>> | undefined;
  if (version("vite")) {
    try {
      const api = await import(pathToFileURL(require.resolve("vite")).href);
      vite = await api.resolveConfig({ root: cwd, logLevel: "silent" }, "build");
      const match = alias && aliasMatches(vite!.resolve.alias, alias);
      if (alias && !(match === true || (match === undefined && vite!.resolve.tsconfigPaths))) {
        warn(
          `Vite does not resolve ${alias.name} to ${alias.directory}. TypeScript paths alone do not configure the bundler.`,
        );
        if (
          match === undefined &&
          Number(version("vite")?.split(".")[0]) >= 8 &&
          vite!.configFile
        ) {
          const file = vite!.configFile;
          const content = await readFile(file, "utf8");
          const fixed = enableViteTsconfigPaths(require("typescript"), content);
          // ponytail: only literal Vite objects are rewritten; dynamic configs need the printed manual edit.
          if (fixed && !yes) {
            const { confirm } = await prompts({
              type: "confirm",
              name: "confirm",
              initial: false,
              message: `Back up ${path.basename(file)} and enable resolve.tsconfigPaths?`,
            });
            if (confirm) {
              // Do not overwrite a config edited while the prompt was open.
              if ((await readFile(file, "utf8")) !== content)
                throw new Error(
                  "Vite config changed during confirmation; no config was overwritten.",
                );
              const backup = await backupFile(file);
              await writeFile(file, fixed);
              console.log(`Updated ${path.basename(file)}; previous config saved at ${backup}.`);
              vite = await api.resolveConfig({ root: cwd, logLevel: "silent" }, "build");
              const updatedMatch = aliasMatches(vite!.resolve.alias, alias);
              if (
                updatedMatch === true ||
                (updatedMatch === undefined && vite!.resolve.tsconfigPaths)
              )
                warnings.pop();
            }
          }
        }
        if (warnings.at(-1)?.startsWith("Vite does not resolve"))
          warn(
            match === false
              ? "Correct the existing resolve.alias entry manually; it takes priority over TypeScript paths."
              : "Set resolve.tsconfigPaths: true in Vite 8+, or add the matching resolve.alias entry manually. --yes does not rewrite toolchain configuration.",
          );
      }
    } catch (error) {
      warn(
        `Could not verify Vite configuration: ${error instanceof Error ? error.message : String(error)}. Check resolve.alias (or Vite 8 resolve.tsconfigPaths) manually.`,
      );
    }
  } else if (!version("next")) {
    warn(
      "Bundler alias resolution was not verified for this toolchain. Configure its alias resolver or use relative imports.",
    );
  }

  const vitePlugin = vite?.plugins.some((plugin) => plugin.name.startsWith("@tailwindcss/vite"));
  if (!vitePlugin) {
    let postcss = false;
    for (const name of [
      "postcss.config.mjs",
      "postcss.config.js",
      "postcss.config.ts",
      "postcss.config.cjs",
    ]) {
      const file = path.join(cwd, name);
      if (!existsSync(file)) continue;
      try {
        const content = await readFile(file, "utf8");
        postcss = hasPostcssPlugin(require("typescript"), content);
      } catch {
        /* Unknown dynamic config: report rather than claim it works. */
      }
      break;
    }
    if (!(postcss && version("@tailwindcss/postcss")))
      warn(
        "Tailwind plugin configuration was not verified. Configure @tailwindcss/vite in Vite plugins, or @tailwindcss/postcss in PostCSS. See https://beaket.github.io/ui/installation#postcss-alternative.",
      );
  }
  for (const message of warnings) console.log(`! ${message}`);
  return warnings.length > 0;
}
