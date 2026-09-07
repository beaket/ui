import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  /** Task progress; null (the default) means indeterminate. This is not a meter. */
  value?: number | null;
}

function ProgressRoot({
  value = null,
  max = 100,
  className,
  style,
  children,
  ...props
}: ProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const current =
    value !== null && Number.isFinite(value) && value >= 0 && value <= limit ? value : null;
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={current}
      max={limit}
      className={cn(
        "border-border-strong bg-bg-input relative h-3 w-full overflow-hidden border",
        className,
      )}
      style={
        {
          "--progress-scale": current === null ? 1 : current / limit,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children ?? <ProgressIndicator />}
    </ProgressPrimitive.Root>
  );
}

export type ProgressIndicatorProps = React.ComponentProps<typeof ProgressPrimitive.Indicator>;

export function ProgressIndicator({ className, style, ...props }: ProgressIndicatorProps) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "bg-bg-emphasis h-full w-full origin-left transition-transform duration-150 rtl:origin-right",
        "data-[state=indeterminate]:animate-navigation-progress data-[state=indeterminate]:w-1/3 motion-reduce:animate-none motion-reduce:transition-none",
        className,
      )}
      style={{ transform: "scaleX(var(--progress-scale, 0))", ...style }}
      {...props}
    />
  );
}

export const Progress = Object.assign(ProgressRoot, { Indicator: ProgressIndicator });
