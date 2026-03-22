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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Branding Card */}
      <a
        href="/ui/installation"
        data-slot="branding-card"
        className="shadow-offset hover:shadow-offset-hover active:shadow-offset-active border-ink bg-paper flex flex-col justify-between border-2 p-4 no-underline transition-shadow outline-none"
      >
        <div>
          <div>
            <span className="text-ink text-sm font-bold tracking-wide uppercase">Beaket UI</span>
            <span className="text-steel ml-1.5 text-[10px]">v{version}</span>
          </div>
          <p className="text-steel m-0 mt-3 text-xs">
            Brutalist React components.
            <br />
            Copy to your project.
          </p>
        </div>
        <div className="bg-branch text-paper mt-4 inline-block px-3 py-1.5 text-xs font-bold">
          → Get Started
        </div>
      </a>

      {/* Component Cards */}
      {components.map((component) => {
        const span = component.docs.span ?? 1;
        const spanClass = span === 3 ? "col-span-full" : span === 2 ? "sm:col-span-2" : "";
        return (
          <div key={component.name} className={`bg-paper p-4 ${spanClass}`}>
            <a
              data-slot="component-link"
              href={`/ui/components/${component.name}`}
              className="text-ink hover:decoration-ink inline text-xs font-semibold tracking-wide uppercase underline decoration-transparent underline-offset-2 outline-none"
            >
              {component.docs.title} →
            </a>
            <div className="mt-3 [&_[data-slot=input-wrapper]]:w-full [&_[data-slot=input]]:w-full [&_[data-slot=select]]:w-full [&_ul]:justify-start [&>*]:m-0">
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
