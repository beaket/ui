import { useEffect, useMemo, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import propsData from "../generated/props.json";
import { getDefaultStory, getStoriesForComponent, type LoadedStory } from "../utils/story-loader";

// Lazy-load highlighter
let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["gruvbox-dark-soft"],
      langs: ["tsx", "bash"],
    });
  }
  return highlighterPromise;
}

interface ComponentData {
  name: string;
  description: string;
  docs?: {
    title?: string;
    tagline?: string;
    sections?: string[];
    usage?: string;
  };
}

interface ComponentPageProps {
  component: ComponentData;
}

export function ComponentPage({ component }: ComponentPageProps) {
  const { name, docs } = component;
  const sections = docs?.sections ?? [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stories = useMemo(() => getStoriesForComponent(name), [name]);
  const defaultStory = useMemo(() => getDefaultStory(name), [name]);
  const props = propsData[name as keyof typeof propsData] ?? [];

  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const usageCode = `import { ${pascalName} } from "@beaket/ui/${name}"

${docs?.usage ?? `<${pascalName} />`}`;

  return (
    <div>
      {/* Title + Preview */}
      <header>
        <h1>{docs?.title ?? name}</h1>
        <p className="tagline">{docs?.tagline ?? component.description}</p>
        {mounted && defaultStory && (
          <Preview>
            <StoryRenderer story={defaultStory} />
          </Preview>
        )}
      </header>

      {/* Install */}
      <section>
        <h2>Install</h2>
        <CodeBlock lang="bash">{`npx @beaket/ui add ${name}`}</CodeBlock>
      </section>

      {/* Usage */}
      <section>
        <h2>Usage</h2>
        <CodeBlock>{usageCode}</CodeBlock>
      </section>

      {/* Examples */}
      <section>
        <h2>Examples</h2>
        <div className="space-y-4">
          {mounted &&
            sections.map((sectionName) => {
              const story = stories.get(sectionName);
              if (!story) return null;
              return <ExampleSection key={sectionName} story={story} />;
            })}
        </div>
      </section>

      {/* Props */}
      <section>
        <h2>Props</h2>
        <PropsTable props={props} />
      </section>
    </div>
  );
}

function Preview({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 border border-[var(--chrome)] bg-white p-4">{children}</div>;
}

function CodeBlock({ children, lang = "tsx" }: { children: string; lang?: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    getHighlighter().then((highlighter) => {
      setHtml(highlighter.codeToHtml(children, { lang, theme: "gruvbox-dark-soft" }));
    });
  }, [children, lang]);

  if (html) {
    return (
      <div
        className="overflow-x-auto font-mono text-[13px] [&_pre]:p-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <pre className="overflow-x-auto bg-[#32302f] p-3 font-mono text-[13px] text-[#ebdbb2]">
      <code>{children}</code>
    </pre>
  );
}

function StoryRenderer({ story }: { story: LoadedStory }) {
  const { component: Component, args, isComposition } = story;
  if (!Component) return <span className="text-[var(--steel)]">—</span>;
  return isComposition ? <Component /> : <Component {...args} />;
}

function ExampleSection({ story }: { story: LoadedStory }) {
  return (
    <div>
      <h3>{story.displayName}</h3>
      <Preview>
        <StoryRenderer story={story} />
      </Preview>
      {story.source && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs tracking-wide text-[var(--steel)] uppercase">
            Code
          </summary>
          <CodeBlock>{story.source}</CodeBlock>
        </details>
      )}
    </div>
  );
}

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

function PropsTable({ props }: { props: PropInfo[] }) {
  if (!props.length) return <p className="text-sm text-[var(--steel)]">—</p>;

  return (
    <table className="w-full font-mono text-xs">
      <thead>
        <tr className="border-b border-[var(--chrome)] text-left tracking-wide text-[var(--steel)] uppercase">
          <th className="py-1.5 pr-3 font-medium">Name</th>
          <th className="py-1.5 pr-3 font-medium">Type</th>
          <th className="py-1.5 pr-3 font-medium">Default</th>
          <th className="py-1.5 font-medium">Description</th>
        </tr>
      </thead>
      <tbody className="text-[13px]">
        {props.map((p) => (
          <tr key={p.name} className="border-b border-[var(--chrome)]">
            <td className="py-1.5 pr-3">
              {p.name}
              {p.required && <span className="text-[var(--signal-red)]">*</span>}
            </td>
            <td className="py-1.5 pr-3 text-[var(--steel)]">{p.type}</td>
            <td className="py-1.5 pr-3">{p.defaultValue ?? "—"}</td>
            <td className="py-1.5 font-sans text-[var(--steel)]">{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
