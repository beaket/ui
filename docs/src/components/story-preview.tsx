import { getPublicExample } from "../../../src/examples/registry";

interface StoryPreviewProps {
  componentName: string;
  storyName?: string;
}

/**
 * Server-only public-example boundary. Do not add a client directive here:
 * static React examples are useful HTML, not islands. Interactive examples use
 * InteractiveExample instead so Storybook files can never enter public output.
 */
export function StoryPreview({ componentName, storyName = "Default" }: StoryPreviewProps) {
  const example = getPublicExample(componentName, storyName);

  if (!example) return null;

  const Example = example.Component;
  return <Example />;
}

/**
 * Whether an example sizes itself against its container (`h-full`). Those need
 * a stage with a height; the rest must keep their intrinsic size, because a
 * stretched flex root stretches every part inside it.
 */
export function needsSizedStage(componentName: string, storyName = "Default"): boolean {
  return /\bh-full\b/.test(getPublicExample(componentName, storyName)?.source ?? "");
}

/**
 * Rewrite an example's imports to the path a consumer actually has. The
 * examples live in this repository and import components by relative path (or
 * by this repo's own `@` alias); after `add`, the same component sits at
 * `@/components/ui/<name>`. Showing the repository's path would hand readers
 * an import that cannot resolve in their project.
 */
export function asConsumerSource(source: string): string {
  return source.replace(
    /from "(?:(?:\.\.\/)+|@\/)components\/([a-z0-9-]+)"/g,
    'from "@/components/ui/$1"',
  );
}
