import { StoryPreview } from "./story-preview";

interface ComponentData {
  name: string;
  docs: {
    title: string;
    previewStory: string;
  };
}

interface ComponentShowcaseProps {
  components: ComponentData[];
}

export function ComponentShowcase({ components }: ComponentShowcaseProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Branding Card */}
      <a
        href="/ui/installation"
        className="bg-[var(--paper)] p-4 no-underline transition-colors outline-none hover:bg-[#858585]"
      >
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="m-0 text-sm font-semibold tracking-wide text-[var(--ink)] uppercase">
              Beaket UI
            </h1>
            <p className="m-0 mt-1 text-xs text-[var(--steel)]">
              Brutalist React components.
              <br />
              Copy to your project.
            </p>
          </div>
          <div className="mt-4 text-xs text-[var(--steel)]">→ Get Started</div>
        </div>
      </a>

      {/* Component Cards */}
      {components.map((component) => (
        <a
          key={component.name}
          href={`/ui/components/${component.name}`}
          className="bg-[var(--paper)] p-4 no-underline transition-colors outline-none hover:bg-[#858585]"
        >
          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink)] uppercase">
              {component.docs.title}
            </div>
            <div className="flex min-h-[60px] items-center">
              <StoryPreview
                componentName={component.name}
                storyName={component.docs.previewStory}
              />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
