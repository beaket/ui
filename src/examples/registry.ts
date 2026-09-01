import type { PublicExample } from "./contract";
import manifest from "./manifest.json";

const components = import.meta.glob("./**/*.tsx", {
  eager: true,
  import: "default",
}) as Record<string, PublicExample["Component"]>;

const sources = import.meta.glob("./**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const definitions = manifest.examples as Omit<PublicExample, "Component" | "source">[];

export const publicExamples: PublicExample[] = definitions.map((example) => {
  const modulePath = `./${example.module}`;
  const Component = components[modulePath];
  const source = sources[modulePath];
  if (!Component || !source)
    throw new Error(`Public example module unavailable: ${example.module}`);
  return { ...example, Component, source };
});

export function getPublicExample(component: string, story: string) {
  return publicExamples.find(
    (example) => example.component === component && example.story === story,
  );
}
