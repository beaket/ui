import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { getPublicExample } from "../../../src/examples/registry";

interface StoryMeta {
  component: ComponentType;
}

interface StoryObj {
  args?: Record<string, unknown>;
  render?: () => React.ReactNode;
  play?: unknown;
}

// Compatibility-only path for components that have not moved to src/examples yet.
const legacyStoryModules = import.meta.glob<Record<string, unknown>>(
  "../../../src/components/*.stories.tsx",
);

interface StoryPreviewProps {
  componentName: string;
  storyName?: string;
}

export function StoryPreview({ componentName, storyName = "Default" }: StoryPreviewProps) {
  const example = getPublicExample(componentName, storyName);

  if (example) {
    const Example = example.Component;
    return <Example />;
  }

  return <LegacyStoryPreview componentName={componentName} storyName={storyName} />;
}

function LegacyStoryPreview({ componentName, storyName }: Required<StoryPreviewProps>) {
  const [story, setStory] = useState<{
    Component: ComponentType | null;
    args?: Record<string, unknown>;
    isComposition: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const path = Object.keys(legacyStoryModules).find((candidate) =>
      candidate.includes(`/${componentName}.stories.tsx`),
    );

    if (!path) {
      setError(`Story file not found: ${componentName}`);
      return;
    }

    void legacyStoryModules[path]()
      .then((mod) => {
        const meta = mod.default as StoryMeta | undefined;
        const exportedStory = mod[storyName];

        if (!exportedStory) {
          setError(`Story not found: ${storyName}`);
          return;
        }

        if (typeof exportedStory === "function") {
          setStory({ Component: exportedStory as ComponentType, isComposition: true });
          return;
        }

        if (typeof exportedStory === "object" && exportedStory !== null) {
          const storyObject = exportedStory as StoryObj;
          setStory({
            Component: storyObject.render ?? meta?.component ?? null,
            args: storyObject.args,
            isComposition: Boolean(storyObject.render),
          });
        }
      })
      .catch((cause: unknown) => setError(`Failed to load story: ${cause}`));
  }, [componentName, storyName]);

  if (error) {
    return <span className="text-[var(--color-fg-muted)]">{error}</span>;
  }

  if (!story) return <div aria-busy="true" className="min-h-8" />;
  if (!story.Component) return <span className="text-[var(--color-fg-muted)]">—</span>;

  const Component = story.Component;
  return story.isComposition ? <Component /> : <Component {...story.args} />;
}
