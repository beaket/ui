import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

interface StoryMeta {
  component: ComponentType;
}

interface StoryObj {
  args?: Record<string, unknown>;
  render?: () => React.ReactNode;
  play?: unknown;
}

// Dynamic import - each story file loaded on demand
const storyModules = import.meta.glob<Record<string, unknown>>(
  "../../../src/components/*.stories.tsx",
);

interface StoryPreviewProps {
  componentName: string;
  storyName?: string;
  eager?: boolean;
}

export function StoryPreview({
  componentName,
  storyName = "Default",
  eager = false,
}: StoryPreviewProps) {
  const [Story, setStory] = useState<{
    Component: ComponentType | null;
    args?: Record<string, unknown>;
    isComposition: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(eager);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!isVisible) return;

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
          setStory({
            Component: story as ComponentType,
            isComposition: true,
          });
        } else if (typeof story === "object" && story !== null) {
          const storyObj = story as StoryObj;
          if (storyObj.render) {
            setStory({
              Component: storyObj.render as ComponentType,
              isComposition: true,
            });
          } else {
            setStory({
              Component: meta?.component ?? null,
              args: storyObj.args,
              isComposition: false,
            });
          }
        }
      } catch (e) {
        setError(`Failed to load story: ${e}`);
      }
    };

    loadStory();
  }, [isVisible, componentName, storyName]);

  if (error) {
    return <span className="text-[var(--steel)]">{error}</span>;
  }

  if (!Story) {
    return <div ref={containerRef} />;
  }

  const { Component, args, isComposition } = Story;
  if (!Component) {
    return <span className="text-[var(--steel)]">—</span>;
  }

  return isComposition ? <Component /> : <Component {...args} />;
}
