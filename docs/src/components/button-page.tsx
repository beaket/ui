import { AllVariants, AllSizes, AllStates } from "@/components/button/button.stories";

function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center p-6 border border-[var(--chrome)] bg-white my-4">
      {children}
    </div>
  );
}

export function ButtonPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Button</h1>
      <p className="text-[var(--steel)] mb-6">Clickable button with multiple variants and sizes.</p>

      <pre className="bg-[var(--frost)] border border-[var(--chrome)] p-3 text-sm font-mono mb-8">
        npx @beaket/ui add button
      </pre>

      <h2 className="text-base font-medium border-b border-[var(--chrome)] pb-1 mb-2">Variants</h2>
      <Preview><AllVariants /></Preview>

      <h2 className="text-base font-medium border-b border-[var(--chrome)] pb-1 mb-2 mt-8">Sizes</h2>
      <Preview><AllSizes /></Preview>

      <h2 className="text-base font-medium border-b border-[var(--chrome)] pb-1 mb-2 mt-8">States</h2>
      <Preview><AllStates /></Preview>
    </div>
  );
}
