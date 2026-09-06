import { type ClassValue, clsx } from "clsx";
import { AlertCircle, AlertTriangle, Info, Lightbulb, Shield } from "lucide-react";
import { Children, isValidElement } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const alertBase =
  "relative w-full border px-4 py-3 text-sm grid grid-cols-[calc(var(--spacing)*4)_1fr] gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5";

const variantClasses = {
  note: "bg-bg-raised text-fg border-info-solid [&>svg]:text-info-solid [&_[data-slot=alert-description]]:text-fg-muted",
  tip: "bg-bg-raised text-fg border-success-solid [&>svg]:text-success-solid [&_[data-slot=alert-description]]:text-fg-muted",
  important:
    "bg-bg-raised text-fg border-accent-solid [&>svg]:text-accent-solid [&_[data-slot=alert-description]]:text-fg-muted",
  warning:
    "bg-bg-raised text-fg border-warning-fg [&>svg]:text-warning-fg [&_[data-slot=alert-description]]:text-fg-muted",
  caution:
    "bg-bg-raised text-fg border-danger-solid [&>svg]:text-danger-solid [&_[data-slot=alert-description]]:text-fg-muted",
} as const;

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

export interface AlertProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** note | tip | important | warning | caution. Semantic variant that controls color and icon */
  variant?: "note" | "tip" | "important" | "warning" | "caution";
  /**
   * Title text for the alert. If not provided, displays the variant name capitalized.
   */
  title?: string;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

// Namespacing, not context (§1.3): the parts share no state, so a provider
// would be pure machinery. The variant icon stays on the root, where the
// variant lives.
//
// The root has to tell the two paths apart because `children` used to mean
// "the description". Parts must be direct children — a fragment or a wrapper
// component around them reads as description content, which is what it looked
// like before this change.
function hasParts(children: React.ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement(child) && (child.type === AlertTitle || child.type === AlertDescription),
  );
}

function AlertRoot({ className, variant = "note", title, children, ...props }: AlertProps) {
  const Icon = variantIcons[variant];
  const composed = hasParts(children);

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertBase, variantClasses[variant], className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      {composed ? (
        <>
          {/* An explicit `title` still renders; the variant-name default does
              not, because the consumer's own Alert.Title is the title. */}
          {title && <AlertTitle>{title}</AlertTitle>}
          {children}
        </>
      ) : (
        <>
          {/* §2 sugar over the parts, byte-identical to the old output. */}
          <AlertTitle>{title || variantTitles[variant]}</AlertTitle>
          {children && <AlertDescription>{children}</AlertDescription>}
        </>
      )}
    </div>
  );
}

export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
});
