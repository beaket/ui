import type { ComponentType } from "react";
import { extractExports, formatExportName } from "./story-parser";

// Import all story modules (for rendering)
// Path is relative from docs/ since that's where Vite resolves from
const storyModules = import.meta.glob<Record<string, unknown>>(
  "../../../src/components/*.stories.tsx",
  { eager: true },
);

// Import all story sources (for code display)
const storySources = import.meta.glob<string>("../../../src/components/*.stories.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

export interface LoadedStory {
  name: string;
  displayName: string;
  component: ComponentType | null;
  args?: Record<string, unknown>;
  source: string;
  isComposition: boolean;
}

interface StoryMeta {
  component: ComponentType;
  title?: string;
}

interface StoryObj {
  args?: Record<string, unknown>;
  play?: unknown;
}

/**
 * Get all stories for a component by name.
 */
export function getStoriesForComponent(componentName: string): Map<string, LoadedStory> {
  const storyPath = Object.keys(storyModules).find((path) =>
    path.includes(`/${componentName}.stories.tsx`),
  );

  if (!storyPath) return new Map();

  const module = storyModules[storyPath];
  const source = storySources[storyPath];
  const parsedSources = extractExports(source);
  const meta = module.default as StoryMeta | undefined;

  const stories = new Map<string, LoadedStory>();

  for (const [exportName, exportValue] of Object.entries(module)) {
    if (exportName === "default") continue;

    const storySource = parsedSources.get(exportName) ?? "";
    const displayName = formatExportName(exportName);

    if (typeof exportValue === "function") {
      // Composition component (e.g., AllVariants = () => ...)
      stories.set(exportName, {
        name: exportName,
        displayName,
        component: exportValue as ComponentType,
        source: storySource,
        isComposition: true,
      });
    } else if (typeof exportValue === "object" && exportValue !== null) {
      // StoryObj (e.g., Default: Story = { args: {...} })
      const storyObj = exportValue as StoryObj;

      // Skip interaction test stories (those with play function)
      if (storyObj.play) continue;

      stories.set(exportName, {
        name: exportName,
        displayName,
        component: meta?.component ?? null,
        args: storyObj.args,
        source: storySource,
        isComposition: false,
      });
    }
  }

  return stories;
}

/**
 * Get a specific story by component name and story name.
 */
export function getStory(componentName: string, storyName: string): LoadedStory | undefined {
  const stories = getStoriesForComponent(componentName);
  return stories.get(storyName);
}

/**
 * Get the Default story for preview.
 * Falls back to first non-composition story if "Default" doesn't exist.
 */
export function getDefaultStory(componentName: string): LoadedStory | undefined {
  const stories = getStoriesForComponent(componentName);

  // Try "Default" first
  if (stories.has("Default")) {
    return stories.get("Default");
  }

  // Fallback to first non-composition story
  for (const story of stories.values()) {
    if (!story.isComposition) {
      return story;
    }
  }

  return undefined;
}
