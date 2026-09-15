import { type ClassValue, clsx } from "clsx";
import { AlertCircle, AlertTriangle, Info, Lightbulb, Shield } from "lucide-react";
import { Children, isValidElement } from "react";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const alertBase =
  "relative w-full border-l-2 px-4 py-3 text-sm grid grid-cols-[calc(var(--spacing)*4)_1fr] gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 bg-bg-raised text-fg [&_[data-slot=alert-description]]:text-fg-muted";

// Raised paper, never a tinted well, and no longer a box either: the role marks
// one 2px rule down the leading edge and colors the glyph, and nothing else.
// 2px because this is the same engagement mark the menu already draws on the
// row you are about to act on — a box around a notice repeated the surface's
// own boundary and made every alert shout at container weight. Warning borrows
// `warning-fg` because the ochre solid measures 2.13:1 on paper and cannot hold
// a rule on its own.
const variantClasses = {
  note: "border-info-solid [&>svg]:text-info-solid",
  tip: "border-success-solid [&>svg]:text-success-solid",
  important: "border-accent-solid [&>svg]:text-accent-solid",
  warning: "border-warning-fg [&>svg]:text-warning-fg",
  caution: "border-danger-solid [&>svg]:text-danger-solid",
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
  /** Semantic roles: info, success, accent, warning, danger. GitHub callout names remain aliases. */
  variant?:
    "note" | "tip" | "important" | "warning" | "caution" | "info" | "success" | "accent" | "danger";
  /**
   * Title text for the alert. If not provided, displays the variant name capitalized.
   */
  title?: string;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 min-h-4 font-medium", className)}
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

function AlertRoot({ className, variant: role = "note", title, children, ...props }: AlertProps) {
  const variant =
    role === "info"
      ? "note"
      : role === "success"
        ? "tip"
        : role === "accent"
          ? "important"
          : role === "danger"
            ? "caution"
            : role;
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

export { AlertDescription, AlertTitle };

export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
});
