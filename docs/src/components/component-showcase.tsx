import { StoryPreview, needsSizedStage } from "./story-preview";

interface ComponentData {
  name: string;
  description: string;
  docs: {
    title: string;
    tagline?: string;
    previewStory: string;
  };
}

interface ComponentShowcaseProps {
  components: ComponentData[];
}

/**
 * The set grouped by the job a part does rather than by its initial letter.
 * Editorial grouping lives here and not in `registry.json`: it describes this
 * site's reading order, not the CLI's contract.
 */
const GROUPS: { title: string; blurb: string; names: string[] }[] = [
  {
    title: "Form",
    blurb: "Everything a person types, picks, or toggles.",
    names: [
      "button",
      "input",
      "textarea",
      "select",
      "checkbox",
      "radio",
      "switch",
      "slider",
      "label",
      "field",
    ],
  },
  {
    title: "Feedback",
    blurb: "What the interface says back.",
    names: ["alert", "badge", "progress", "skeleton", "tooltip", "navigation-progress"],
  },
  {
    title: "Navigation",
    blurb: "Moving between places, and knowing where you are.",
    names: ["navigation", "breadcrumb", "tabs", "pagination", "dropdown-menu"],
  },
  {
    title: "Surface",
    blurb: "The sheets that content sits on.",
    names: ["card", "separator", "blockquote", "avatar"],
  },
  {
    title: "Data",
    blurb: "Rows, columns, and the controls over them.",
    names: ["table", "data-table"],
  },
  { title: "Overlay", blurb: "Layers that float above the page.", names: ["dialog", "sheet"] },
];

/** Parts that need the whole measure; a column would cut them. */
const WIDE = new Set(["table", "data-table"]);

/**
 * Which example makes the best single specimen. `previewStory` is often a
 * multi-state demonstration written for a full-width docs page; in a gallery
 * the part itself should lead. Only the overrides are listed — everything else
 * shows its registry preview.
 */
const GALLERY_STORY: Record<string, string> = {
  alert: "Default",
  blockquote: "Default",
  breadcrumb: "Default",
  card: "Default",
  input: "Affixes",
  select: "Default",
  separator: "Default",
  switch: "OnOff",
  table: "Default",
  tabs: "Default",
  textarea: "Default",
};

/**
 * A specimen gallery: the parts at the size they ship, parted by shared seams,
 * with nothing between the reader and the thing itself. Server-rendered end to
 * end — `inert` keeps 29 decorative specimens out of the tab order.
 */
export function ComponentShowcase({ components }: ComponentShowcaseProps) {
  const byName = new Map(components.map((component) => [component.name, component]));

  return (
    <>
      {GROUPS.map((group) => (
        <section className="set" key={group.title}>
          <div className="set-head">
            <h2 id={group.title.toLowerCase()}>{group.title}</h2>
            <p>{group.blurb}</p>
            <span className="set-count">{group.names.length}</span>
          </div>

          {[
            { className: "gallery", names: group.names.filter((n) => !WIDE.has(n)) },
            { className: "gallery band", names: group.names.filter((n) => WIDE.has(n)) },
          ]
            .filter((band) => band.names.length > 0)
            .map((band) => (
              <div className={band.className} key={band.className}>
                {band.names.map((name) => {
                  const component = byName.get(name);
                  if (!component) return null;
                  const story = GALLERY_STORY[name] ?? component.docs.previewStory;
                  return (
                    // The link overlays the cell rather than wrapping it: a
                    // specimen contains its own links and buttons, and an <a>
                    // may not nest inside an <a> — the parser re-parents the
                    // outer one into the component's own markup.
                    <div key={name} className="cell">
                      <a
                        href={`/ui/components/${name}`}
                        className="cell-link"
                        aria-label={component.docs.title}
                      />
                      <span
                        className="specimen"
                        data-stage={needsSizedStage(name, story) ? "sized" : undefined}
                        inert
                      >
                        {name === "slider" ? (
                          // Radix hides the thumb until mount, and this gallery
                          // never mounts. A slider without its thumb is not a
                          // specimen of a slider.
                          <span className="relative flex min-h-11 w-full items-center">
                            <span className="border-border-strong bg-bg-input block h-2 w-full border">
                              <span className="bg-bg-emphasis block h-full w-2/5" />
                            </span>
                            <span
                              data-slot="slider-specimen-thumb"
                              className="border-border-strong bg-bg-input absolute left-2/5 size-5 -translate-x-1/2 border"
                            />
                          </span>
                        ) : (
                          <StoryPreview componentName={name} storyName={story} />
                        )}
                      </span>
                      <span className="cell-name">{component.docs.title}</span>
                    </div>
                  );
                })}
              </div>
            ))}
        </section>
      ))}
    </>
  );
}
