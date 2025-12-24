import { Button } from "@/components/button";

export function ComponentCard() {
  return (
    <a href="/ui/components/button" className="block border border-[var(--chrome)] hover:border-[var(--steel)] transition-colors no-underline">
      <div className="p-6 flex items-center justify-center bg-white">
        <Button>Button</Button>
      </div>
      <div className="px-4 py-3 border-t border-[var(--chrome)] bg-[var(--frost)]">
        <div className="font-medium text-[var(--ink)]">Button</div>
        <div className="text-sm text-[var(--steel)]">Multiple variants and sizes</div>
      </div>
    </a>
  );
}
