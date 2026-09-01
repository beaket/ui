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
