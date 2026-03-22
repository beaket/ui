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
          <div className="flex items-center gap-1.5">
            <svg
              className="size-[18px] shrink-0"
              viewBox="0 0 500 500"
              fill="none"
              style={{ color: "var(--branch)" }}
            >
              <path
                d="M250 281.6C267.452 281.6 281.6 267.452 281.6 250C281.6 232.548 267.452 218.4 250 218.4C232.548 218.4 218.4 232.548 218.4 250C218.4 267.452 232.548 281.6 250 281.6Z"
                fill="currentColor"
              />
              <path
                d="M250 179.267C274.303 179.267 294.005 159.566 294.005 135.262C294.005 110.959 274.303 91.2574 250 91.2574C225.697 91.2574 205.995 110.959 205.995 135.262C205.995 159.566 225.697 179.267 250 179.267Z"
                fill="currentColor"
              />
              <path
                d="M317.743 228.605C325.515 251.463 350.34 263.699 373.193 255.933C396.046 248.168 408.272 223.342 400.501 200.484C392.729 177.625 367.904 165.39 345.051 173.155C322.198 180.92 309.972 205.746 317.743 228.605Z"
                fill="currentColor"
              />
              <path
                d="M291.555 307.244C271.905 321.54 267.564 349.06 281.86 368.71C296.157 388.361 323.676 392.701 343.327 378.405C362.977 364.109 367.318 336.59 353.021 316.939C338.725 297.288 311.206 292.948 291.555 307.244Z"
                fill="currentColor"
              />
              <path
                d="M208.445 307.244C188.794 292.948 161.275 297.288 146.979 316.939C132.682 336.589 137.023 364.109 156.673 378.405C176.324 392.701 203.843 388.361 218.14 368.71C232.436 349.06 228.095 321.54 208.445 307.244Z"
                fill="currentColor"
              />
              <path
                d="M182.257 228.605C190.028 205.746 177.802 180.92 154.949 173.155C132.096 165.39 107.271 177.625 99.4996 200.484C91.7285 223.342 103.955 248.168 126.807 255.933C149.66 263.699 174.486 251.463 182.257 228.605Z"
                fill="currentColor"
              />
              <path
                d="M280.045 208.624L369.699 118.493L359.225 99.6866L338.115 95.514L280.045 208.624Z"
                fill="currentColor"
              />
              <path
                d="M298.183 266.354L412.909 323.274L427.161 306.865L424.087 285.014L298.183 266.354Z"
                fill="currentColor"
              />
              <path
                d="M250.479 301.262L230.532 426.521L249.521 435.679L268.64 426.78L250.479 301.262Z"
                fill="currentColor"
              />
              <path
                d="M201.466 265.918L75.8661 285.827L73.1899 307.301L87.7451 323.215L201.466 265.918Z"
                fill="currentColor"
              />
              <path
                d="M219.62 209.019L162.51 95.567L141.11 99.2915L130.256 117.756L219.62 209.019Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-ink text-sm font-bold tracking-wide uppercase">Beaket UI</span>
            <span className="text-steel text-[10px]">v{version}</span>
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
