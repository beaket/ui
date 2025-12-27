import type { ComponentType } from "react";
import { useEffect, useState } from "react";

interface StoryMeta {
  component: ComponentType;
}

interface StoryObj {
  args?: Record<string, unknown>;
  play?: unknown;
}

// Dynamic import - each story file loaded on demand
const storyModules = import.meta.glob<Record<string, unknown>>(
  "../../../src/components/*.stories.tsx",
);

interface StoryPreviewProps {
  componentName: string;
  storyName?: string;
}

export function StoryPreview({ componentName, storyName = "Default" }: StoryPreviewProps) {
  const [Story, setStory] = useState<{
    Component: ComponentType | null;
    args?: Record<string, unknown>;
    isComposition: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      const path = Object.keys(storyModules).find((p) =>
        p.includes(`/${componentName}.stories.tsx`),
      );

      if (!path) {
        setError(`Story file not found: ${componentName}`);
        return;
      }

      try {
        const mod = await storyModules[path]();
        const meta = mod.default as StoryMeta | undefined;
        const story = mod[storyName];

        if (!story) {
          setError(`Story not found: ${storyName}`);
          return;
        }

        if (typeof story === "function") {
          // Composition component
          setStory({
            Component: story as ComponentType,
            isComposition: true,
          });
        } else if (typeof story === "object" && story !== null) {
          // StoryObj
          const storyObj = story as StoryObj;
          setStory({
            Component: meta?.component ?? null,
            args: storyObj.args,
            isComposition: false,
          });
        }
      } catch (e) {
        setError(`Failed to load story: ${e}`);
      }
    };

    loadStory();
  }, [componentName, storyName]);

  if (error) {
    return <span className="text-[var(--steel)]">{error}</span>;
  }

  if (!Story) {
    return <span className="text-[var(--steel)]">Loading...</span>;
  }

  const { Component, args, isComposition } = Story;
  if (!Component) {
    return <span className="text-[var(--steel)]">—</span>;
  }

  return isComposition ? <Component /> : <Component {...args} />;
}
