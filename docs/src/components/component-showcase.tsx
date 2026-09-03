import { Button } from "../../../src/components/button";
import { StoryPreview } from "./story-preview";

interface ComponentData {
  name: string;
  docs: {
    title: string;
    previewStory: string;
    span?: number;
    lgSpan?: number;
    rowSpan?: number;
  };
}

interface ComponentShowcaseProps {
  components: ComponentData[];
}

const interactiveSelector =
  "a, button, input, select, textarea, label, [role=button], [role=checkbox], [role=combobox], [role=menuitem], [role=radio], [role=switch], [role=tab]";

export function ComponentShowcase({ components }: ComponentShowcaseProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{ gridAutoRows: "190px", gridAutoFlow: "dense" }}
    >
      {/* Branding Card */}
      <div
        data-slot="branding-card"
        className="border-border-strong bg-bg-emphasis flex flex-col justify-between border p-4 sm:col-span-2"
      >
        <div>
          <div>
            <span className="text-fg-on-emphasis text-sm font-bold tracking-wide uppercase">
              Beaket UI
            </span>
          </div>
          <p className="!text-fg-on-emphasis m-0 mt-3 text-sm leading-relaxed">
            A tactile, copy-paste UI system for thoughtful web interfaces.
          </p>
        </div>
        <Button asChild variant="secondary" size="lg" className="mt-4 self-start">
          <a href="/ui/installation">Get Started →</a>
        </Button>
      </div>

      {/* Component Cards */}
      {components.map((component) => {
        const colSpan = component.docs.span ?? 1;
        const rowSpan = component.docs.rowSpan ?? 1;
        const colClass =
          colSpan === 4
            ? "col-span-full"
            : component.docs.lgSpan === 1 && colSpan === 2
              ? "sm:col-span-2 lg:col-span-1 xl:col-span-2"
              : colSpan === 3
                ? "col-span-full xl:col-span-3"
                : colSpan === 2
                  ? "sm:col-span-2"
                  : "";
        const overflowClass =
          component.name === "data-table" ? "overflow-visible" : "overflow-hidden";
        const positionClass =
          component.name === "skeleton"
            ? "lg:!col-start-1 xl:!col-start-1"
            : component.name === "sheet"
              ? "xl:!col-start-1"
              : component.name === "pagination"
                ? "xl:!col-start-2"
                : "";
        const responsiveClass = component.name === "sheet" ? "sm:col-span-2 lg:col-span-1" : "";
        return (
          <div
            key={component.name}
            role="link"
            tabIndex={0}
            aria-label={`View ${component.docs.title} details`}
            className={`border-border bg-bg-raised hover:border-border-strong focus-visible:outline-border-focus flex cursor-pointer flex-col border p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ${colClass} ${responsiveClass} ${positionClass}`}
            style={rowSpan > 1 ? { gridRow: `span ${rowSpan}` } : undefined}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest(interactiveSelector)) return;
              window.location.assign(`/ui/components/${component.name}`);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget || event.key !== "Enter") return;
              window.location.assign(`/ui/components/${component.name}`);
            }}
          >
            <div
              className={`-m-1 min-h-0 flex-1 p-1 ${overflowClass} [&_[data-slot=input-wrapper]]:w-full [&_[data-slot=input]]:w-full [&_[data-slot=select]]:w-full [&_ul]:justify-start [&>*]:m-0`}
            >
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
