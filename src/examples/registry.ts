import type { ComponentType } from "react";

/** A consumer-facing example module, paired with the source the docs display. */
export interface PublicExample {
  component: string;
  /** Compatibility key: the registry still names sections as CSF exports. */
  story: string;
  Component: ComponentType;
  source: string;
}

const components = import.meta.glob("./**/*.tsx", {
  eager: true,
  import: "default",
}) as Record<string, ComponentType>;

const sources = import.meta.glob("./**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

/** `AllVariants` → `all-variants`: a story's example lives in the file it names. */
const moduleFor = (component: string, story: string) =>
  `./${component}/${story.replace(/(?!^)(?=[A-Z])/g, "-").toLowerCase()}.tsx`;

export function getPublicExample(component: string, story: string): PublicExample | undefined {
  const path = moduleFor(component, story);
  const Component = components[path];
  if (!Component) return undefined;

  return { component, story, Component, source: sources[path] };
}

/** Every example module, for surfaces that show the whole system at once. */
export const allExamples = Object.entries(components)
  .map(([path, Component]) => {
    const [, component, name] = /^\.\/(.+)\/(.+)\.tsx$/.exec(path)!;
    return { component, name, Component };
  })
  .sort((a, b) => a.component.localeCompare(b.component) || a.name.localeCompare(b.name));
