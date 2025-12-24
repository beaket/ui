import { Button } from "@/components/button";

export function ComponentCard() {
  return (
    <a
      href="/ui/components/button"
      className="block border border-[var(--chrome)] no-underline transition-colors hover:border-[var(--steel)]"
    >
      <div className="flex items-center justify-center bg-white p-6">
        <Button>Button</Button>
      </div>
      <div className="border-t border-[var(--chrome)] bg-[var(--frost)] px-4 py-3">
        <div className="font-medium text-[var(--ink)]">Button</div>
        <div className="text-sm text-[var(--steel)]">Multiple variants and sizes</div>
      </div>
    </a>
  );
}
