/**
 * Shared parsing for the palette files in this directory. A palette is a light
 * `:root` block plus an optional `@media (prefers-color-scheme: dark)` twin, so
 * every consumer that wants one scheme on its own — the Storybook toolbar, the
 * contrast audit, the docs token generator — needs the same two operations.
 */
const DARK_BLOCK = /@media[^{]*prefers-color-scheme[^{]*dark[^{]*\{/i;

/** Whether a palette ships a dark twin at all. */
export function hasDarkBlock(css: string): boolean {
  return DARK_BLOCK.test(css);
}

/**
 * Return the palette with one scheme forced, so the OS preference cannot flip it:
 * "light" drops the dark block, "dark" unwraps it so its `:root` wins outright.
 * `null` when "dark" is asked of a palette that has no dark twin.
 */
export function forceScheme(raw: string, scheme: "light" | "dark"): string | null {
  const match = raw.match(DARK_BLOCK);
  if (!match || match.index === undefined) return scheme === "dark" ? null : raw;

  const at = match.index;
  const open = at + match[0].length - 1; // index of the block-opening `{`
  let depth = 0;
  for (let index = open; index < raw.length; index++) {
    if (raw[index] === "{") depth++;
    if (raw[index] !== "}") continue;
    depth--;
    if (depth !== 0) continue;

    const withoutDark = raw.slice(0, at) + raw.slice(index + 1);
    return scheme === "light" ? withoutDark : `${withoutDark}\n${raw.slice(open + 1, index)}`;
  }
  throw new Error("Theme contains an unterminated dark media block");
}

/** Every custom property declared in a CSS block, in source order. */
export function declarations(css: string): Map<string, string> {
  return new Map(
    [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].replace(/\s+/g, " ").trim(),
    ]),
  );
}

/** The `:root` declarations of both schemes; `dark` is null without a dark twin. */
export function paletteVariants(css: string): {
  light: Map<string, string>;
  dark: Map<string, string> | null;
} {
  const beforeMedia = css.split("@media")[0];
  const lightMatch = beforeMedia.match(/:root\s*\{([\s\S]*?)\}/);
  const darkMatch = css.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([\s\S]*?)\}\s*\}/,
  );

  return {
    light: declarations(lightMatch?.[1] ?? ""),
    dark: darkMatch ? declarations(darkMatch[1]) : null,
  };
}
