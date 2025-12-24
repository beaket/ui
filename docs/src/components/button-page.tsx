import { AllSizes, AllStates, AllVariants } from "@/components/button/button.stories";

function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex items-center justify-center border border-[var(--chrome)] bg-white p-6">
      {children}
    </div>
  );
}

export function ButtonPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Button</h1>
      <p className="mb-6 text-[var(--steel)]">Clickable button with multiple variants and sizes.</p>

      <pre className="mb-8 border border-[var(--chrome)] bg-[var(--frost)] p-3 font-mono text-sm">
        npx @beaket/ui add button
      </pre>

      <h2 className="mb-2 border-b border-[var(--chrome)] pb-1 text-base font-medium">Variants</h2>
      <Preview>
        <AllVariants />
      </Preview>

      <h2 className="mt-8 mb-2 border-b border-[var(--chrome)] pb-1 text-base font-medium">
        Sizes
      </h2>
      <Preview>
        <AllSizes />
      </Preview>

      <h2 className="mt-8 mb-2 border-b border-[var(--chrome)] pb-1 text-base font-medium">
        States
      </h2>
      <Preview>
        <AllStates />
      </Preview>
    </div>
  );
}
