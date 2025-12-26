import { AllSizes, AllVariants, AllStates as ButtonAllStates } from "@/components/button.stories";
import { AllStates as CheckboxAllStates } from "@/components/checkbox.stories";

// Map section names to their components
const sectionComponents: Record<string, Record<string, React.ComponentType>> = {
  button: {
    AllVariants,
    AllSizes,
    AllStates: ButtonAllStates,
  },
  checkbox: {
    AllStates: CheckboxAllStates,
  },
};

interface ComponentData {
  name: string;
  description: string;
  docs?: {
    title?: string;
    tagline?: string;
    sections?: string[];
  };
}

interface ComponentPageProps {
  component: ComponentData;
}

function formatSectionName(name: string): string {
  return name.replace(/^All/, "");
}

export function ComponentPage({ component }: ComponentPageProps) {
  const { name, docs } = component;
  const sections = docs?.sections ?? [];
  const componentSections = sectionComponents[name] ?? {};

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{docs?.title ?? name}</h1>
      <p className="mb-6 text-[var(--steel)]">{docs?.tagline ?? component.description}</p>

      <pre className="mb-8 border border-[var(--chrome)] bg-[var(--frost)] p-3 font-mono text-sm">
        npx @beaket/ui add {name}
      </pre>

      {sections.map((sectionName) => {
        const SectionComponent = componentSections[sectionName];
        return (
          <div key={sectionName}>
            <h2 className="mt-8 mb-2 border-b border-[var(--chrome)] pb-1 text-base font-medium">
              {formatSectionName(sectionName)}
            </h2>
            <div className="my-4 flex items-center justify-center border border-[var(--chrome)] bg-white p-6">
              {SectionComponent ? (
                <SectionComponent />
              ) : (
                <p className="text-[var(--steel)]">Section not found</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
