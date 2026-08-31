import { Button } from "@/components/button";
import type { ReactNode } from "react";

function StateCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-fg-subtle text-xs">{label}</span>
    </div>
  );
}

function StateRow({
  variant,
  pressedClassName,
}: {
  variant: "primary" | "outline";
  pressedClassName: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-fg-muted text-sm font-medium">{variant}</span>
      <div className="flex flex-wrap items-start gap-6">
        <StateCell label="Rest">
          <Button variant={variant}>Button</Button>
        </StateCell>
        <StateCell label="Held-open">
          <Button variant={variant} data-state="open">
            Button
          </Button>
        </StateCell>
        <StateCell label="Pressed">
          <Button
            variant={variant}
            className={pressedClassName}
            style={{ boxShadow: "none", transform: "translate(1px, 1px)" }}
          >
            Button
          </Button>
        </StateCell>
        <StateCell label="Disabled">
          <Button variant={variant} disabled>
            Button
          </Button>
        </StateCell>
        <StateCell label="Loading">
          <Button variant={variant} loading>
            Button
          </Button>
        </StateCell>
      </div>
    </div>
  );
}

export default function AllStatesExample() {
  return (
    <div className="flex flex-col gap-8">
      <StateRow variant="primary" pressedClassName="bg-bg-emphasis-active" />
      <StateRow variant="outline" pressedClassName="bg-bg-active" />
    </div>
  );
}
