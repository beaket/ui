import { StoryPreview } from "./story-preview";

interface ComponentData {
  name: string;
  docs: {
    title: string;
    previewStory: string;
    span?: number;
  };
}

interface ComponentShowcaseProps {
  components: ComponentData[];
  version: string;
}

export function ComponentShowcase({ components, version }: ComponentShowcaseProps) {
  return (
    <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Branding Card */}
      <a
        href="/ui/installation"
        className="bg-[var(--paper)] p-4 no-underline transition-colors outline-none hover:bg-[var(--frost)]"
      >
        <h1 className="m-0 flex items-baseline gap-2 text-sm font-semibold tracking-wide text-[var(--ink)] uppercase">
          Beaket UI
          <span className="text-[10px] font-normal text-[var(--steel)] normal-case">
            v{version}
          </span>
        </h1>
        <p className="m-0 mt-1 text-xs text-[var(--steel)]">
          Brutalist React components.
          <br />
          Copy to your project.
        </p>
        <div className="mt-4 text-xs text-[var(--steel)]">→ Get Started</div>
      </a>

      {/* Component Cards */}
      {components.map((component) => {
        const span = component.docs.span ?? 1;
        const spanClass = span === 3 ? "col-span-full" : span === 2 ? "sm:col-span-2" : "";
        return (
          <div key={component.name} className={`bg-[var(--paper)] p-4 ${spanClass}`}>
            <a
              href={`/ui/components/${component.name}`}
              className="mb-3 block text-xs font-semibold tracking-wide text-[var(--ink)] uppercase no-underline outline-none hover:bg-[var(--frost)]"
            >
              {component.docs.title} →
            </a>
            <div>
              <StoryPreview
                componentName={component.name}
                storyName={component.docs.previewStory}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
