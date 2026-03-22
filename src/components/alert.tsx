import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { AlertCircle, AlertTriangle, Info, Lightbulb, Shield } from "lucide-react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const alertVariants = cva(
  "relative w-full border px-4 py-3 text-sm grid grid-cols-[calc(var(--spacing)*4)_1fr] gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        note: "bg-surface-1 text-ink border-signal-blue [&>svg]:text-signal-blue [&_[data-slot=alert-description]]:text-steel",
        tip: "bg-surface-1 text-ink border-signal-green [&>svg]:text-signal-green [&_[data-slot=alert-description]]:text-steel",
        important:
          "bg-surface-1 text-ink border-signal-purple [&>svg]:text-signal-purple [&_[data-slot=alert-description]]:text-steel",
        warning:
          "bg-surface-1 text-ink border-signal-amber [&>svg]:text-signal-amber [&_[data-slot=alert-description]]:text-steel",
        caution:
          "bg-surface-1 text-ink border-signal-red [&>svg]:text-signal-red [&_[data-slot=alert-description]]:text-steel",
      },
    },
    defaultVariants: {
      variant: "note",
    },
  },
);

const variantIcons = {
  note: Info,
  tip: Lightbulb,
  important: Shield,
  warning: AlertTriangle,
  caution: AlertCircle,
} as const;

const variantTitles = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
} as const;

interface AlertProps
  extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof alertVariants> {
  /** note | tip | important | warning | caution. Semantic variant that controls color and icon */
  variant?: "note" | "tip" | "important" | "warning" | "caution";
  /**
   * Title text for the alert. If not provided, displays the variant name capitalized.
   */
  title?: string;
}

export function Alert({ className, variant = "note", title, children, ...props }: AlertProps) {
  const Icon = variantIcons[variant!];
  const displayTitle = title || variantTitles[variant!];

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      <div data-slot="alert-title" className="col-start-2 min-h-4 font-medium tracking-tight">
        {displayTitle}
      </div>
      {children && (
        <div data-slot="alert-description" className="col-start-2 text-sm [&_p]:leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
