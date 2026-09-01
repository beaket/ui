import { StoryPreview } from "./story-preview";

interface ComponentData {
  name: string;
  docs: {
    title: string;
    previewStory: string;
    span?: number;
    rowSpan?: number;
  };
}

interface ComponentShowcaseProps {
  components: ComponentData[];
  version: string;
}

export function ComponentShowcase({ components, version }: ComponentShowcaseProps) {
  // index.astro server-renders cards, links, and static previews; do not hydrate this grid.
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      style={{ gridAutoRows: "190px", gridAutoFlow: "dense" }}
    >
      {/* Branding Card */}
      <a
        href="/ui/installation"
        data-slot="branding-card"
        className="hover:shadow-offset-action border-border-strong bg-bg-emphasis hover:bg-bg-emphasis-hover focus-visible:outline-border-focus flex flex-col justify-between border p-4 no-underline transition-[box-shadow,translate,background-color] duration-100 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-x-px active:translate-y-px active:shadow-none"
      >
        <div>
          <div>
            <span className="text-fg-on-emphasis text-sm font-bold tracking-wide uppercase">
              Beaket UI
            </span>
            <span className="text-fg-on-emphasis/60 ml-1.5 text-[10px]">v{version}</span>
          </div>
          <p className="text-fg-on-emphasis/80 m-0 mt-3 text-sm leading-relaxed">
            A printed page you can press.
            <br />
            Copy-paste into your project.
          </p>
        </div>
        <div className="bg-bg text-fg mt-4 inline-block px-3 py-1.5 text-xs font-bold">
          → Get Started
        </div>
      </a>

      {/* Component Cards */}
      {components.map((component) => {
        const colSpan = component.docs.span ?? 1;
        const rowSpan = component.docs.rowSpan ?? 1;
        const colClass = colSpan === 3 ? "col-span-full" : colSpan === 2 ? "sm:col-span-2" : "";
        return (
          <div
            key={component.name}
            className={`border-border bg-bg-raised flex flex-col border p-4 ${colClass}`}
            style={rowSpan > 1 ? { gridRow: `span ${rowSpan}` } : undefined}
          >
            <a
              data-slot="component-link"
              href={`/ui/components/${component.name}`}
              className="text-fg hover:decoration-ink inline text-xs font-semibold tracking-wide uppercase underline decoration-transparent underline-offset-2 outline-none"
            >
              {component.docs.title} →
            </a>
            <div className="mt-3 min-h-0 flex-1 overflow-hidden [&_[data-slot=input-wrapper]]:w-full [&_[data-slot=input]]:w-full [&_[data-slot=select]]:w-full [&_ul]:justify-start [&>*]:m-0">
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
